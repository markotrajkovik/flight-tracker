import { useState } from "react";
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
      const response = await fetch("/mocks/waypoints.json");
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

      {flights.map((flight) => (
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
