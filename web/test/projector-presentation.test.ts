import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG, type Aircraft } from "@shared/index.js";
import { labelLines } from "../src/display/renderer.js";
import { PROJECTOR_SKY_CONFIG } from "../src/display/projectorConfig.js";

describe("overhead projector presentation", () => {
  it("enlarges projector text and aircraft without changing dashboard defaults", () => {
    expect(PROJECTOR_SKY_CONFIG.textScale).toBeGreaterThan(DEFAULT_CONFIG.textScale);
    expect(PROJECTOR_SKY_CONFIG.glyphSizePx).toBeGreaterThan(DEFAULT_CONFIG.glyphSizePx);
    expect(DEFAULT_CONFIG.textScale).toBe(1);
    expect(DEFAULT_CONFIG.glyphSizePx).toBe(22);
  });

  it("places a verified airport route directly below the flight number", () => {
    const aircraft = {
      hex: "7c0001",
      flight: "QF432",
      origin: "MEL",
      destination: "SYD",
      lat: -37.1,
      lon: 145.0,
      destLat: -33.946,
      destLon: 151.177,
    } as Aircraft;

    const lines = labelLines(PROJECTOR_SKY_CONFIG, aircraft);
    expect(lines.slice(0, 2)).toEqual([
      { text: "QF432", kind: "title" },
      { text: "MEL → SYD", kind: "sub" },
    ]);
  });
});
