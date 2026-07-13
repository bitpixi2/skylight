import airlines from "./airlines.json";

export interface AirlineBrand {
  name: string;
  iata: string;
  icao: string;
  slug: string;
}

interface AirlineLogoProps {
  airline: AirlineBrand;
  variant: "icon" | "logo";
  className?: string;
}

const AIRLINES_BY_ICAO = new Map(
  (airlines as AirlineBrand[])
    .filter((airline) => airline.icao)
    .map((airline) => [airline.icao.toUpperCase(), airline]),
);

export function airlineFromCallsign(callsign: string | undefined): AirlineBrand | null {
  const operator = callsign?.trim().toUpperCase().match(/^([A-Z]{3})(?=\d)/)?.[1];
  return operator ? AIRLINES_BY_ICAO.get(operator) ?? null : null;
}

export function AirlineLogo({ airline, variant, className = "" }: AirlineLogoProps) {
  return (
    <img
      className={`airline-logo airline-logo-${variant} ${className}`.trim()}
      src={`/airline-logos/assets/${airline.slug}/${variant}.svg`}
      alt={`${airline.name} logo`}
    />
  );
}
