import { useFlightEngine } from "./hooks/useFlightEngine.ts";

function App() {
  const { flights, searchTerm, setSearchTerm, isLoading } = useFlightEngine();

  if (isLoading) {
    return <p>Loading flights from mock data...</p>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Flight Tracker Test</h1>

      <input
        type="text"
        placeholder="Search callsign (e.g. DAL)..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: "8px", width: "250px", marginBottom: "16px" }}
      />

      <p>Displaying {flights.length} flight(s)</p>

      <ul>
        {flights.map((flight) => (
          <li key={flight.icao24}>
            <strong>{flight.callsign || "N/A"}</strong> — {flight.originCountry}{" "}
            ({flight.altitude}m)
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
