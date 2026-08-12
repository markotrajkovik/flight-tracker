import { useState, useEffect, useMemo } from "react";
import type { ProcessedFlight } from "../types/flights";

export const useFlightEngine = () => {
  const [flights, setFlights] = useState<ProcessedFlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const response = await fetch("/mocks/flights.json");

        if (!response.ok)
          throw new Error(
            `Failed to load flights (Status: ${response.status})`,
          );

        const data = await response.json();
        setFlights(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlights();

    const intervalId = setInterval(() => {
      fetchFlights();
    }, 10000);

    return () => clearInterval(intervalId);
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
