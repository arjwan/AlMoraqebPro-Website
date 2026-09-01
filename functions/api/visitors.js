export async function onRequestGet({ env }) {
  if (!env.DB) {
    return Response.json({ error: "D1 binding DB is not configured" }, { status: 503 });
  }

  await env.DB.prepare(
    "INSERT INTO site_stats (id, visits) VALUES (1, 1) ON CONFLICT(id) DO UPDATE SET visits = visits + 1"
  ).run();

  const row = await env.DB.prepare(
    "SELECT visits FROM site_stats WHERE id = 1"
  ).first();

  return Response.json({ visits: row?.visits ?? 1 }, {
    headers: { "Cache-Control": "no-store" }
  });
}
