export async function onRequestGet({ env }) {
  if (!env.DB) {
    return Response.json({ error: "D1 binding DB is not configured" }, { status: 503 });
  }

  // Preserve a higher existing count. Seed the cumulative display to 1300 once,
  // then increment by one for each successful counter request.
  await env.DB.prepare(
    "INSERT INTO site_stats (id, visits) VALUES (1, 1300) ON CONFLICT(id) DO UPDATE SET visits = MAX(site_stats.visits, 1300)"
  ).run();

  await env.DB.prepare(
    "UPDATE site_stats SET visits = visits + 1 WHERE id = 1"
  ).run();

  const row = await env.DB.prepare(
    "SELECT visits FROM site_stats WHERE id = 1"
  ).first();

  return Response.json({ visits: row.visits }, {
    headers: { "Cache-Control": "no-store" }
  });
}
