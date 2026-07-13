export type WeatherGlyphKind =
  | "clear-day"
  | "clear-night"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "storm";

interface WeatherGlyphProps {
  kind: WeatherGlyphKind;
}

export function weatherCondition(
  code: number,
  isDay: boolean,
): { kind: WeatherGlyphKind; label: string } {
  if (code === 0) {
    return isDay
      ? { kind: "clear-day", label: "Clear" }
      : { kind: "clear-night", label: "Clear night" };
  }
  if (code === 1) return { kind: "partly-cloudy", label: "Mostly clear" };
  if (code === 2) return { kind: "partly-cloudy", label: "Partly cloudy" };
  if (code === 3) return { kind: "cloudy", label: "Overcast" };
  if (code === 45 || code === 48) return { kind: "fog", label: "Fog" };
  if (code >= 51 && code <= 57) return { kind: "drizzle", label: "Drizzle" };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return { kind: "rain", label: code >= 80 ? "Rain showers" : "Rain" };
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return { kind: "snow", label: code >= 85 ? "Snow showers" : "Snow" };
  }
  if (code >= 95) return { kind: "storm", label: "Thunderstorm" };
  return { kind: "cloudy", label: "Cloudy" };
}

function Cloud() {
  return (
    <path
      className="weather-glyph-cloud"
      d="M18 46h28c7.2 0 12-4.4 12-10.7 0-6-4.4-10.2-10.6-10.7C45.2 17.8 39.9 14 33.3 14c-8.2 0-14.2 5.4-15.6 13.3C11.2 27.7 7 31.4 7 36.7 7 42.1 11.5 46 18 46Z"
    />
  );
}

export function WeatherGlyph({ kind }: WeatherGlyphProps) {
  const hasCloud = !["clear-day", "clear-night"].includes(kind);

  return (
    <svg className={`weather-glyph weather-glyph-${kind}`} viewBox="0 0 64 64" aria-hidden="true">
      {kind === "clear-day" && (
        <>
          <circle className="weather-glyph-sun" cx="32" cy="32" r="11" />
          <path className="weather-glyph-rays" d="M32 7v8M32 49v8M7 32h8M49 32h8M14.3 14.3l5.7 5.7M44 44l5.7 5.7M49.7 14.3 44 20M20 44l-5.7 5.7" />
        </>
      )}
      {kind === "clear-night" && (
        <path className="weather-glyph-moon" d="M42.8 48.2A20.5 20.5 0 0 1 25.1 12a21.3 21.3 0 1 0 17.7 36.2Z" />
      )}
      {kind === "partly-cloudy" && (
        <>
          <circle className="weather-glyph-sun" cx="42" cy="20" r="9" />
          <path className="weather-glyph-rays" d="M42 5v6M42 29v6M27 20h6M51 20h6M31.4 9.4l4.3 4.3M48.3 26.3l4.3 4.3M52.6 9.4l-4.3 4.3" />
        </>
      )}
      {hasCloud && <Cloud />}
      {kind === "fog" && <path className="weather-glyph-precip" d="M12 52h40M17 58h30" />}
      {kind === "drizzle" && <path className="weather-glyph-precip" d="M21 51v3M32 51v3M43 51v3" />}
      {kind === "rain" && <path className="weather-glyph-precip" d="m21 51-3 7M34 51l-3 7M47 51l-3 7" />}
      {kind === "snow" && <path className="weather-glyph-precip" d="M21 51v8M17.5 53l7 4M24.5 53l-7 4M43 51v8M39.5 53l7 4M46.5 53l-7 4" />}
      {kind === "storm" && <path className="weather-glyph-lightning" d="m35 45-9 12h8l-2 7 11-14h-8Z" />}
    </svg>
  );
}
