// Airport runway geometry, drawn on the ceiling at true geographic position
// so departures and arrivals visibly line up with the runways. Melbourne
// Airport ships as the default in this fork; any other airport can be
// imported by ICAO/IATA code (resolved from the OurAirports dataset).

export interface Runway {
  leIdent: string;
  heIdent: string;
  le: [number, number]; // [lat, lon]
  he: [number, number];
  widthFt: number;
}

export interface Airport {
  icao: string;
  /** Short label drawn at the runway centroid (IATA code when known). */
  name: string;
  /** Official name, shown in the control panel. */
  fullName?: string;
  lat: number;
  lon: number;
  runways: Runway[];
}

/** Coordinates from OurAirports (YMML), refreshed 2026-07-13. */
export const MEL_AIRPORT: Airport = {
  icao: "YMML",
  name: "MEL",
  fullName: "Melbourne Airport",
  lat: -37.670732,
  lon: 144.837898,
  runways: [
    {
      leIdent: "09",
      heIdent: "27",
      le: [-37.66080093383789, 144.82200622558594],
      he: [-37.66230010986328, 144.84800720214844],
      widthFt: 148,
    },
    {
      leIdent: "16",
      heIdent: "34",
      le: [-37.6531982421875, 144.8350067138672],
      he: [-37.68579864501953, 144.84100341796875],
      widthFt: 197,
    },
  ],
};
