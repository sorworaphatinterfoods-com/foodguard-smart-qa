// Cloudflare Pages Function: GET /api/parameters
interface Env {
  DB: { prepare(query: string): { all<T = Record<string, unknown>>(): Promise<{ results: T[] }> } };
}

interface ParamRow {
  parameter_id: string;
  parameter_name: string | null;
  parameter_category: string | null;
  spec_limit: string | null;
  unit: string | null;
}

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  const { results } = await context.env.DB.prepare(
    `SELECT parameter_id, parameter_name, parameter_category, spec_limit, unit
     FROM parameters WHERE is_active = 1 ORDER BY parameter_id`,
  ).all<ParamRow>();

  const data = results.map((r) => ({
    id: r.parameter_id,
    name: r.parameter_name ?? r.parameter_id,
    category: r.parameter_category ?? '',
    specLimit: r.spec_limit ?? '',
    unit: r.unit ?? '',
  }));

  return Response.json(data, { headers: { 'cache-control': 'no-store' } });
}
