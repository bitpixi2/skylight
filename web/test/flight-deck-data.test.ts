import { describe, expect, it } from "vitest";
import { airlineFromCallsign } from "../src/display/AirlineLogo.js";
import { weatherCondition } from "../src/display/WeatherGlyph.js";

describe("flight deck display data", () => {
  it("matches airline branding only from a full ICAO callsign prefix", () => {
    expect(airlineFromCallsign("QFA12")?.name).toBe("Qantas");
    expect(airlineFromCallsign("VOZ847")?.name).toBe("Virgin Australia");
    expect(airlineFromCallsign("JST501")?.name).toBe("Jetstar");
    expect(airlineFromCallsign("VH-PVQ")).toBeNull();
    expect(airlineFromCallsign("POL31")).toBeNull();
  });

  it("maps live WMO conditions to readable weather glyphs", () => {
    expect(weatherCondition(0, true)).toEqual({ kind: "clear-day", label: "Clear" });
    expect(weatherCondition(0, false)).toEqual({ kind: "clear-night", label: "Clear night" });
    expect(weatherCondition(3, true)).toEqual({ kind: "cloudy", label: "Overcast" });
    expect(weatherCondition(82, true)).toEqual({ kind: "rain", label: "Rain showers" });
    expect(weatherCondition(95, true)).toEqual({ kind: "storm", label: "Thunderstorm" });
  });
});
