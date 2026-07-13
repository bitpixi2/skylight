import { useEffect, useMemo, useState } from "react";
import { RIDDELLS_CREEK_VIEWPOINT } from "@shared/index.js";
import { nextISSPass, type Tle } from "./celestial.js";

export function useNextIssPass(): number | null {
  const [tles, setTles] = useState<Tle[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/tle", { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<Tle[]> : [])
      .then(setTles)
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return useMemo(
    () => nextISSPass(
      now,
      RIDDELLS_CREEK_VIEWPOINT.lat,
      RIDDELLS_CREEK_VIEWPOINT.lon,
      tles,
    ),
    [now, tles],
  );
}
