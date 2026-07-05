// Cloudflare Pages Function: GET /api/ccp/devices
// Metal detector devices with their locked sensitivity settings.

import { json, type CcpContext } from './_shared';

interface DeviceRow {
  device_id: string;
  device_name: string;
  location: string | null;
  line_no: string | null;
  ccp_id: string | null;
  fe_sensitivity: number | null;
  nonfe_sensitivity: number | null;
  sus_sensitivity: number | null;
  reject_type: string | null;
  last_verified_at: string | null;
  status: string;
}

export async function onRequestGet(context: CcpContext): Promise<Response> {
  const { results } = await context.env.DB.prepare(
    `SELECT device_id, device_name, location, line_no, ccp_id,
            fe_sensitivity, nonfe_sensitivity, sus_sensitivity, reject_type,
            last_verified_at, status
     FROM metal_detector_devices
     WHERE is_active = 1
     ORDER BY device_id`,
  ).all<DeviceRow>();

  return json(
    results.map((r) => ({
      id: r.device_id,
      name: r.device_name,
      location: r.location ?? '',
      line: r.line_no ?? '',
      ccpId: r.ccp_id ?? '',
      fe: r.fe_sensitivity,
      nonFe: r.nonfe_sensitivity,
      sus: r.sus_sensitivity,
      rejectType: r.reject_type ?? '',
      lastVerifiedAt: r.last_verified_at ?? '',
      status: r.status,
    })),
  );
}
