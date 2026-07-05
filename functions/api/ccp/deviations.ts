// Cloudflare Pages Functions: /api/ccp/deviations
//   GET  — list CCP deviations (newest first)
//   POST — record a disposition / progress on a deviation (no hard delete).
// Closing a deviation requires a QA verifier and a final disposition.

import { audit, json, type CcpContext } from './_shared';

interface DevRow {
  deviation_id: string;
  ccp_id: string | null;
  source_test_id: string | null;
  deviation_datetime: string;
  line_no: string | null;
  product_name: string | null;
  lot_no: string | null;
  description: string;
  root_cause: string | null;
  corrective_action: string | null;
  production_stopped: number;
  capa_id: string | null;
  hold_id: string | null;
  verified_by: string | null;
  verified_at: string | null;
  disposition: string | null;
  status: string;
}

function mapDev(r: DevRow) {
  return {
    id: r.deviation_id,
    ccpId: r.ccp_id ?? '',
    testId: r.source_test_id ?? '',
    datetime: r.deviation_datetime,
    line: r.line_no ?? '',
    product: r.product_name ?? '',
    lot: r.lot_no ?? '',
    description: r.description,
    rootCause: r.root_cause ?? '',
    correctiveAction: r.corrective_action ?? '',
    productionStopped: !!r.production_stopped,
    capaId: r.capa_id ?? '',
    holdId: r.hold_id ?? '',
    verifiedBy: r.verified_by ?? '',
    verifiedAt: r.verified_at ?? '',
    disposition: r.disposition ?? '',
    status: r.status,
  };
}

export async function onRequestGet(context: CcpContext): Promise<Response> {
  const { results } = await context.env.DB.prepare(
    `SELECT * FROM ccp_deviation_logs ORDER BY deviation_datetime DESC, created_at DESC`,
  ).all<DevRow>();
  return json(results.map(mapDev));
}

interface DevUpdateBody {
  id?: string;
  rootCause?: string;
  correctiveAction?: string;
  disposition?: string;
  status?: string; // UNDER_REVIEW | VERIFIED | CLOSED
  verifiedBy?: string;
}

export async function onRequestPost(context: CcpContext): Promise<Response> {
  const db = context.env.DB;
  const body = (await context.request.json()) as DevUpdateBody;
  if (!body.id) return json({ error: 'id is required' }, 400);

  const status = (body.status ?? '').toUpperCase();
  const closing = status === 'CLOSED' || status === 'VERIFIED';

  // A deviation cannot be closed without a QA verifier and a final disposition.
  if (closing && (!body.verifiedBy || !body.disposition)) {
    return json({ error: 'verifiedBy and disposition are required to verify/close a deviation' }, 400);
  }

  const allowed = ['OPEN', 'UNDER_REVIEW', 'VERIFIED', 'CLOSED'];
  const newStatus = allowed.includes(status) ? status : 'UNDER_REVIEW';

  await db
    .prepare(
      `UPDATE ccp_deviation_logs
         SET root_cause = COALESCE(?, root_cause),
             corrective_action = COALESCE(?, corrective_action),
             disposition = COALESCE(?, disposition),
             status = ?,
             verified_by = COALESCE(?, verified_by),
             verified_at = CASE WHEN ? THEN datetime('now') ELSE verified_at END,
             updated_at = datetime('now')
       WHERE deviation_id = ?`,
    )
    .bind(
      body.rootCause ?? null,
      body.correctiveAction ?? null,
      body.disposition ?? null,
      newStatus,
      body.verifiedBy ?? null,
      closing ? 1 : 0,
      body.id,
    )
    .run();

  await audit(db, {
    table: 'ccp_deviation_logs',
    recordId: body.id,
    action: 'UPDATE',
    summary: `status -> ${newStatus}`,
    by: body.verifiedBy ?? 'system',
  });

  return json({ id: body.id, status: newStatus });
}
