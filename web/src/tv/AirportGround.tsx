// "Who's next" surface panel for the currently configured airport. Taxiing
// aircraft glow while parked/stationary traffic stays dim.

import { useMemo } from "react";
import { DEG, type Airport, type GroundAircraft } from "@shared/index.js";

const M_PER_LAT = 110540;
const MIN_EXTENT_M = 2300;
const VIEW = 300;
const TAXI_MIN_KT = 3;

interface AirportGroundPanelProps {
  airport: Airport;
  ground: { at: number; aircraft: GroundAircraft[] } | null;
}

export function AirportGroundPanel({
  airport,
  ground,
}: AirportGroundPanelProps): JSX.Element | null {
  const projection = useMemo(() => {
    const mPerLon = 111320 * Math.cos(airport.lat * DEG);
    const offsets = airport.runways.flatMap((runway) =>
      [runway.le, runway.he].map(([lat, lon]) => ({
        e: (lon - airport.lon) * mPerLon,
        n: (lat - airport.lat) * M_PER_LAT,
      })),
    );
    const extent = Math.max(
      MIN_EXTENT_M,
      ...offsets.map(({ e, n }) => Math.max(Math.abs(e), Math.abs(n)) * 1.15),
    );
    const toXY = (lat: number, lon: number) => ({
      x: VIEW / 2 + (((lon - airport.lon) * mPerLon) / extent) * (VIEW / 2),
      y: VIEW / 2 - (((lat - airport.lat) * M_PER_LAT) / extent) * (VIEW / 2),
    });
    return {
      toXY,
      runways: airport.runways.map((runway) => ({
        id: `${runway.leIdent}-${runway.heIdent}`,
        a: toXY(runway.le[0], runway.le[1]),
        b: toXY(runway.he[0], runway.he[1]),
      })),
    };
  }, [airport]);

  if (!ground) return null;

  const planes = ground.aircraft.filter((aircraft) => {
    const point = projection.toXY(aircraft.lat, aircraft.lon);
    return point.x >= 0 && point.x <= VIEW && point.y >= 0 && point.y <= VIEW;
  });
  const taxiing = planes
    .filter((aircraft) => (aircraft.gsKt ?? 0) >= TAXI_MIN_KT)
    .sort((a, b) => (b.gsKt ?? 0) - (a.gsKt ?? 0));
  const label = (aircraft: GroundAircraft) =>
    aircraft.flight ?? aircraft.reg ?? aircraft.hex;

  return (
    <aside className="tv-ground">
      <div className="tv-ground-title">
        {airport.name} GROUND · {planes.length} AIRCRAFT
      </div>
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="tv-ground-map">
        {projection.runways.map((runway) => (
          <line
            key={`${airport.icao}-${runway.id}`}
            x1={runway.a.x}
            y1={runway.a.y}
            x2={runway.b.x}
            y2={runway.b.y}
            className="tv-ground-runway"
          />
        ))}
        {planes.map((aircraft) => {
          const point = projection.toXY(aircraft.lat, aircraft.lon);
          const moving = (aircraft.gsKt ?? 0) >= TAXI_MIN_KT;
          const rotation = aircraft.trackDeg ?? 0;
          return (
            <g
              key={aircraft.hex}
              transform={`translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`}
              className={moving ? "tv-ground-ac moving" : "tv-ground-ac"}
            >
              <path
                d="M 0 -4.6 L 3.2 3.8 L 0 1.9 L -3.2 3.8 Z"
                transform={`rotate(${rotation.toFixed(0)})`}
              />
              {moving && (
                <text x={5} y={3} className="tv-ground-label">
                  {label(aircraft)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="tv-ground-next">
        {taxiing.length ? (
          <>
            <span className="tv-ground-next-tag">TAXIING</span>
            {taxiing.slice(0, 4).map((aircraft) => (
              <span key={aircraft.hex} className="tv-ground-next-flight">
                {label(aircraft)}
              </span>
            ))}
          </>
        ) : (
          <span className="tv-ground-next-tag idle">APRON QUIET</span>
        )}
      </div>
    </aside>
  );
}
