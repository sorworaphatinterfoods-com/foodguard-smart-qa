// Tiny fetch helper for the Pages Functions API (/api/*).
//
// On Cloudflare Pages the Functions backend is present and talks to D1.
// On the static GitHub Pages mirror there is no backend, so callers should
// fall back to bundled mock data when this throws.

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}
