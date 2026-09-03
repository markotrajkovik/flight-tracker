import { useEffect } from "react";
import { useMapEvents } from "react-leaflet";

interface MapBoundsTrackerProps {
  onBoundsChange: (bounds: L.LatLngBounds) => void;
}

export function MapBoundsTracker({ onBoundsChange }: MapBoundsTrackerProps) {
  const map = useMapEvents({
    moveend: () => onBoundsChange(map.getBounds()),
    zoomend: () => onBoundsChange(map.getBounds()),
  });

  useEffect(() => {
    // get initial map bounds
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);

  return null;
}
