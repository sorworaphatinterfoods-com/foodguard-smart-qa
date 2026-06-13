// Cloudflare Pages Function: GET /api/processes
interface Env {
  DB: { prepare(query: string): { all<T = Record<string, unknown>>(): Promise<{ results: T[] }> } };
}

interface ProcessRow {
  process_id: string;
  process_name: string | null;
  work_area: string | null;
}

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  const { results } = await context.env.DB.prepare(
    `SELECT process_id, process_name, work_area FROM processes WHERE is_active = 1 ORDER BY process_id`,
  ).all<ProcessRow>();

  const data = results.map((r) => ({
    processId: r.process_id,
    processName: r.process_name ?? r.process_id,
    area: r.work_area ?? '',
  }));

  return Response.json(data, { headers: { 'cache-control': 'no-store' } });
}
