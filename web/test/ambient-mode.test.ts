import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "@shared/index.js";
import { kioskPanelFullscreenRequested } from "../src/lib/useAmbientMode.js";
import { kioskPanelPresentation } from "../src/display/projectorConfig.js";

describe("dashboard fullscreen targeting", () => {
  it("targets the radar panel only for the explicit kiosk 1 URL", () => {
    expect(kioskPanelFullscreenRequested("?kiosk=1")).toBe(true);
    expect(kioskPanelFullscreenRequested("?kiosk=2")).toBe(false);
    expect(kioskPanelFullscreenRequested("?kiosk=true")).toBe(false);
    expect(kioskPanelFullscreenRequested("")).toBe(false);
  });

  it("uses one rotating, restrained aircraft label in kiosk 1", () => {
    const rotating = kioskPanelPresentation(DEFAULT_CONFIG, false);
    expect(rotating.labelDensity).toBe("nearestOnly");
    expect(rotating.nearestN).toBe(6);
    expect(rotating.labelCycleSeconds).toBe(12);
    expect(rotating.routeBelowType).toBe(true);
    expect(rotating.showFields).toMatchObject({
      name: true,
      type: true,
      altitude: false,
      speed: false,
      verticalRate: false,
      destination: true,
      registration: false,
    });

    expect(kioskPanelPresentation(DEFAULT_CONFIG, true).labelCycleSeconds).toBe(0);
  });
});
