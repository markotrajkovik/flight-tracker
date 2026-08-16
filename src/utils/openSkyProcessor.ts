import type { ProcessedFlight } from "../types/flights";

type OpenSkyStateVector = [
  string, // [0] icao24
  string | null, // [1] callsign
  string, // [2] origin_country
  number | null, // [3] time_position
  number | null, // [4] last_contact
  number | null, // [5] longitude
  number | null, // [6] latitude
  number | null, // [7] baro_altitude
  boolean, // [8] on_ground
  number | null, // [9] velocity
  number | null, // [10] true_track (heading)
  number | null, // [11] vertical_rate
  number[] | null, // [12] sensors
  number | null, // [13] geo_altitude
  string | null, // [14] squawk
  boolean, // [15] spi
  number, // [16] position_source
  number?, // [17] category (optional in some OpenSky responses)
];

interface OpenSkyResponse {
  time: number;
  states: OpenSkyStateVector[] | null;
}

export function parseOpenSkyResponse(data: OpenSkyResponse): ProcessedFlight[] {
  if (!data.states) {
    console.error("No airplane information received");
    return [];
  }

  return data.states
    .filter((state) => state[5] !== null && state[6] !== null)
    .map((state) => ({
      icao24: state[0],
      callsign: state[1] ? state[1].trim() : "N/A",
      originCountry: state[2],
      longitude: state[5]!,
      latitude: state[6]!,
      altitude: Math.round(state[7] ?? 0),
      velocity: Math.round(state[9] ?? 0),
      heading: Math.round(state[10] ?? 0),
      verticalRate: Math.round(state[11] ?? 0),
      onGround: state[8],
      source: state[16] ?? 0,
      category: state[17] ?? 0,
    }));
}
