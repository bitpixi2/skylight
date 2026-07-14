/**
 * Lightweight Melbourne orientation layer for the projected radar view.
 * These deliberately simplified local vectors give geographic context without
 * loading third-party map tiles, accounts or tracking SDKs. Airport runway
 * geometry remains the precise operational layer in shared/airport.ts.
 */

export interface MelbourneMapLine {
  kind: "coast" | "road";
  label?: string;
  points: [number, number][];
}

export interface MelbourneMapPlace {
  name: string;
  point: [number, number];
  importance: "major" | "local";
}

export const MELBOURNE_MAP_LINES: MelbourneMapLine[] = [
  {
    kind: "coast",
    label: "PORT PHILLIP",
    points: [
      [-37.897, 144.667],
      [-37.878, 144.735],
      [-37.867, 144.828],
      [-37.861, 144.897],
      [-37.841, 144.932],
      [-37.850, 144.965],
      [-37.877, 144.980],
      [-37.907, 144.995],
    ],
  },
  {
    kind: "road",
    label: "TULLAMARINE FWY",
    points: [
      [-37.6707, 144.8379],
      [-37.703, 144.870],
      [-37.746, 144.894],
      [-37.783, 144.932],
      [-37.8136, 144.9631],
    ],
  },
  {
    kind: "road",
    label: "CALDER FWY",
    points: [
      [-37.8136, 144.9631],
      [-37.766, 144.901],
      [-37.724, 144.838],
      [-37.674, 144.768],
      [-37.598, 144.721],
      [-37.4588, 144.6777],
    ],
  },
  {
    kind: "road",
    label: "WESTERN RING",
    points: [
      [-37.690, 144.905],
      [-37.723, 144.858],
      [-37.760, 144.815],
      [-37.806, 144.775],
    ],
  },
];

export const MELBOURNE_MAP_PLACES: MelbourneMapPlace[] = [
  { name: "MELBOURNE CBD", point: [-37.8136, 144.9631], importance: "major" },
  { name: "RIDDELLS CREEK", point: [-37.4588, 144.6777], importance: "major" },
  { name: "SUNBURY", point: [-37.5797, 144.7286], importance: "local" },
  { name: "GISBORNE", point: [-37.4880, 144.5911], importance: "local" },
  { name: "CRAIGIEBURN", point: [-37.5980, 144.9419], importance: "local" },
  { name: "ESSENDON", point: [-37.7490, 144.9108], importance: "local" },
];
