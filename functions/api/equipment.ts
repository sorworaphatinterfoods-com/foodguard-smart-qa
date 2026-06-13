// Cloudflare Pages Function: GET /api/equipment
interface Env {
  DB: { prepare(query: string): { all<T = Record<string, unknown>>(): Promise<{ results: T[] }> } };
}

interface EquipmentRow {
  equipment_id: string;
  equipment_name: string | null;
  equipment_type: string | null;
}

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  const { results } = await context.env.DB.prepare(
    `SELECT equipment_id, equipment_name, equipment_type
     FROM equipment WHERE is_active = 1 ORDER BY equipment_id`,
  ).all<EquipmentRow>();

  const data = results.map((r) => ({
    equipmentId: r.equipment_id,
    equipmentName: r.equipment_name ?? r.equipment_id,
    equipmentType: r.equipment_type ?? '',
  }));

  return Response.json(data, { headers: { 'cache-control': 'no-store' } });
}
