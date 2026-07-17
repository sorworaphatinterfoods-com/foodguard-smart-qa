// Cloudflare Pages Functions: /api/ccp/coldchain-logs
//   GET  — list cold-chain temperature readings
//   POST — record a reading; a temperature excursion runs the HACCP cascade.
//
// CCP rule (per monitoring point): FAIL if temp is below limit_min or above
// limit_max. For frozen storage/transport the binding limit is the upper
// bound (<= -18 C); chillers use both bounds (0–4 C). A FAIL runs the shared
// cascade (hold -> deviation -> CAPA draft -> QA verification + audit trail).

import { audit, json, makeId, raiseCcpFail, type CcpContext, type D1Database } from './_shared';

interface CcRow {
  log_id: string; log_ref: string; log_datetime: string; shift: string | null; point_id: string;
  temp: number; limit_min: number | null; limit_max: number | null;
  product_name: string | null; fg_code: string | null; lot_no: string | null;
  ccp_result: string; excursion_minutes: number | null; affected_from_time: string | null; affected_to_time: string | null;
  qty_held: number | null; qty_held_unit: string | null; corrective_action: string | null; final_disposition: string | null;
  recorded_by: string; verified_by: string | null; verified_at: string | null; remark: string | null; attachment_url: string | null;
  deviation_id: string | null; hold_id: string | null; capa_id: string | null; status: string;
  point_name: string | null; point_type: string | null;
}

function mapRow(r: CcRow) {
  return {
    id: r.log_id, ref: r.log_ref, datetime: r.log_datetime, shift: r.shift ?? '', pointId: r.point_id,
    pointName: r.point_name ?? '', pointType: r.point_type ?? '',
    temp: r.temp, limitMin: r.limit_min, limitMax: r.limit_max,
    product: r.product_name ?? '', fgCode: r.fg_code ?? '', lot: r.lot_no ?? '',
    result: r.ccp_result, excursionMinutes: r.excursion_minutes,
    affectedFrom: r.affected_from_time ?? '', affectedTo: r.affected_to_time ?? '',
    qtyHeld: r.qty_held ?? null, qtyUnit: r.qty_held_unit ?? '', correctiveAction: r.corrective_action ?? '',
    finalDisposition: r.final_disposition ?? '', recordedBy: r.recorded_by, verifiedBy: r.verified_by ?? '',
    verifiedAt: r.verified_at ?? '', remark: r.remark ?? '', attachmentUrl: r.attachment_url ?? '',
    deviationId: r.deviation_id ?? '', holdId: r.hold_id ?? '', capaId: r.capa_id ?? '', status: r.status,
  };
}

export async function onRequestGet(context: CcpContext): Promise<Response> {
  const { results } = await context.env.DB.prepare(
    `SELECT l.*, p.point_name, p.point_type
     FROM coldchain_logs l
     LEFT JOIN coldchain_points p ON p.point_id = l.point_id
     WHERE l.is_void = 0
     ORDER BY l.log_datetime DESC, l.created_at DESC`,
  ).all<CcRow>();
  return json(results.map(mapRow));
}

interface NewCcBody {
  datetime?: string; shift?: string; pointId?: string; temp?: number | string;
  product?: string; fgCode?: string; lot?: string;
  excursionMinutes?: number | string; affectedFrom?: string; affectedTo?: string;
  qtyHeld?: number | string; qtyUnit?: string; correctiveAction?: string; finalDisposition?: string;
  recordedBy?: string; remark?: string; attachmentUrl?: string;
}

export async function onRequestPost(context: CcpContext): Promise<Response> {
  const db: D1Database = context.env.DB;
  const body = (await context.request.json()) as NewCcBody;

  if (!body.pointId || !body.recordedBy) {
    return json({ error: 'pointId and recordedBy are required' }, 400);
  }
  if (body.temp === undefined || body.temp === '') {
    return json({ error: 'temp is required' }, 400);
  }
  const temp = Number(body.temp);

  const point = await db
    .prepare(
      `SELECT point_id, point_name, ccp_id, limit_min, limit_max
       FROM coldchain_points WHERE point_id = ? AND is_active = 1`,
    )
    .first<{ point_id: string; point_name: string; ccp_id: string | null; limit_min: number | null; limit_max: number | null }>();
  if (!point) return json({ error: 'monitoring point not found' }, 404);

  const limitMin = point.limit_min;
  const limitMax = point.limit_max;
  const belowMin = limitMin != null && temp < limitMin;
  const aboveMax = limitMax != null && temp > limitMax;
  const isFail = belowMin || aboveMax;
  const ccpResult = isFail ? 'FAIL' : 'PASS';
  const ccpId = point.ccp_id ?? 'CCP006';

  const logId = makeId('CC');
  const logRef = logId;
  const datetime = body.datetime || new Date().toISOString().slice(0, 16).replace('T', ' ');
  const recordedBy = body.recordedBy;
  const qtyHeld = body.qtyHeld === undefined || body.qtyHeld === '' ? null : Number(body.qtyHeld);
  const excursionMinutes =
    body.excursionMinutes === undefined || body.excursionMinutes === '' ? null : Number(body.excursionMinutes);

  let deviationId: string | null = null;
  let holdId: string | null = null;
  let capaId: string | null = null;

  if (isFail) {
    const bound = aboveMax ? `> ${limitMax}°C (max)` : `< ${limitMin}°C (min)`;
    const reason = `Cold-chain excursion at ${point.point_name}: ${temp}°C ${bound}`;
    const ids = await raiseCcpFail(db, {
      ccpId,
      sourceTable: 'coldchain_logs',
      sourceId: logId,
      sourceRef: logRef,
      verificationSourceType: 'COLDCHAIN_CCP',
      product: body.product, lot: body.lot, fgCode: body.fgCode,
      reason, correctiveAction: body.correctiveAction,
      affectedFrom: body.affectedFrom, affectedTo: body.affectedTo,
      qtyHeld, qtyUnit: body.qtyUnit, inspector: recordedBy, deviceLabel: point.point_id,
    });
    deviationId = ids.deviationId;
    holdId = ids.holdId;
    capaId = ids.capaId;
  }

  const status = isFail ? 'PENDING_VERIFICATION' : 'CLOSED';

  await db
    .prepare(
      `INSERT INTO coldchain_logs
         (log_id, log_ref, log_datetime, shift, point_id, temp, limit_min, limit_max,
          product_name, fg_code, lot_no, ccp_result, excursion_minutes, affected_from_time, affected_to_time,
          qty_held, qty_held_unit, corrective_action, final_disposition, recorded_by, remark, attachment_url,
          deviation_id, hold_id, capa_id, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      logId, logRef, datetime, body.shift ?? null, point.point_id, temp, limitMin, limitMax,
      body.product ?? null, body.fgCode ?? null, body.lot ?? null, ccpResult, excursionMinutes,
      body.affectedFrom ?? null, body.affectedTo ?? null, qtyHeld, body.qtyUnit ?? null,
      body.correctiveAction ?? null, body.finalDisposition ?? null, recordedBy, body.remark ?? null,
      body.attachmentUrl ?? null, deviationId, holdId, capaId, status, recordedBy,
    )
    .run();

  await audit(db, { table: 'coldchain_logs', recordId: logId, action: 'CREATE', summary: `Cold-chain ${point.point_id} ${ccpResult}`, by: recordedBy });

  return json({ id: logId, result: ccpResult, pointId: point.point_id, deviationId, holdId, capaId, status }, 201);
}
