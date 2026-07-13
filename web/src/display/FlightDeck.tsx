import { useEffect, useMemo, useState, type RefObject } from "react";
import {
  MI_TO_KM,
  RIDDELLS_CREEK_VIEWPOINT,
  llToMeters,
  metersToMiles,
  rangeMeters,
  type Aircraft,
} from "@shared/index.js";
import type { StreamState } from "../lib/connection.js";
import { useNextIssPass } from "./useNextIssPass.js";
import { useWeather } from "./useWeather.js";

export type DeckView = "runway" | "sky";

const MELBOURNE_TIME = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Melbourne",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZoneName: "short",
});

const MELBOURNE_DATE = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Melbourne",
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const ISS_TIME = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Melbourne",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

interface FlightDeckProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  state: StreamState;
  view: DeckView;
  autoSwitching: boolean;
  onToggleView?: () => void;
}

interface NearbyFlight {
  aircraft: Aircraft;
  distanceKm: number;
}

function windDirection(degrees: number): string {
  const points = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return points[Math.round((((degrees % 360) + 360) % 360) / 22.5) % points.length];
}

function flightName(aircraft: Aircraft): string {
  return aircraft.flight || aircraft.registration || aircraft.hex.toUpperCase();
}

function aircraftName(aircraft: Aircraft): string {
  return aircraft.typeName || aircraft.typeCode || "Aircraft";
}

function altitudeText(aircraft: Aircraft): string | null {
  const altitude = aircraft.altBaro ?? aircraft.altGeom;
  return altitude == null ? null : `${(Math.round(altitude / 100) * 100).toLocaleString()} ft`;
}

function verticalText(rate: number): string {
  const rounded = Math.round(rate / 10) * 10;
  return `${rounded > 0 ? "+" : ""}${rounded.toLocaleString()} ft/min`;
}

function movementText(aircraft: Aircraft): string {
  const rate = aircraft.baroRate ?? 0;
  if (rate > 250) return "Climbing";
  if (rate < -250) return "Descending";
  return "Level";
}

function trackText(track: number): string {
  return `${Math.round(track).toString().padStart(3, "0")}° ${windDirection(track)}`;
}

function directionArrow(track: number | undefined): string {
  if (track == null) return "·";
  return ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"][Math.round(track / 45) % 8];
}

export function FlightDeck({
  canvasRef,
  state,
  view,
  autoSwitching,
  onToggleView,
}: FlightDeckProps) {
  const [clock, setClock] = useState(() => Date.now());
  const { weather } = useWeather();
  const nextIssPass = useNextIssPass();

  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nearbyFlights = useMemo<NearbyFlight[]>(() => {
    return state.nearbyAircraft
      .filter((aircraft) => aircraft.lat != null && aircraft.lon != null)
      .map((aircraft) => {
        const local = llToMeters(
          aircraft.lat!,
          aircraft.lon!,
          RIDDELLS_CREEK_VIEWPOINT.lat,
          RIDDELLS_CREEK_VIEWPOINT.lon,
        );
        return {
          aircraft,
          distanceKm: metersToMiles(rangeMeters(local)) * MI_TO_KM,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [state.nearbyAircraft]);

  const airborneFlights = nearbyFlights.filter(({ aircraft }) => !aircraft.onGround);
  const closest = airborneFlights[0] ?? null;
  const nextFive = airborneFlights.slice(1, 6);
  const feedAgeSec = state.now ? Math.max(0, Math.round((clock - state.now) / 1000)) : null;
  const feedLive = state.connected && (state.status?.ok ?? true);
  const currentWeather = weather?.current;
  const closestAircraft = closest?.aircraft;
  const verifiedRoute = closestAircraft?.origin && closestAircraft?.destination
    ? { origin: closestAircraft.origin, destination: closestAircraft.destination }
    : null;

  return (
    <>
      <header className="deck-topbar">
        <div className="deck-brand">
          <h1>Brenton's Flight Deck</h1>
          <p>
            Melbourne airspace
            <span className={`deck-live ${feedLive ? "is-live" : "is-offline"}`}>
              <i aria-hidden="true" /> {feedLive ? "Live" : "Reconnecting"}
            </span>
          </p>
        </div>
        <div className="deck-status">
          <div className="deck-time">
            <time dateTime={new Date(clock).toISOString()}>{MELBOURNE_TIME.format(clock)}</time>
            <span>{MELBOURNE_DATE.format(clock)}</span>
          </div>
          <span className={`feed-badge ${feedLive ? "is-live" : "is-offline"}`}>
            <i aria-hidden="true" /> {feedLive ? `Feed connected${feedAgeSec != null ? ` · ${feedAgeSec}s` : ""}` : "Feed reconnecting"}
          </span>
        </div>
      </header>

      <main className="deck-main-grid">
        <section className="radar-panel" aria-label={view === "sky" ? "Looking-up sky view" : "Home-centred airspace view"}>
          <canvas ref={canvasRef} className="display-canvas" />
          <div className="radar-heading">
            <div>
              <strong>{view === "sky" ? "Looking up · Brenton's Home" : "Home-centred airspace · 50 km"}</strong>
              <span>{view === "sky" ? "Live sky positions and elevation" : "Live positions · refreshed every 3 seconds"}</span>
            </div>
            {onToggleView && (
              <button type="button" onClick={onToggleView} aria-label={`Switch to ${view === "sky" ? "airspace" : "looking-up"} view`}>
                {view === "sky" ? "Airspace" : "Look up"}
                {autoSwitching && <small>Auto · 45s</small>}
              </button>
            )}
          </div>
          {view === "runway" && (
            <div className="home-marker" aria-label="Approximate Brenton's Home viewpoint">
              <i aria-hidden="true" />
              <span>Brenton's Home</span>
            </div>
          )}
          <div className="radar-badges" aria-label="Current map context">
            {currentWeather && (
              <span>Home wind · {windDirection(currentWeather.windDirectionDeg)} {Math.round(currentWeather.windKt)} kt</span>
            )}
            <span>{view === "sky" ? "Look-up dome" : "YMML runway context"}</span>
            <span>{airborneFlights.length} aircraft in view</span>
          </div>
        </section>

        <aside className="closest-card" aria-label="Closest live aircraft">
          {closest && closestAircraft ? (
            <>
              <div className="closest-heading">
                <span>Closest aircraft</span>
                <b>{closest.distanceKm.toFixed(1)} km</b>
              </div>
              <h2>{flightName(closestAircraft)}</h2>
              {closestAircraft.airline && <p className="closest-airline">{closestAircraft.airline}</p>}

              <dl className="aircraft-identity">
                <div><dt>Aircraft</dt><dd>{aircraftName(closestAircraft)}</dd></div>
                {closestAircraft.typeCode && <div><dt>Type</dt><dd>{closestAircraft.typeCode}</dd></div>}
                {closestAircraft.registration && <div><dt>Registration</dt><dd>{closestAircraft.registration}</dd></div>}
                {closestAircraft.track != null && <div><dt>Track</dt><dd>{trackText(closestAircraft.track)}</dd></div>}
              </dl>

              <dl className="aircraft-metrics">
                {altitudeText(closestAircraft) && <div><dt>Altitude</dt><dd>{altitudeText(closestAircraft)}</dd></div>}
                {closestAircraft.gs != null && <div><dt>Ground speed</dt><dd>{Math.round(closestAircraft.gs)} kt</dd></div>}
                <div><dt>Distance</dt><dd>{closest.distanceKm.toFixed(1)} km</dd></div>
                {closestAircraft.baroRate != null && <div><dt>Vertical</dt><dd>{verticalText(closestAircraft.baroRate)}</dd></div>}
              </dl>

              {verifiedRoute && (
                <div className="verified-route">
                  <span>Verified route</span>
                  <div><b>{verifiedRoute.origin}</b><i aria-hidden="true" /><b>{verifiedRoute.destination}</b></div>
                </div>
              )}
            </>
          ) : (
            <div className="sky-idle">
              <span>Sky watch</span>
              <h2>Airspace quiet</h2>
              <p>Stars, Moon, planets and satellites remain live in the looking-up view.</p>
              <div>
                <small>Next ISS pass</small>
                <strong>{nextIssPass ? ISS_TIME.format(nextIssPass) : "Calculating…"}</strong>
              </div>
            </div>
          )}
        </aside>
      </main>

      <section className="next-strip" aria-label="Next five nearby aircraft">
        <div className="strip-intro">
          <strong>Next five</strong>
          <span>Nearest aircraft by distance from Brenton's Home</span>
        </div>
        <div className="strip-flights">
          {nextFive.length ? nextFive.map(({ aircraft, distanceKm }) => (
            <article key={aircraft.hex}>
              <div><strong>{flightName(aircraft)}</strong><b aria-label="Direction of travel">{directionArrow(aircraft.track)}</b></div>
              <span>{aircraftName(aircraft)}</span>
              <footer>
                <strong>{distanceKm.toFixed(1)} <small>km</small></strong>
                <span>{altitudeText(aircraft) ?? "Altitude unavailable"}<br />{movementText(aircraft)}</span>
              </footer>
            </article>
          )) : (
            <div className="strip-idle">No additional airborne traffic inside 50 km.</div>
          )}
        </div>
      </section>
    </>
  );
}
