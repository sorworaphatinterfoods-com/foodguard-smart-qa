// Cloudflare Pages Function: GET /api/ccp/coldchain-points
// Cold-chain monitoring points (cold rooms / chillers / freezers / reefers)
// with each point's latest reading, so the dashboard can render a live board.

import { json, type CcpContext } from './_shared';

interface PointRow {
  point_id: string; point_name: string; point_type: string; location: string | null;
  limit_min: number | null; limit_max: number | null; unit: string; target_label: string | null;
  check_interval_hours: number | null; ccp_id: string | null; status: string;
  last_temp: number | null; last_result: string | null; last_at: string | null;
}

export async function onRequestGet(context: CcpContext): Promise<Response> {
  const { results } = await context.env.DB.prepare(
    `SELECT p.point_id, p.point_name, p.point_type, p.location, p.limit_min, p.limit_max,
            p.unit, p.target_label, p.check_interval_hours, p.ccp_id, p.status,
            l.temp AS last_temp, l.ccp_result AS last_result, l.log_datetime AS last_at
     FROM coldchain_points p
     LEFT JOIN coldchain_logs l ON l.log_id = (
       SELECT log_id FROM coldchain_logs
       WHERE point_id = p.point_id AND is_void = 0
       ORDER BY log_datetime DESC, created_at DESC LIMIT 1
     )
     WHERE p.is_active = 1
     ORDER BY p.point_type, p.point_id`,
  ).all<PointRow>();

  return json(
    results.map((r) => ({
      id: r.point_id,
      name: r.point_name,
      type: r.point_type,
      location: r.location ?? '',
      limitMin: r.limit_min,
      limitMax: r.limit_max,
      unit: r.unit,
      targetLabel: r.target_label ?? '',
      checkIntervalHours: r.check_interval_hours ?? null,
      ccpId: r.ccp_id ?? '',
      status: r.status,
      lastTemp: r.last_temp,
      lastResult: r.last_result ?? '',
      lastAt: r.last_at ?? '',
    })),
  );
}
