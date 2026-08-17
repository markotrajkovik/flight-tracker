import { useState } from "react";
import { useFlightEngine } from "./hooks/useFlightEngine";
import "./App.css";
import { MapRenderer } from "./components/MapRenderer";
import { Collapse } from "react-bootstrap";

export default function App() {
  const { flights, searchTerm, setSearchTerm, isLoading } = useFlightEngine();

  // Panel Collapse State
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

  // Filter States (Ready for filtering logic)
  const [originCountry, setOriginCountry] = useState("");
  const [minAlt, setMinAlt] = useState(0);
  const [maxAlt, setMaxAlt] = useState(15000);
  const [minVel, setMinVel] = useState(0);
  const [maxVel, setMaxVel] = useState(300);
  const [showGround, setShowGround] = useState(true);

  // Slider Limits
  const ALT_MAX = 15000;
  const VEL_MAX = 300;

  return (
    <div className="d-flex flex-column vh-100 bg-light">
      {/* Top Navbar */}
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
        {/* Leaflet Map */}
        <div className="map-bg h-100 w-100">
          <MapRenderer flights={flights} />
        </div>

        {/* Floating Overlay Layer */}
        <div className="map-overlay p-3 d-flex flex-column flex-md-row justify-content-between">
          {/* Left Panel: Filters */}
          <div
            className="floating-panel p-3 mb-3 mb-md-0 align-self-start"
            style={{ width: "100%", maxWidth: "320px" }}
          >
            {/* Header: Title, Hover Info Icon & Collapsible Arrow */}
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <h6 className="fw-bold mb-0">Filters</h6>
                <span
                  className="info-icon badge rounded-pill bg-secondary"
                  title="Filter visible aircraft by callsign, origin country, altitude range, velocity range, or ground status."
                  style={{ cursor: "help", fontSize: "0.7rem" }}
                >
                  i
                </span>
              </div>
              <button
                className="btn btn-sm p-0 border-0 shadow-none text-dark "
                onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
                aria-expanded={!isFiltersCollapsed}
                aria-controls="filter-collapse"
              >
                <span
                  className={`collapse-arrow ${
                    isFiltersCollapsed ? "collapsed" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
            </div>

            {/* Collapsible Content */}
            <Collapse in={!isFiltersCollapsed}>
              <div id="filter-collapse">
                <div className="mt-3">
                  {/* 1. Search Callsign */}
                  <div className="mb-3">
                    <label className="form-label small text-muted mb-1">
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

                  {/* 2. Search Origin Country */}
                  <div className="mb-3">
                    <label className="form-label small text-muted mb-1">
                      Origin Country
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Germany..."
                      value={originCountry}
                      onChange={(e) => setOriginCountry(e.target.value)}
                    />
                  </div>

                  {/* 3. Min-Max Double Range Slider: Altitude */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label small text-muted font-monospace mb-0">
                        Altitude
                      </label>
                      <span className="small text-muted font-monospace">
                        {minAlt.toLocaleString()} - {maxAlt.toLocaleString()} m
                      </span>
                    </div>
                    <div className="range-slider-container">
                      <div className="range-slider-track-bg" />
                      <div
                        className="range-slider-track-fill"
                        style={{
                          left: `${(minAlt / ALT_MAX) * 100}%`,
                          width: `${((maxAlt - minAlt) / ALT_MAX) * 100}%`,
                        }}
                      />
                      <input
                        type="range"
                        className="range-slider-input"
                        min="0"
                        max={ALT_MAX}
                        step="100"
                        value={minAlt}
                        onChange={(e) =>
                          setMinAlt(
                            Math.min(Number(e.target.value), maxAlt - 100),
                          )
                        }
                      />
                      <input
                        type="range"
                        className="range-slider-input"
                        min="0"
                        max={ALT_MAX}
                        step="100"
                        value={maxAlt}
                        onChange={(e) =>
                          setMaxAlt(
                            Math.max(Number(e.target.value), minAlt + 100),
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* 4. Min-Max Double Range Slider: Velocity */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label small text-muted font-monospace mb-0">
                        Velocity
                      </label>
                      <span className="small text-muted font-monospace">
                        {minVel} - {maxVel} m/s
                      </span>
                    </div>
                    <div className="range-slider-container">
                      <div className="range-slider-track-bg" />
                      <div
                        className="range-slider-track-fill"
                        style={{
                          left: `${(minVel / VEL_MAX) * 100}%`,
                          width: `${((maxVel - minVel) / VEL_MAX) * 100}%`,
                        }}
                      />
                      <input
                        type="range"
                        className="range-slider-input"
                        min="0"
                        max={VEL_MAX}
                        step="5"
                        value={minVel}
                        onChange={(e) =>
                          setMinVel(
                            Math.min(Number(e.target.value), maxVel - 5),
                          )
                        }
                      />
                      <input
                        type="range"
                        className="range-slider-input"
                        min="0"
                        max={VEL_MAX}
                        step="5"
                        value={maxVel}
                        onChange={(e) =>
                          setMaxVel(
                            Math.max(Number(e.target.value), minVel + 5),
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* 5. Grounded Vehicles Switch */}
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="showGround"
                      checked={showGround}
                      onChange={(e) => setShowGround(e.target.checked)}
                    />
                    <label
                      className="form-check-label small"
                      htmlFor="showGround"
                    >
                      Show Ground Vehicles
                    </label>
                  </div>
                </div>
              </div>
            </Collapse>
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
