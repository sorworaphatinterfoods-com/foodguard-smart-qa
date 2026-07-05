// Cloudflare Pages Functions: /api/ccp/holds
//   GET  — list product hold records (on-hold first)
//   POST — set a disposition / release a held product.
// A product cannot be released while its CCP deviation is still open, and
// release requires a QA verifier (no override without QA sign-off).

import { audit, json, type CcpContext } from './_shared';

interface HoldRow {
  hold_id: string;
  source_ref: string | null;
  deviation_id: string | null;
  product_name: string | null;
  fg_code: string | null;
  lot_no: string | null;
  line_no: string | null;
  affected_from_time: string | null;
  affected_to_time: string | null;
  qty_held: number | null;
  qty_unit: string | null;
  hold_reason: string | null;
  disposition: string | null;
  released_by: string | null;
  released_at: string | null;
  status: string;
}

function mapHold(r: HoldRow) {
  return {
    id: r.hold_id,
    sourceRef: r.source_ref ?? '',
    deviationId: r.deviation_id ?? '',
    product: r.product_name ?? '',
    fgCode: r.fg_code ?? '',
    lot: r.lot_no ?? '',
    line: r.line_no ?? '',
    affectedFrom: r.affected_from_time ?? '',
    affectedTo: r.affected_to_time ?? '',
    qtyHeld: r.qty_held ?? null,
    qtyUnit: r.qty_unit ?? '',
    reason: r.hold_reason ?? '',
    disposition: r.disposition ?? 'PENDING',
    releasedBy: r.released_by ?? '',
    releasedAt: r.released_at ?? '',
    status: r.status,
  };
}

export async function onRequestGet(context: CcpContext): Promise<Response> {
  const { results } = await context.env.DB.prepare(
    `SELECT * FROM product_hold_records
     ORDER BY CASE status WHEN 'ON_HOLD' THEN 0 ELSE 1 END, created_at DESC`,
  ).all<HoldRow>();
  return json(results.map(mapHold));
}

interface HoldUpdateBody {
  id?: string;
  disposition?: string; // RELEASE | REWORK | REJECT | DESTROY
  releasedBy?: string;
}

export async function onRequestPost(context: CcpContext): Promise<Response> {
  const db = context.env.DB;
  const body = (await context.request.json()) as HoldUpdateBody;
  if (!body.id) return json({ error: 'id is required' }, 400);

  const disposition = (body.disposition ?? '').toUpperCase();
  const allowed = ['PENDING', 'RELEASE', 'REWORK', 'REJECT', 'DESTROY'];
  if (!allowed.includes(disposition)) {
    return json({ error: 'invalid disposition' }, 400);
  }

  // Any disposition other than PENDING is a release/quarantine decision and
  // needs QA sign-off — no override without a verifier.
  if (disposition !== 'PENDING' && !body.releasedBy) {
    return json({ error: 'releasedBy (QA) is required to disposition a hold' }, 400);
  }

  const hold = await db
    .prepare(`SELECT hold_id, deviation_id, status FROM product_hold_records WHERE hold_id = ?`)
    .first<{ hold_id: string; deviation_id: string | null; status: string }>();
  if (!hold) return json({ error: 'hold not found' }, 404);

  // Guard: cannot release while the linked CCP deviation is still open.
  if (disposition === 'RELEASE' && hold.deviation_id) {
    const dev = await db
      .prepare(`SELECT status FROM ccp_deviation_logs WHERE deviation_id = ?`)
      .first<{ status: string }>();
    if (dev && dev.status !== 'CLOSED' && dev.status !== 'VERIFIED') {
      return json(
        { error: 'Cannot release: linked CCP deviation is still open. Verify/close it first.' },
        409,
      );
    }
  }

  const newStatus =
    disposition === 'RELEASE' ? 'RELEASED' : disposition === 'PENDING' ? 'ON_HOLD' : 'DISPOSED';

  await db
    .prepare(
      `UPDATE product_hold_records
         SET disposition = ?, status = ?,
             released_by = COALESCE(?, released_by),
             released_at = CASE WHEN ? THEN datetime('now') ELSE released_at END,
             updated_at = datetime('now')
       WHERE hold_id = ?`,
    )
    .bind(disposition, newStatus, body.releasedBy ?? null, disposition !== 'PENDING' ? 1 : 0, body.id)
    .run();

  await audit(db, {
    table: 'product_hold_records',
    recordId: body.id,
    action: 'UPDATE',
    summary: `${disposition} (${newStatus})`,
    by: body.releasedBy ?? 'system',
  });

  return json({ id: body.id, disposition, status: newStatus });
}
