// Cloudflare Pages Function: GET /api/ccp/thermal-equipment
// Cookers / blast freezers / probes with their locked stage + critical limit.

import { json, type CcpContext } from './_shared';

interface EqRow {
  equipment_id: string; equipment_name: string; equipment_type: string;
  stage: string | null; location: string | null; line_no: string | null;
  ccp_id: string | null; last_calibrated_at: string | null; status: string;
}

export async function onRequestGet(context: CcpContext): Promise<Response> {
  const { results } = await context.env.DB.prepare(
    `SELECT e.equipment_id, e.equipment_name, e.equipment_type, e.stage, e.location, e.line_no,
            e.ccp_id, e.last_calibrated_at, e.status,
            l.limit_value, l.limit_direction, l.unit, l.min_hold_minutes
     FROM thermal_equipment e
     LEFT JOIN thermal_ccp_limits l ON l.stage = e.stage AND l.is_current = 1
     WHERE e.is_active = 1
     ORDER BY e.equipment_type, e.equipment_id`,
  ).all<EqRow & Record<string, unknown>>();

  return json(
    results.map((r) => ({
      id: r.equipment_id,
      name: r.equipment_name,
      type: r.equipment_type,
      stage: r.stage ?? '',
      location: r.location ?? '',
      line: r.line_no ?? '',
      ccpId: r.ccp_id ?? '',
      lastCalibratedAt: r.last_calibrated_at ?? '',
      status: r.status,
      limitValue: (r.limit_value as number) ?? null,
      limitDirection: (r.limit_direction as string) ?? '',
      unit: (r.unit as string) ?? 'C',
      minHoldMinutes: (r.min_hold_minutes as number) ?? null,
    })),
  );
}
