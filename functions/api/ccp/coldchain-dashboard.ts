// Cloudflare Pages Function: GET /api/ccp/coldchain-dashboard
// KPI tiles for the cold-chain monitoring dashboard.

import { json, type CcpContext } from './_shared';

export async function onRequestGet(context: CcpContext): Promise<Response> {
  const db = context.env.DB;

  const today = await db
    .prepare(
      `SELECT COUNT(*) AS checks_today,
              SUM(CASE WHEN ccp_result = 'PASS' THEN 1 ELSE 0 END) AS pass_today,
              SUM(CASE WHEN ccp_result = 'FAIL' THEN 1 ELSE 0 END) AS fail_today
       FROM coldchain_logs
       WHERE is_void = 0 AND date(log_datetime) = date('now')`,
    )
    .first<{ checks_today: number; pass_today: number; fail_today: number }>();

  const points = await db
    .prepare(`SELECT COUNT(*) AS n FROM coldchain_points WHERE is_active = 1`)
    .first<{ n: number }>();

  // Points whose most recent reading is a FAIL (currently in alarm).
  const inAlarm = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM coldchain_points p
       WHERE p.is_active = 1 AND (
         SELECT l.ccp_result FROM coldchain_logs l
         WHERE l.point_id = p.point_id AND l.is_void = 0
         ORDER BY l.log_datetime DESC, l.created_at DESC LIMIT 1
       ) = 'FAIL'`,
    )
    .first<{ n: number }>();

  const onHold = await db
    .prepare(`SELECT COUNT(*) AS n FROM product_hold_records WHERE status = 'ON_HOLD' AND source_type = 'COLDCHAIN_CCP'`)
    .first<{ n: number }>();

  const pendingVerification = await db
    .prepare(`SELECT COUNT(*) AS n FROM verification_records WHERE result = 'PENDING' AND source_type = 'COLDCHAIN_CCP'`)
    .first<{ n: number }>();

  const openDeviations = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM ccp_deviation_logs d
       WHERE d.status IN ('OPEN','UNDER_REVIEW')
         AND d.source_test_id IN (SELECT log_id FROM coldchain_logs)`,
    )
    .first<{ n: number }>();

  const checks = today?.checks_today ?? 0;
  const pass = today?.pass_today ?? 0;
  const passRate = checks > 0 ? Math.round((pass / checks) * 1000) / 10 : null;

  return json({
    checksToday: checks,
    passRate,
    failCount: today?.fail_today ?? 0,
    totalPoints: points?.n ?? 0,
    pointsInAlarm: inAlarm?.n ?? 0,
    productsOnHold: onHold?.n ?? 0,
    pendingVerification: pendingVerification?.n ?? 0,
    openDeviations: openDeviations?.n ?? 0,
  });
}
