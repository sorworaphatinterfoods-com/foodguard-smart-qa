// Cloudflare Pages Function: GET /api/ccp/thermal-dashboard
// KPI tiles for the thermal (cooking / freezing) CCP dashboard.

import { json, type CcpContext } from './_shared';

export async function onRequestGet(context: CcpContext): Promise<Response> {
  const db = context.env.DB;

  const today = await db
    .prepare(
      `SELECT
         COUNT(*) AS checks_today,
         SUM(CASE WHEN ccp_result = 'PASS' THEN 1 ELSE 0 END) AS pass_today,
         SUM(CASE WHEN ccp_result = 'FAIL' THEN 1 ELSE 0 END) AS fail_today,
         SUM(CASE WHEN stage = 'COOKING' THEN 1 ELSE 0 END) AS cooking_today,
         SUM(CASE WHEN stage = 'FREEZING' THEN 1 ELSE 0 END) AS freezing_today
       FROM thermal_monitoring_logs
       WHERE is_void = 0 AND date(log_datetime) = date('now')`,
    )
    .first<{ checks_today: number; pass_today: number; fail_today: number; cooking_today: number; freezing_today: number }>();

  // Deviations / holds / verifications tied to thermal CCP sources.
  const openDeviations = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM ccp_deviation_logs d
       WHERE d.status IN ('OPEN','UNDER_REVIEW')
         AND d.source_test_id IN (SELECT log_id FROM thermal_monitoring_logs)`,
    )
    .first<{ n: number }>();

  const onHold = await db
    .prepare(`SELECT COUNT(*) AS n FROM product_hold_records WHERE status = 'ON_HOLD' AND source_type = 'THERMAL_CCP'`)
    .first<{ n: number }>();

  const pendingVerification = await db
    .prepare(`SELECT COUNT(*) AS n FROM verification_records WHERE result = 'PENDING' AND source_type = 'THERMAL_CCP'`)
    .first<{ n: number }>();

  const lastCook = await db
    .prepare(
      `SELECT log_datetime, ccp_result, core_temp FROM thermal_monitoring_logs
       WHERE is_void = 0 AND stage = 'COOKING' ORDER BY log_datetime DESC LIMIT 1`,
    )
    .first<{ log_datetime: string; ccp_result: string; core_temp: number }>();

  const lastFreeze = await db
    .prepare(
      `SELECT log_datetime, ccp_result, core_temp FROM thermal_monitoring_logs
       WHERE is_void = 0 AND stage = 'FREEZING' ORDER BY log_datetime DESC LIMIT 1`,
    )
    .first<{ log_datetime: string; ccp_result: string; core_temp: number }>();

  const checks = today?.checks_today ?? 0;
  const pass = today?.pass_today ?? 0;
  const passRate = checks > 0 ? Math.round((pass / checks) * 1000) / 10 : null;

  return json({
    checksToday: checks,
    passRate,
    failCount: today?.fail_today ?? 0,
    cookingToday: today?.cooking_today ?? 0,
    freezingToday: today?.freezing_today ?? 0,
    openDeviations: openDeviations?.n ?? 0,
    productsOnHold: onHold?.n ?? 0,
    pendingVerification: pendingVerification?.n ?? 0,
    lastCooking: lastCook ? { at: lastCook.log_datetime, result: lastCook.ccp_result, temp: lastCook.core_temp } : null,
    lastFreezing: lastFreeze ? { at: lastFreeze.log_datetime, result: lastFreeze.ccp_result, temp: lastFreeze.core_temp } : null,
  });
}
