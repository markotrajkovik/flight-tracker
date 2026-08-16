import { useState, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import type { ProcessedFlight } from "../types/flights";
import { createAirplaneIcon } from "../utils/createAirplaneIcon";
import { MapClickHandler } from "./MapClickHandler";
import { MapBoundsTracker } from "./MapBoundsTracker";
import { getOpenSkyToken } from "../utils/getOpenSkyToken";

type PathPoint = [number, number, number, number, number, boolean];

interface WaypointsResponse {
  icao24: string;
  callsign: string;
  startTime: number;
  endTime: number;
  path: PathPoint[];
}

interface MapRendererProps {
  flights: ProcessedFlight[];
}

const WORLD_BOUNDS: L.LatLngBoundsExpression = [
  [-85, -180], // bottom left
  [85, 180], // top right
];

export function MapRenderer({ flights }: MapRendererProps) {
  const [selectedIcao24, setSelectedIcao24] = useState<string | null>(null);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);

  const handleDeselect = () => {
    setSelectedIcao24(null);
    setRoutePath([]);
  };

  const handleMarkerClick = async (icao24: string) => {
    if (selectedIcao24 === icao24) {
      // deselect already clicked marker
      handleDeselect();
      return;
    }

    setSelectedIcao24(icao24); //not selected, select it

    try {
      const token = await getOpenSkyToken();

      const response = await fetch(`/api/tracks/all?icao24=${icao24}&time=0`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Waypoint fetch has been made");
      if (!response.ok) throw new Error("Failed to load track data");

      const data: WaypointsResponse = await response.json();

      const latLngPositions: [number, number][] = data.path.map((point) => [
        point[1],
        point[2],
      ]);

      setRoutePath(latLngPositions);
    } catch (error) {
      console.error("Error loading flight path:", error);
      setRoutePath([]);
    }
  };
  const visibleFlights = useMemo(() => {
    if (!mapBounds) {
      return [...flights].sort((a, b) => b.velocity - a.velocity).slice(0, 100);
    }

    const inView = flights.filter((flight) =>
      mapBounds.contains([flight.latitude, flight.longitude]),
    );

    if (inView.length <= 100) {
      return inView;
    }

    return inView.sort((a, b) => b.velocity - a.velocity).slice(0, 100);
  }, [flights, mapBounds]);

  return (
    <MapContainer
      center={[36.0, -5.9]}
      zoom={6}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
      attributionControl={false}
      maxBounds={WORLD_BOUNDS}
      maxBoundsViscosity={1.0}
    >
      <MapClickHandler onMapClick={handleDeselect} />
      <MapBoundsTracker onBoundsChange={setMapBounds} />

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        keepBuffer={8}
      />

      {selectedIcao24 && routePath.length > 0 && (
        <Polyline
          positions={routePath}
          pathOptions={{
            color: "#e82d07",
            weight: 3,
            dashArray: "6, 6",
          }}
        />
      )}

      {visibleFlights.map((flight) => (
        <Marker
          key={flight.icao24}
          position={[flight.latitude, flight.longitude]}
          icon={createAirplaneIcon(flight.heading)}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e.originalEvent);
              handleMarkerClick(flight.icao24);
            },
          }}
        >
          <Popup>
            <div style={{ color: "#000" }}>
              <strong>Callsign:</strong> {flight.callsign || "N/A"}
              <br />
              <strong>Country:</strong> {flight.originCountry}
              <br />
              <strong>Altitude:</strong> {flight.altitude} m<br />
              <strong>Speed:</strong> {flight.velocity} m/s
              <br />
              <strong>Heading:</strong> {flight.heading}°
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
