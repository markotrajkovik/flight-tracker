import { useState, useMemo, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
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
  selectedFlight: ProcessedFlight | null;
  flyToFlight: ProcessedFlight | null;
  onSelectFlight: (selectedFlight: ProcessedFlight | null) => void;
}

const WORLD_BOUNDS: L.LatLngBoundsExpression = [
  [-85, -180], // bottom left
  [85, 180], // top right
];

function MapFlyController({
  targetFlight,
}: {
  targetFlight: ProcessedFlight | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (targetFlight) {
      map.flyTo([targetFlight.latitude, targetFlight.longitude], 11, {
        duration: 0.6,
      });
    }
  }, [targetFlight, map]);

  return null;
}

export function MapRenderer({
  flights,
  selectedFlight,
  flyToFlight,
  onSelectFlight,
}: MapRendererProps) {
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);

  useEffect(() => {
    if (!selectedFlight) {
      setRoutePath([]);
      return;
    }

    let isMounted = true;

    async function fetchWaypoints() {
      try {
        const token = await getOpenSkyToken();
        const response = await fetch(
          `/api/tracks/all?icao24=${selectedFlight!.icao24}&time=0`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) throw new Error("Failed to load track data");

        const data: WaypointsResponse = await response.json();
        const trimmedPath = data.path.length > 4 ? data.path.slice(0, -4) : [];

        const latLngPositions: [number, number][] = trimmedPath.map((point) => [
          point[1],
          point[2],
        ]);

        latLngPositions.push([
          selectedFlight!.latitude,
          selectedFlight!.longitude,
        ]);

        if (isMounted) {
          setRoutePath(latLngPositions);
        }
      } catch (error) {
        console.error("Error loading flight path:", error);
        if (isMounted) setRoutePath([]);
      }
    }

    fetchWaypoints();

    return () => {
      isMounted = false;
    };
  }, [
    selectedFlight?.icao24,
    selectedFlight?.latitude,
    selectedFlight?.longitude,
  ]);

  const handleDeselect = () => {
    onSelectFlight(null);
  };

  const handleMarkerClick = (flight: ProcessedFlight) => {
    if (selectedFlight?.icao24 === flight.icao24) {
      handleDeselect();
    } else {
      onSelectFlight(flight);
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

    const sorted = [...inView].sort((a, b) => b.velocity - a.velocity);
    const top100 = sorted.slice(0, 100);

    if (
      selectedFlight &&
      !top100.some((f) => f.icao24 === selectedFlight.icao24)
    ) {
      top100.pop();
      top100.push(selectedFlight);
    }

    return top100;
  }, [flights, mapBounds, selectedFlight]);

  return (
    <MapContainer
      center={[41.6, 21.7]}
      zoom={7}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
      attributionControl={false}
      maxBounds={WORLD_BOUNDS}
      maxBoundsViscosity={1.0}
    >
      <MapFlyController targetFlight={flyToFlight} />
      <MapClickHandler onMapClick={handleDeselect} />
      <MapBoundsTracker onBoundsChange={setMapBounds} />

      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=cb1_2snj_1_196c405b6bfc9b8c8c02fcd1"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        detectRetina={true}
      />

      {selectedFlight && routePath.length > 0 && (
        <Polyline
          positions={routePath}
          pathOptions={{
            color: "#cfc33a",
            weight: 3,
            dashArray: "15, 6",
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
              handleMarkerClick(flight);
            },
          }}
        >
          <Popup className="lounge-popup" autoPan={false}>
            <div className="small">
              <div className="d-flex justify-content-between gap-3 my-1">
                <span className="lounge-label fw-bold">Callsign:</span>
                <span className="lounge-value">{flight.callsign}</span>
              </div>
              <div className="d-flex justify-content-between gap-3 my-1">
                <span className="lounge-label fw-bold">Country:</span>
                <span className="lounge-value">
                  {flight.originCountry || "Unknown"}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
