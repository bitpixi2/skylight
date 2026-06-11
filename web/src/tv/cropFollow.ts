// Crop-follow prediction: where is the plane in the frame RIGHT NOW?
//
// The tracker broadcasts vision detections at ~10 Hz, and each one describes
// a video frame that is already detection.ageMs old by the time it arrives.
// The previous stabilizer eased toward that stale sample, so between samples
// the crop sat still while the plane drifted, then caught up — a 10 Hz judder
// with built-in lag. This module instead estimates the plane's in-frame pixel
// velocity from consecutive samples and extrapolates it forward to the
// display frame's timestamp, so the crop transform can ride a continuous
// predicted path at 60 fps and the EMA downstream only has jitter to remove.
//
// Pure and time-injected (no Date.now/DOM) so it unit-tests deterministically.

/** EMA factor applied per fresh sample to the velocity estimate. */
const VEL_EMA = 0.4;
/** |velocity| cap, frame-fractions/s — nothing real crosses faster. */
const V_MAX = 0.6;
/** New-sample gap above this resets velocity (vision dropout / new pass). */
const MAX_GAP_MS = 1500;
/** Position jump above this is a target switch, not motion — reset velocity. */
const MAX_JUMP = 0.25;
/** Never extrapolate further than this past the sample (stale = stop moving). */
const MAX_EXTRAP_MS = 1200;
/** Samples closer together than this are rebroadcasts of the same detection. */
const MIN_SAMPLE_GAP_MS = 20;

export interface CropSample {
  /** Detection centre, frame fractions 0..1 (top-left origin). */
  cx: number;
  cy: number;
  /** Age of the detection at the time `now` was taken, ms. */
  ageMs: number;
}

export class CropFollow {
  private px = 0.5;
  private py = 0.5;
  private vx = 0;
  private vy = 0;
  private sampleAt = Number.NEGATIVE_INFINITY; // capture time of last sample
  private hasSample = false;

  /**
   * Offer the latest broadcast detection. The same underlying detection is
   * rebroadcast with a grown ageMs every state tick — `now - ageMs` recovers
   * its capture time, which dedupes rebroadcasts regardless of arrival jitter.
   */
  feed(s: CropSample, now: number): void {
    const t = now - s.ageMs;
    if (!this.hasSample) {
      this.px = s.cx;
      this.py = s.cy;
      this.sampleAt = t;
      this.hasSample = true;
      return;
    }
    const dtMs = t - this.sampleAt;
    if (dtMs < MIN_SAMPLE_GAP_MS) return; // rebroadcast, not a new detection
    const jump = Math.hypot(s.cx - this.px, s.cy - this.py);
    if (dtMs > MAX_GAP_MS || jump > MAX_JUMP) {
      // Dropout or a different plane: position is trustworthy, velocity isn't.
      this.vx = 0;
      this.vy = 0;
    } else {
      const dt = dtMs / 1000;
      const clamp = (v: number) => Math.max(-V_MAX, Math.min(V_MAX, v));
      this.vx = clamp(this.vx + ((s.cx - this.px) / dt - this.vx) * VEL_EMA);
      this.vy = clamp(this.vy + ((s.cy - this.py) / dt - this.vy) * VEL_EMA);
    }
    this.px = s.cx;
    this.py = s.cy;
    this.sampleAt = t;
  }

  /**
   * Predicted plane centre at `now + leadMs`. leadMs trims the constant
   * pipeline offset: positive if the crop trails the plane on screen,
   * negative if it leads (the TV's own video delay can exceed vision's).
   */
  predict(now: number, leadMs = 0): { cx: number; cy: number } {
    if (!this.hasSample) return { cx: 0.5, cy: 0.5 };
    const dt = Math.min(MAX_EXTRAP_MS, Math.max(0, now - this.sampleAt + leadMs)) / 1000;
    return { cx: this.px + this.vx * dt, cy: this.py + this.vy * dt };
  }

  /** ms since the last fresh sample (Infinity before the first). */
  sampleAgeMs(now: number): number {
    return this.hasSample ? now - this.sampleAt : Number.POSITIVE_INFINITY;
  }

  reset(): void {
    this.hasSample = false;
    this.vx = 0;
    this.vy = 0;
  }
}
