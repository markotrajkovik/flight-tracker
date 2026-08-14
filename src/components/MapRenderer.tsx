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

interface MapRendererProps {
  flights: ProcessedFlight[];
}

const WORLD_BOUNDS: L.LatLngBoundsExpression = [
  [-85, -180], // bottom left
  [85, 180], // top right
];

export function MapRenderer({ flights }: MapRendererProps) {
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
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        keepBuffer={8}
      />

      {flights.map((flight) => (
        <Marker
          key={flight.icao24}
          position={[flight.latitude, flight.longitude]}
          icon={createAirplaneIcon(flight.heading)}
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
