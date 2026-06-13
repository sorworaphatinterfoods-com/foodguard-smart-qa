// Cloudflare Pages Function: GET /api/materials
// Lightweight raw-material master (code + name) for form pickers.

interface Env {
  DB: {
    prepare(query: string): {
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
    };
  };
}

interface MaterialRow {
  material_code: string;
  material_name: string | null;
}

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  const { results } = await context.env.DB.prepare(
    `SELECT material_code, material_name FROM raw_materials ORDER BY material_code`,
  ).all<MaterialRow>();

  const data = results.map((r) => ({
    materialId: r.material_code,
    materialName: r.material_name ?? r.material_code,
  }));

  return Response.json(data, { headers: { 'cache-control': 'no-store' } });
}
