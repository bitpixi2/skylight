// Cached callsign route enrichment for the hosted displays. The local Pi
// server already performs this lookup; hosted Vercel builds use this small
// endpoint so route data does not disappear when there is no Pi.

const ROUTE_API = "https://api.adsbdb.com/v0/callsign";
const CALLSIGN_RE = /^[A-Z0-9]{2,10}$/;

function airport(raw) {
  if (!raw || typeof raw !== "object") return {};
  return {
    code: raw.iata_code ?? raw.icao_code,
    name: raw.municipality,
    lat: Number.isFinite(raw.latitude) ? raw.latitude : undefined,
    lon: Number.isFinite(raw.longitude) ? raw.longitude : undefined,
  };
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "method not allowed" });
  }

  const callsign = new URL(request.url, "https://localhost").searchParams
    .get("callsign")
    ?.trim()
    .toUpperCase();
  if (!callsign || !CALLSIGN_RE.test(callsign)) {
    response.setHeader("Cache-Control", "no-store");
    return response.status(400).json({ error: "invalid callsign" });
  }

  try {
    const upstream = await fetch(`${ROUTE_API}/${encodeURIComponent(callsign)}`, {
      headers: { "User-Agent": "brentons-overhead/0.1" },
      signal: AbortSignal.timeout(8000),
    });
    if (!upstream.ok) {
      response.setHeader("Cache-Control", "public, s-maxage=1800, stale-if-error=3600");
      return response.status(404).json({ route: null });
    }

    const body = await upstream.json();
    const flightRoute = body?.response?.flightroute;
    if (!flightRoute) {
      response.setHeader("Cache-Control", "public, s-maxage=1800, stale-if-error=3600");
      return response.status(404).json({ route: null });
    }

    const origin = airport(flightRoute.origin);
    const destination = airport(flightRoute.destination);
    const route = {
      airline: flightRoute.airline?.name,
      origin: origin.code,
      destination: destination.code,
      originName: origin.name,
      destName: destination.name,
      originLat: origin.lat,
      originLon: origin.lon,
      destLat: destination.lat,
      destLon: destination.lon,
    };
    if (!route.origin && !route.destination) {
      response.setHeader("Cache-Control", "public, s-maxage=1800, stale-if-error=3600");
      return response.status(404).json({ route: null });
    }

    // Routes change much less often than positions. Cache each callsign at the
    // edge so a three-second aircraft poll never hammers the enrichment source.
    response.setHeader(
      "Cache-Control",
      "public, s-maxage=43200, stale-while-revalidate=86400, stale-if-error=86400",
    );
    return response.status(200).json({ route });
  } catch (error) {
    response.setHeader("Cache-Control", "no-store");
    return response.status(502).json({
      route: null,
      error: error instanceof Error ? error.message : "route source unavailable",
    });
  }
}
