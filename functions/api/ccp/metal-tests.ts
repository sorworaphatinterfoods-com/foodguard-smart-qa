// Cloudflare Pages Functions: /api/ccp/metal-tests
//   GET  — list metal detector CCP test records (newest first)
//   POST — create a new CCP monitoring record and run the HACCP cascade.
//
// CCP validation (HACCP): the result is FAIL if ANY test piece fails
// (Fe / Non-Fe / SUS) OR the reject mechanism is NG. Every FAIL automatically:
//   1. stops production            (production_stopped = 1)
//   2. holds the affected product  (product_hold_records)
//   3. raises a CCP deviation      (ccp_deviation_logs)
//   4. drafts a CAPA               (capa_actions, status 'Draft')
//   5. opens a QA verification     (verification_records, PENDING)
//   6. leaves the test PENDING_VERIFICATION until QA signs off.
// Each write is mirrored into the immutable audit_logs trail.

import { audit, json, makeId, type CcpContext, type D1Database } from './_shared';

interface TestRow {
  test_id: string;
  test_ref: string;
  test_datetime: string;
  shift: string | null;
  line_no: string | null;
  product_name: string | null;
  fg_code: string | null;
  lot_no: string | null;
  device_id: string;
  frequency_type: string;
  fe_result: string;
  nonfe_result: string;
  sus_result: string;
  reject_mechanism: string;
  ccp_result: string;
  production_stopped: number;
  affected_from_time: string | null;
  affected_to_time: string | null;
  qty_held: number | null;
  qty_held_unit: string | null;
  corrective_action: string | null;
  final_disposition: string | null;
  inspector: string;
  verified_by: string | null;
  verified_at: string | null;
  remark: string | null;
  attachment_url: string | null;
  deviation_id: string | null;
  hold_id: string | null;
  capa_id: string | null;
  status: string;
}

function mapTest(row: TestRow) {
  return {
    id: row.test_id,
    ref: row.test_ref,
    datetime: row.test_datetime,
    shift: row.shift ?? '',
    line: row.line_no ?? '',
    product: row.product_name ?? '',
    fgCode: row.fg_code ?? '',
    lot: row.lot_no ?? '',
    deviceId: row.device_id,
    frequencyType: row.frequency_type,
    fe: row.fe_result,
    nonFe: row.nonfe_result,
    sus: row.sus_result,
    rejectMechanism: row.reject_mechanism,
    result: row.ccp_result,
    productionStopped: !!row.production_stopped,
    affectedFrom: row.affected_from_time ?? '',
    affectedTo: row.affected_to_time ?? '',
    qtyHeld: row.qty_held ?? null,
    qtyUnit: row.qty_held_unit ?? '',
    correctiveAction: row.corrective_action ?? '',
    finalDisposition: row.final_disposition ?? '',
    inspector: row.inspector,
    verifiedBy: row.verified_by ?? '',
    verifiedAt: row.verified_at ?? '',
    remark: row.remark ?? '',
    attachmentUrl: row.attachment_url ?? '',
    deviationId: row.deviation_id ?? '',
    holdId: row.hold_id ?? '',
    capaId: row.capa_id ?? '',
    status: row.status,
  };
}

export async function onRequestGet(context: CcpContext): Promise<Response> {
  const { results } = await context.env.DB.prepare(
    `SELECT * FROM metal_detector_test_logs
     WHERE is_void = 0
     ORDER BY test_datetime DESC, created_at DESC`,
  ).all<TestRow>();
  return json(results.map(mapTest));
}

interface NewTestBody {
  datetime?: string;
  shift?: string;
  line?: string;
  product?: string;
  fgCode?: string;
  lot?: string;
  deviceId?: string;
  frequencyType?: string;
  fe?: string;
  nonFe?: string;
  sus?: string;
  rejectMechanism?: string;
  affectedFrom?: string;
  affectedTo?: string;
  qtyHeld?: number | string;
  qtyUnit?: string;
  correctiveAction?: string;
  finalDisposition?: string;
  inspector?: string;
  remark?: string;
  attachmentUrl?: string;
}

function norm(v: string | undefined, allowed: string[], fallback: string): string {
  const up = (v ?? '').toUpperCase();
  return allowed.includes(up) ? up : fallback;
}

export async function onRequestPost(context: CcpContext): Promise<Response> {
  const db: D1Database = context.env.DB;
  const body = (await context.request.json()) as NewTestBody;

  if (!body.deviceId || !body.inspector) {
    return json({ error: 'deviceId and inspector are required' }, 400);
  }

  const fe = norm(body.fe, ['PASS', 'FAIL'], 'PASS');
  const nonFe = norm(body.nonFe, ['PASS', 'FAIL'], 'PASS');
  const sus = norm(body.sus, ['PASS', 'FAIL'], 'PASS');
  const reject = norm(body.rejectMechanism, ['OK', 'NG'], 'OK');

  // HACCP rule: any failed test piece OR NG reject mechanism => CCP FAIL.
  const isFail = fe === 'FAIL' || nonFe === 'FAIL' || sus === 'FAIL' || reject === 'NG';
  const ccpResult = isFail ? 'FAIL' : 'PASS';

  const testId = makeId('MDT');
  const testRef = testId;
  const datetime = body.datetime || new Date().toISOString().slice(0, 16).replace('T', ' ');
  const inspector = body.inspector;
  const qtyHeld =
    body.qtyHeld === undefined || body.qtyHeld === '' ? null : Number(body.qtyHeld);

  let deviationId: string | null = null;
  let holdId: string | null = null;
  let capaId: string | null = null;

  if (isFail) {
    const product = body.product ?? '';
    const lot = body.lot ?? '';
    const line = body.line ?? '';
    const failedPieces = [
      fe === 'FAIL' ? 'Fe' : null,
      nonFe === 'FAIL' ? 'Non-Fe' : null,
      sus === 'FAIL' ? 'SUS' : null,
    ].filter(Boolean);
    const reasonParts = [
      failedPieces.length ? `Test piece FAIL: ${failedPieces.join(', ')}` : null,
      reject === 'NG' ? 'Reject mechanism NG' : null,
    ].filter(Boolean);
    const reason = reasonParts.join(' | ') || 'CCP FAIL';

    // 2. Hold affected product.
    holdId = makeId('HOLD');
    await db
      .prepare(
        `INSERT INTO product_hold_records
           (hold_id, source_type, source_ref, product_name, fg_code, lot_no, line_no,
            affected_from_time, affected_to_time, qty_held, qty_unit, hold_reason,
            disposition, status, created_by)
         VALUES (?, 'CCP_METAL_DETECTOR', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 'ON_HOLD', ?)`,
      )
      .bind(
        holdId, testRef, product, body.fgCode ?? null, lot, line,
        body.affectedFrom ?? null, body.affectedTo ?? null, qtyHeld, body.qtyUnit ?? null,
        reason, inspector,
      )
      .run();

    // 3. Raise CCP deviation.
    deviationId = makeId('DEV');
    await db
      .prepare(
        `INSERT INTO ccp_deviation_logs
           (deviation_id, ccp_id, source_test_id, line_no, product_name, lot_no,
            description, corrective_action, production_stopped, hold_id, status, created_by)
         VALUES (?, 'CCP001', ?, ?, ?, ?, ?, ?, 1, ?, 'OPEN', ?)`,
      )
      .bind(
        deviationId, testId, line, product, lot, reason,
        body.correctiveAction ?? null, holdId, inspector,
      )
      .run();

    // 4. Draft a CAPA (status 'Draft' — matches capa_actions CHECK constraint).
    capaId = makeId('CAPA');
    await db
      .prepare(
        `INSERT INTO capa_actions
           (capa_id, capa_type, source, source_ref, source_table, source_record_id,
            description, priority, corrective_action, status, created_at, updated_at, created_by, severity_label)
         VALUES (?, 'Corrective', 'CCP Metal Detector', ?, 'ccp_deviation_logs', ?, ?, 'CRITICAL', ?, 'Draft',
                 datetime('now'), datetime('now'), ?, 'Critical')`,
      )
      .bind(
        capaId, deviationId, deviationId,
        `CCP FAIL at metal detector (${body.deviceId}) — ${reason}. Product held: ${lot || 'n/a'}.`,
        body.correctiveAction ?? null, inspector,
      )
      .run();

    // link CAPA back onto the deviation
    await db
      .prepare(`UPDATE ccp_deviation_logs SET capa_id = ?, updated_at = datetime('now') WHERE deviation_id = ?`)
      .bind(capaId, deviationId)
      .run();
    await db
      .prepare(`UPDATE product_hold_records SET deviation_id = ?, updated_at = datetime('now') WHERE hold_id = ?`)
      .bind(deviationId, holdId)
      .run();
  }

  const status = isFail ? 'PENDING_VERIFICATION' : 'CLOSED';

  // 1. Persist the CCP monitoring record (production forced-stopped on FAIL).
  await db
    .prepare(
      `INSERT INTO metal_detector_test_logs
         (test_id, test_ref, test_datetime, shift, line_no, product_name, fg_code, lot_no,
          device_id, frequency_type, fe_result, nonfe_result, sus_result, reject_mechanism,
          ccp_result, production_stopped, affected_from_time, affected_to_time, qty_held, qty_held_unit,
          corrective_action, final_disposition, inspector, remark, attachment_url,
          deviation_id, hold_id, capa_id, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      testId, testRef, datetime, body.shift ?? null, body.line ?? null, body.product ?? null,
      body.fgCode ?? null, body.lot ?? null, body.deviceId, body.frequencyType ?? 'Production period',
      fe, nonFe, sus, reject, ccpResult, isFail ? 1 : 0,
      body.affectedFrom ?? null, body.affectedTo ?? null, qtyHeld, body.qtyUnit ?? null,
      body.correctiveAction ?? null, body.finalDisposition ?? null, inspector,
      body.remark ?? null, body.attachmentUrl ?? null,
      deviationId, holdId, capaId, status, inspector,
    )
    .run();

  // 5/6 + immutable audit trail.
  await audit(db, { table: 'metal_detector_test_logs', recordId: testId, action: 'CREATE', summary: `CCP ${ccpResult}`, by: inspector });
  if (isFail) {
    const verId = makeId('VER');
    await db
      .prepare(
        `INSERT INTO verification_records (verification_id, source_type, source_ref, verification_type, result, created_at)
         VALUES (?, 'METAL_DETECTOR_TEST', ?, 'QA', 'PENDING', datetime('now'))`,
      )
      .bind(verId, testId)
      .run();
    await audit(db, { table: 'product_hold_records', recordId: holdId!, action: 'CREATE', summary: 'Product held (CCP FAIL)', by: inspector });
    await audit(db, { table: 'ccp_deviation_logs', recordId: deviationId!, action: 'CREATE', summary: 'CCP deviation opened', by: inspector });
    await audit(db, { table: 'capa_actions', recordId: capaId!, action: 'CREATE', summary: 'CAPA draft raised', by: inspector });
  }

  return json(
    { id: testId, result: ccpResult, deviationId, holdId, capaId, status },
    201,
  );
}
