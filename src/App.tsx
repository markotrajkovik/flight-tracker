import { useFlightEngine } from "./hooks/useFlightEngine";
import "./App.css";
import { MapRenderer } from "./components/MapRenderer";

export default function App() {
  const { flights, searchTerm, setSearchTerm, isLoading } = useFlightEngine();

  return (
    <div className="d-flex flex-column vh-100 bg-light">
      {/*Top Navbar */}
      <nav
        className="navbar navbar-dark bg-dark px-3 shadow-sm"
        style={{ height: "56px" }}
      >
        <span className="navbar-brand mb-0 h1 d-flex align-items-center gap-2">
          FlightTrackerVeriGud
        </span>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-outline-light btn-sm" title="Settings">
            ⚙️
          </button>
          <button className="btn btn-outline-light btn-sm" title="Refresh">
            🔄
          </button>
        </div>
      </nav>

      {/* Main Dashboard Shell */}
      <div
        className="dashboard-container"
        style={{
          position: "relative",
          height: "calc(100vh - 56px)",
          width: "100vw",
          overflow: "hidden",
        }}
      >
        {/* Leaflet Map  */}
        <div className="map-bg h-100 w-100">
          <MapRenderer flights={flights} />
        </div>

        {/* Floating Overlay Layer */}
        <div className="map-overlay p-3 d-flex flex-column flex-md-row justify-content-between">
          {/* Left Panel: Search & Controls */}
          <div
            className="floating-panel p-3 mb-3 mb-md-0 align-self-start"
            style={{ width: "100%", maxWidth: "320px" }}
          >
            <h6 className="fw-bold mb-3">Controls & Filters</h6>

            <div className="mb-3">
              <label className="form-label small text-muted">
                Search Callsign
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. DAL123..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label small text-muted font-monospace">
                Max Altitude
              </label>
              <input type="range" className="form-range" min="0" max="40000" />
            </div>

            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="showGround"
                defaultChecked
              />
              <label className="form-check-label small" htmlFor="showGround">
                Show Ground Vehicles
              </label>
            </div>
          </div>

          {/* Right Stack: Flight Details & Telemetry */}
          <div
            className="d-flex flex-column gap-3"
            style={{ width: "100%", maxWidth: "360px" }}
          >
            {/* Top-Right Panel */}
            <div className="floating-panel p-3">
              <h6 className="fw-bold mb-2">Flight Details</h6>
              {isLoading ? (
                <div
                  className="spinner-border spinner-border-sm text-primary"
                  role="status"
                />
              ) : (
                <div className="small">
                  <p className="mb-1">
                    <strong>Active Flights:</strong> {flights.length}
                  </p>
                  <p className="mb-0 text-muted">
                    Click an aircraft on the map to view details.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom-Right Panel */}
            <div className="floating-panel p-3">
              <h6 className="fw-bold mb-2">Telemetry</h6>
              <div className="bg-light rounded border p-3 text-center text-muted small">
                Chart Placeholder
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
