// Cloudflare Pages Function: GET /api/ccp/dashboard
// Aggregated KPI tiles for the CCP / Metal Detector dashboard.

import { json, type CcpContext } from './_shared';

export async function onRequestGet(context: CcpContext): Promise<Response> {
  const db = context.env.DB;

  const today = await db
    .prepare(
      `SELECT
         COUNT(*) AS checks_today,
         SUM(CASE WHEN ccp_result = 'PASS' THEN 1 ELSE 0 END) AS pass_today,
         SUM(CASE WHEN ccp_result = 'FAIL' THEN 1 ELSE 0 END) AS fail_today
       FROM metal_detector_test_logs
       WHERE is_void = 0 AND date(test_datetime) = date('now')`,
    )
    .first<{ checks_today: number; pass_today: number; fail_today: number }>();

  const openDeviations = await db
    .prepare(`SELECT COUNT(*) AS n FROM ccp_deviation_logs WHERE status IN ('OPEN','UNDER_REVIEW')`)
    .first<{ n: number }>();

  const onHold = await db
    .prepare(`SELECT COUNT(*) AS n FROM product_hold_records WHERE status = 'ON_HOLD'`)
    .first<{ n: number }>();

  const pendingVerification = await db
    .prepare(`SELECT COUNT(*) AS n FROM verification_records WHERE result = 'PENDING'`)
    .first<{ n: number }>();

  const lastTest = await db
    .prepare(
      `SELECT test_datetime, ccp_result, device_id FROM metal_detector_test_logs
       WHERE is_void = 0 ORDER BY test_datetime DESC, created_at DESC LIMIT 1`,
    )
    .first<{ test_datetime: string; ccp_result: string; device_id: string }>();

  const devices = await db
    .prepare(
      `SELECT
         SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active,
         SUM(CASE WHEN status = 'MAINTENANCE' THEN 1 ELSE 0 END) AS maintenance,
         SUM(CASE WHEN status = 'INACTIVE' THEN 1 ELSE 0 END) AS inactive,
         COUNT(*) AS total
       FROM metal_detector_devices`,
    )
    .first<{ active: number; maintenance: number; inactive: number; total: number }>();

  const checks = today?.checks_today ?? 0;
  const pass = today?.pass_today ?? 0;
  const fail = today?.fail_today ?? 0;
  const passRate = checks > 0 ? Math.round((pass / checks) * 1000) / 10 : null;

  return json({
    checksToday: checks,
    passRate, // percent or null when no checks yet
    failCount: fail,
    openDeviations: openDeviations?.n ?? 0,
    productsOnHold: onHold?.n ?? 0,
    pendingVerification: pendingVerification?.n ?? 0,
    lastTest: lastTest
      ? { at: lastTest.test_datetime, result: lastTest.ccp_result, device: lastTest.device_id }
      : null,
    devices: {
      active: devices?.active ?? 0,
      maintenance: devices?.maintenance ?? 0,
      inactive: devices?.inactive ?? 0,
      total: devices?.total ?? 0,
    },
  });
}
