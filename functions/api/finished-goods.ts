// Cloudflare Pages Function: GET /api/finished-goods
interface Env {
  DB: { prepare(query: string): { all<T = Record<string, unknown>>(): Promise<{ results: T[] }> } };
}

interface FgRow {
  fg_code: string;
  fg_name: string | null;
  product_type: string | null;
}

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  const { results } = await context.env.DB.prepare(
    `SELECT fg_code, fg_name, product_type FROM finished_goods WHERE is_active = 1 ORDER BY fg_code`,
  ).all<FgRow>();

  const data = results.map((r) => ({
    productId: r.fg_code,
    productName: r.fg_name ?? r.fg_code,
    productType: r.product_type ?? '',
  }));

  return Response.json(data, { headers: { 'cache-control': 'no-store' } });
}
