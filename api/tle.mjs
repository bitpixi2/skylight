// Stateless TLE proxy for the hosted TV preview. CDN caching keeps this daily
// sky-layer dataset off the origin for normal repeat visits.

const TLE_URL = "https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle";

function parseTle(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);
  const tles = [];
  for (let index = 0; index < lines.length - 1; index++) {
    if (lines[index].startsWith("1 ") && lines[index + 1]?.startsWith("2 ")) {
      tles.push({
        name: (lines[index - 1] ?? "SAT").replace(/^0 /, "").trim(),
        line1: lines[index],
        line2: lines[index + 1],
      });
      index++;
    }
  }
  return tles;
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "method not allowed" });
  }

  try {
    const upstream = await fetch(TLE_URL, { signal: AbortSignal.timeout(15000) });
    if (!upstream.ok) throw new Error(`TLE source returned HTTP ${upstream.status}`);
    const tles = parseTle(await upstream.text());
    response.setHeader(
      "Cache-Control",
      "public, s-maxage=21600, stale-while-revalidate=86400, stale-if-error=86400",
    );
    return response.status(200).json(tles);
  } catch (error) {
    response.setHeader("Cache-Control", "no-store");
    return response.status(502).json({
      error: error instanceof Error ? error.message : "TLE source unavailable",
    });
  }
}
