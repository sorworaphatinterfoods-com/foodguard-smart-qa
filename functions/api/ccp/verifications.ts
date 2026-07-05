// Cloudflare Pages Functions: /api/ccp/verifications
//   GET  — list verification records (pending first)
//   POST — QA verification / e-signature sign-off on a metal detector test.
// Verifying a test also verifies its linked CCP deviation. A signature hash
// stands in for a real e-signature payload (e-signature ready).

import { audit, json, type CcpContext } from './_shared';

interface VerRow {
  verification_id: string;
  source_type: string;
  source_ref: string;
  verification_type: string | null;
  result: string;
  comment: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
}

export async function onRequestGet(context: CcpContext): Promise<Response> {
  const { results } = await context.env.DB.prepare(
    `SELECT v.*, t.product_name, t.lot_no, t.line_no, t.ccp_result, t.device_id, t.test_datetime
     FROM verification_records v
     LEFT JOIN metal_detector_test_logs t ON t.test_id = v.source_ref
     ORDER BY CASE v.result WHEN 'PENDING' THEN 0 ELSE 1 END, v.created_at DESC`,
  ).all<VerRow & Record<string, unknown>>();

  return json(
    results.map((r) => ({
      id: r.verification_id,
      sourceType: r.source_type,
      sourceRef: r.source_ref,
      type: r.verification_type ?? 'QA',
      result: r.result,
      comment: r.comment ?? '',
      verifiedBy: r.verified_by ?? '',
      verifiedAt: r.verified_at ?? '',
      createdAt: r.created_at,
      product: (r.product_name as string) ?? '',
      lot: (r.lot_no as string) ?? '',
      line: (r.line_no as string) ?? '',
      testResult: (r.ccp_result as string) ?? '',
      device: (r.device_id as string) ?? '',
      testAt: (r.test_datetime as string) ?? '',
    })),
  );
}

interface VerifyBody {
  id?: string;
  result?: string; // VERIFIED | REJECTED
  verifiedBy?: string;
  comment?: string;
  signatureHash?: string;
}

export async function onRequestPost(context: CcpContext): Promise<Response> {
  const db = context.env.DB;
  const body = (await context.request.json()) as VerifyBody;
  if (!body.id) return json({ error: 'id is required' }, 400);

  const result = (body.result ?? '').toUpperCase();
  if (result !== 'VERIFIED' && result !== 'REJECTED') {
    return json({ error: 'result must be VERIFIED or REJECTED' }, 400);
  }
  // No verification/override without an identified QA verifier.
  if (!body.verifiedBy) {
    return json({ error: 'verifiedBy (QA) is required' }, 400);
  }

  const ver = await db
    .prepare(`SELECT verification_id, source_ref FROM verification_records WHERE verification_id = ?`)
    .first<{ verification_id: string; source_ref: string }>();
  if (!ver) return json({ error: 'verification not found' }, 404);

  // Stand-in e-signature: hash of who+when+what. Real e-sign payload later.
  const signature =
    body.signatureHash ??
    `${body.verifiedBy}:${result}:${ver.source_ref}`;

  await db
    .prepare(
      `UPDATE verification_records
         SET result = ?, verified_by = ?, comment = ?, signature_hash = ?, verified_at = datetime('now')
       WHERE verification_id = ?`,
    )
    .bind(result, body.verifiedBy, body.comment ?? null, signature, body.id)
    .run();

  // Reflect the QA sign-off onto the source test + its deviation.
  const testStatus = result === 'VERIFIED' ? 'CLOSED' : 'PENDING_VERIFICATION';
  await db
    .prepare(
      `UPDATE metal_detector_test_logs
         SET verified_by = ?, verified_at = datetime('now'), status = ?, updated_at = datetime('now')
       WHERE test_id = ?`,
    )
    .bind(body.verifiedBy, testStatus, ver.source_ref)
    .run();

  if (result === 'VERIFIED') {
    await db
      .prepare(
        `UPDATE ccp_deviation_logs
           SET status = 'VERIFIED', verified_by = ?, verified_at = datetime('now'), updated_at = datetime('now')
         WHERE source_test_id = ? AND status IN ('OPEN','UNDER_REVIEW')`,
      )
      .bind(body.verifiedBy, ver.source_ref)
      .run();
  }

  await audit(db, {
    table: 'verification_records',
    recordId: body.id,
    action: 'VERIFY',
    summary: `${result} by ${body.verifiedBy}`,
    by: body.verifiedBy,
  });

  return json({ id: body.id, result });
}
