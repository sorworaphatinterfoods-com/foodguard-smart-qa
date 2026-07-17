// Shared D1 types + helpers for the HACCP CCP / Metal Detector module.
// Files prefixed with "_" are not routed by Cloudflare Pages; import-only.

export interface D1Result<T = Record<string, unknown>> {
  results: T[];
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
  run(): Promise<unknown>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface Env {
  DB: D1Database;
}

export interface CcpContext {
  env: Env;
  request: Request;
}

// A short, human-readable unique id, e.g. MDT-20260704-8F3A.
export function makeId(prefix: string): string {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomUUID().replace(/-/g, '').slice(0, 4).toUpperCase();
  return `${prefix}-${stamp}-${rand}`;
}

export function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { 'cache-control': 'no-store' },
  });
}

// Runs the shared HACCP CCP-FAIL cascade for any CCP source (metal detector,
// thermal, …): hold the affected product, raise a deviation, draft a CAPA,
// open a QA verification — all mirrored into the immutable audit trail.
// Returns the created record ids so the caller can link them back.
export async function raiseCcpFail(
  db: D1Database,
  opts: {
    ccpId: string;
    sourceTable: string;
    sourceId: string;
    sourceRef: string;
    verificationSourceType: string; // e.g. THERMAL_CCP / METAL_DETECTOR_TEST
    line?: string;
    product?: string;
    lot?: string;
    fgCode?: string;
    reason: string;
    correctiveAction?: string;
    affectedFrom?: string;
    affectedTo?: string;
    qtyHeld?: number | null;
    qtyUnit?: string;
    inspector: string;
    deviceLabel?: string;
  },
): Promise<{ deviationId: string; holdId: string; capaId: string; verificationId: string }> {
  const holdId = makeId('HOLD');
  await db
    .prepare(
      `INSERT INTO product_hold_records
         (hold_id, source_type, source_ref, product_name, fg_code, lot_no, line_no,
          affected_from_time, affected_to_time, qty_held, qty_unit, hold_reason,
          disposition, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 'ON_HOLD', ?)`,
    )
    .bind(
      holdId, opts.verificationSourceType, opts.sourceRef, opts.product ?? '', opts.fgCode ?? null,
      opts.lot ?? '', opts.line ?? '', opts.affectedFrom ?? null, opts.affectedTo ?? null,
      opts.qtyHeld ?? null, opts.qtyUnit ?? null, opts.reason, opts.inspector,
    )
    .run();

  const deviationId = makeId('DEV');
  await db
    .prepare(
      `INSERT INTO ccp_deviation_logs
         (deviation_id, ccp_id, source_test_id, line_no, product_name, lot_no,
          description, corrective_action, production_stopped, hold_id, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'OPEN', ?)`,
    )
    .bind(
      deviationId, opts.ccpId, opts.sourceId, opts.line ?? '', opts.product ?? '', opts.lot ?? '',
      opts.reason, opts.correctiveAction ?? null, holdId, opts.inspector,
    )
    .run();

  const capaId = makeId('CAPA');
  await db
    .prepare(
      `INSERT INTO capa_actions
         (capa_id, capa_type, source, source_ref, source_table, source_record_id,
          description, priority, corrective_action, status, created_at, updated_at, created_by, severity_label)
       VALUES (?, 'Corrective', 'CCP Monitoring', ?, 'ccp_deviation_logs', ?, ?, 'CRITICAL', ?, 'Draft',
               datetime('now'), datetime('now'), ?, 'Critical')`,
    )
    .bind(
      capaId, deviationId, deviationId,
      `CCP FAIL ${opts.deviceLabel ? `(${opts.deviceLabel}) ` : ''}— ${opts.reason}. Product held: ${opts.lot || 'n/a'}.`,
      opts.correctiveAction ?? null, opts.inspector,
    )
    .run();

  await db
    .prepare(`UPDATE ccp_deviation_logs SET capa_id = ?, updated_at = datetime('now') WHERE deviation_id = ?`)
    .bind(capaId, deviationId)
    .run();
  await db
    .prepare(`UPDATE product_hold_records SET deviation_id = ?, updated_at = datetime('now') WHERE hold_id = ?`)
    .bind(deviationId, holdId)
    .run();

  const verificationId = makeId('VER');
  await db
    .prepare(
      `INSERT INTO verification_records (verification_id, source_type, source_ref, verification_type, result, created_at)
       VALUES (?, ?, ?, 'QA', 'PENDING', datetime('now'))`,
    )
    .bind(verificationId, opts.verificationSourceType, opts.sourceId)
    .run();

  await audit(db, { table: 'product_hold_records', recordId: holdId, action: 'CREATE', summary: 'Product held (CCP FAIL)', by: opts.inspector });
  await audit(db, { table: 'ccp_deviation_logs', recordId: deviationId, action: 'CREATE', summary: 'CCP deviation opened', by: opts.inspector });
  await audit(db, { table: 'capa_actions', recordId: capaId, action: 'CREATE', summary: 'CAPA draft raised', by: opts.inspector });

  return { deviationId, holdId, capaId, verificationId };
}

// Append an immutable audit-trail row. Never updated or deleted afterwards.
export async function audit(
  db: D1Database,
  entry: {
    table: string;
    recordId: string;
    action: string;
    summary?: string;
    by?: string;
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO audit_logs (table_name, record_id, action, change_summary, changed_by, changed_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    )
    .bind(
      entry.table,
      entry.recordId,
      entry.action,
      entry.summary ?? null,
      entry.by ?? 'system',
    )
    .run();
}
