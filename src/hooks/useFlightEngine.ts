import { useState, useEffect, useMemo } from "react";
import type { ProcessedFlight } from "../types/flights";
import { parseOpenSkyResponse } from "../utils/openSkyProcessor";
import { getOpenSkyToken } from "../utils/getOpenSkyToken";

export const useFlightEngine = () => {
  const [flights, setFlights] = useState<ProcessedFlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
      return flight.callsign.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [flights, searchTerm]);

  return {
    flights: filteredFlights,
    allFlightsCount: flights.length,
    searchTerm,
    setSearchTerm,
    isLoading,
  };
};
