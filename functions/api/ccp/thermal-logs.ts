// Cloudflare Pages Functions: /api/ccp/thermal-logs
//   GET  — list thermal CCP monitoring records (cooking / freezing)
//   POST — create a record and run the HACCP cascade on FAIL.
//
// CCP rule:
//   COOKING  — FAIL if core temp < 75 °C (below MIN limit)
//   FREEZING — FAIL if core temp > -18 °C (above MAX limit)
// A FAIL runs the shared cascade (stop production -> hold -> deviation ->
// CAPA draft -> QA verification), all written to the immutable audit trail.

import { audit, json, makeId, raiseCcpFail, type CcpContext, type D1Database } from './_shared';

interface ThermalRow {
  log_id: string; log_ref: string; log_datetime: string; shift: string | null; line_no: string | null;
  stage: string; product_name: string | null; fg_code: string | null; lot_no: string | null; batch_no: string | null;
  equipment_id: string; probe_id: string | null; frequency_type: string;
  core_temp: number | null; hold_minutes: number | null; limit_value: number | null; limit_direction: string | null;
  ccp_result: string; production_stopped: number; affected_from_time: string | null; affected_to_time: string | null;
  qty_held: number | null; qty_held_unit: string | null; corrective_action: string | null; final_disposition: string | null;
  inspector: string; verified_by: string | null; verified_at: string | null; remark: string | null; attachment_url: string | null;
  deviation_id: string | null; hold_id: string | null; capa_id: string | null; status: string;
}

function mapRow(r: ThermalRow) {
  return {
    id: r.log_id, ref: r.log_ref, datetime: r.log_datetime, shift: r.shift ?? '', line: r.line_no ?? '',
    stage: r.stage, product: r.product_name ?? '', fgCode: r.fg_code ?? '', lot: r.lot_no ?? '', batch: r.batch_no ?? '',
    equipmentId: r.equipment_id, probeId: r.probe_id ?? '', frequencyType: r.frequency_type,
    coreTemp: r.core_temp, holdMinutes: r.hold_minutes, limitValue: r.limit_value, limitDirection: r.limit_direction ?? '',
    result: r.ccp_result, productionStopped: !!r.production_stopped,
    affectedFrom: r.affected_from_time ?? '', affectedTo: r.affected_to_time ?? '',
    qtyHeld: r.qty_held ?? null, qtyUnit: r.qty_held_unit ?? '', correctiveAction: r.corrective_action ?? '',
    finalDisposition: r.final_disposition ?? '', inspector: r.inspector, verifiedBy: r.verified_by ?? '',
    verifiedAt: r.verified_at ?? '', remark: r.remark ?? '', attachmentUrl: r.attachment_url ?? '',
    deviationId: r.deviation_id ?? '', holdId: r.hold_id ?? '', capaId: r.capa_id ?? '', status: r.status,
  };
}

export async function onRequestGet(context: CcpContext): Promise<Response> {
  const { results } = await context.env.DB.prepare(
    `SELECT * FROM thermal_monitoring_logs WHERE is_void = 0
     ORDER BY log_datetime DESC, created_at DESC`,
  ).all<ThermalRow>();
  return json(results.map(mapRow));
}

interface NewThermalBody {
  datetime?: string; shift?: string; line?: string; stage?: string;
  product?: string; fgCode?: string; lot?: string; batch?: string;
  equipmentId?: string; probeId?: string; frequencyType?: string;
  coreTemp?: number | string; holdMinutes?: number | string;
  affectedFrom?: string; affectedTo?: string; qtyHeld?: number | string; qtyUnit?: string;
  correctiveAction?: string; finalDisposition?: string; inspector?: string; remark?: string; attachmentUrl?: string;
}

export async function onRequestPost(context: CcpContext): Promise<Response> {
  const db: D1Database = context.env.DB;
  const body = (await context.request.json()) as NewThermalBody;

  const stage = (body.stage ?? '').toUpperCase() === 'FREEZING' ? 'FREEZING' : 'COOKING';
  if (!body.equipmentId || !body.inspector) {
    return json({ error: 'equipmentId and inspector are required' }, 400);
  }
  if (body.coreTemp === undefined || body.coreTemp === '') {
    return json({ error: 'coreTemp is required' }, 400);
  }

  const coreTemp = Number(body.coreTemp);
  const holdMinutes =
    body.holdMinutes === undefined || body.holdMinutes === '' ? null : Number(body.holdMinutes);

  // Locked critical limit for this stage.
  const limitRow = await db
    .prepare(
      `SELECT ccp_id, limit_value, limit_direction, min_hold_minutes
       FROM thermal_ccp_limits WHERE stage = ? AND is_current = 1 LIMIT 1`,
    )
    .first<{ ccp_id: string; limit_value: number; limit_direction: string; min_hold_minutes: number | null }>();

  const limitValue = limitRow?.limit_value ?? (stage === 'COOKING' ? 75 : -18);
  const limitDirection = limitRow?.limit_direction ?? (stage === 'COOKING' ? 'MIN' : 'MAX');
  const ccpId = limitRow?.ccp_id ?? (stage === 'COOKING' ? 'CCP004' : 'CCP005');
  const minHold = limitRow?.min_hold_minutes ?? null;

  // Temperature check + optional cooking hold-time check.
  const tempFail = limitDirection === 'MIN' ? coreTemp < limitValue : coreTemp > limitValue;
  const holdFail = minHold != null && holdMinutes != null && holdMinutes < minHold;
  const isFail = tempFail || holdFail;
  const ccpResult = isFail ? 'FAIL' : 'PASS';

  const logId = makeId('THM');
  const logRef = logId;
  const datetime = body.datetime || new Date().toISOString().slice(0, 16).replace('T', ' ');
  const inspector = body.inspector;
  const qtyHeld = body.qtyHeld === undefined || body.qtyHeld === '' ? null : Number(body.qtyHeld);

  let deviationId: string | null = null;
  let holdId: string | null = null;
  let capaId: string | null = null;

  if (isFail) {
    const reasons = [
      tempFail
        ? `Core temp ${coreTemp}°C ${limitDirection === 'MIN' ? `< ${limitValue}°C (min)` : `> ${limitValue}°C (max)`}`
        : null,
      holdFail ? `Hold time ${holdMinutes} min < ${minHold} min` : null,
    ].filter(Boolean);
    const reason = `${stage === 'COOKING' ? 'Cooking' : 'Freezing'} CCP FAIL: ${reasons.join(' | ')}`;

    const ids = await raiseCcpFail(db, {
      ccpId,
      sourceTable: 'thermal_monitoring_logs',
      sourceId: logId,
      sourceRef: logRef,
      verificationSourceType: 'THERMAL_CCP',
      line: body.line, product: body.product, lot: body.lot, fgCode: body.fgCode,
      reason, correctiveAction: body.correctiveAction,
      affectedFrom: body.affectedFrom, affectedTo: body.affectedTo,
      qtyHeld, qtyUnit: body.qtyUnit, inspector, deviceLabel: body.equipmentId,
    });
    deviationId = ids.deviationId;
    holdId = ids.holdId;
    capaId = ids.capaId;
  }

  const status = isFail ? 'PENDING_VERIFICATION' : 'CLOSED';

  await db
    .prepare(
      `INSERT INTO thermal_monitoring_logs
         (log_id, log_ref, log_datetime, shift, line_no, stage, product_name, fg_code, lot_no, batch_no,
          equipment_id, probe_id, frequency_type, core_temp, hold_minutes, limit_value, limit_direction,
          ccp_result, production_stopped, affected_from_time, affected_to_time, qty_held, qty_held_unit,
          corrective_action, final_disposition, inspector, remark, attachment_url,
          deviation_id, hold_id, capa_id, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      logId, logRef, datetime, body.shift ?? null, body.line ?? null, stage, body.product ?? null,
      body.fgCode ?? null, body.lot ?? null, body.batch ?? null, body.equipmentId, body.probeId ?? null,
      body.frequencyType ?? 'Production period', coreTemp, holdMinutes, limitValue, limitDirection,
      ccpResult, isFail ? 1 : 0, body.affectedFrom ?? null, body.affectedTo ?? null, qtyHeld, body.qtyUnit ?? null,
      body.correctiveAction ?? null, body.finalDisposition ?? null, inspector, body.remark ?? null, body.attachmentUrl ?? null,
      deviationId, holdId, capaId, status, inspector,
    )
    .run();

  await audit(db, { table: 'thermal_monitoring_logs', recordId: logId, action: 'CREATE', summary: `${stage} CCP ${ccpResult}`, by: inspector });

  return json({ id: logId, result: ccpResult, stage, deviationId, holdId, capaId, status }, 201);
}
