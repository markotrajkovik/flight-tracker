import { useState, useEffect, useMemo } from "react";
import type { ProcessedFlight } from "../types/flights";
import { parseOpenSkyResponse } from "../utils/openSkyProcessor";
import { getOpenSkyToken } from "../utils/getOpenSkyToken";

export const useFlightEngine = () => {
  const [flights, setFlights] = useState<ProcessedFlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [originCountry, setOriginCountry] = useState("");
  const [minAlt, setMinAlt] = useState(0);
  const [maxAlt, setMaxAlt] = useState(15000);
  const [minVel, setMinVel] = useState(0);
  const [maxVel, setMaxVel] = useState(400);
  const [showGround, setShowGround] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchFlights = async () => {
      try {
        const token = await getOpenSkyToken();

        const response = await fetch("/api/states/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok)
          throw new Error(
            `Failed to load flights (Status: ${response.status})`,
          );

        const data = await response.json();
        const processedFlights = parseOpenSkyResponse(data);
        if (isMounted) {
          setFlights(processedFlights);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFlights();

    const intervalId = setInterval(() => {
      fetchFlights();
    }, 6000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const filteredFlights = useMemo(() => {
    return flights.filter((flight) => {
      return (
        flight.callsign.toLowerCase().includes(searchTerm.toLowerCase()) &&
        flight.originCountry
          .toLowerCase()
          .includes(originCountry.toLowerCase()) &&
        flight.altitude >= minAlt &&
        flight.altitude <= maxAlt &&
        flight.velocity >= minVel &&
        flight.velocity <= maxVel &&
        (showGround || !flight.onGround)
      );
    });
  }, [
    flights,
    searchTerm,
    originCountry,
    minAlt,
    maxAlt,
    minVel,
    maxVel,
    showGround,
  ]);

  return {
    flights: filteredFlights,
    allFlightsCount: flights.length,
    searchTerm,
    setSearchTerm,
    originCountry,
    setOriginCountry,
    minAlt,
    setMinAlt,
    maxAlt,
    setMaxAlt,
    minVel,
    setMinVel,
    maxVel,
    setMaxVel,
    showGround,
    setShowGround,
    isLoading,
  };
};
