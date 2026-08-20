import { useState } from "react";
import { useFlightEngine } from "./hooks/useFlightEngine";
import "./App.css";
import { MapRenderer } from "./components/MapRenderer";
import { Collapse } from "react-bootstrap";
import type { ProcessedFlight } from "./types/flights";

export interface Flight {
  icao24: string;
  callsign: string;
  originCountry: string;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  heading: number;
  verticalRate: number;
  onGround: boolean;
  source: number;
}

export interface RecentFlightItem {
  flight: ProcessedFlight;
  timestamp: string;
}

export default function App() {
  const {
    flights,
    searchTerm,
    setSearchTerm,
    isLoading,
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
  } = useFlightEngine();

  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);

  const [activeTab, setActiveTab] = useState<"details" | "recents">("details");
  const [selectedFlight, setSelectedFlight] = useState<ProcessedFlight | null>(
    null,
  );
  const [flyToFlight, setFlyToFlight] = useState<ProcessedFlight | null>(null);
  const [recentFlights, setRecentFlights] = useState<RecentFlightItem[]>([]);

  // Slider Limits
  const ALT_MAX = 15000;
  const VEL_MAX = 400;

  const addToRecents = (flight: ProcessedFlight) => {
    const timeString = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setRecentFlights((prev) => {
      const filtered = prev.filter(
        (item) => item.flight.icao24 !== flight.icao24,
      );
      return [{ flight, timestamp: timeString }, ...filtered].slice(0, 5);
    });
  };

  const handleSelectFromMap = (flight: ProcessedFlight | null) => {
    setSelectedFlight(flight);
    setFlyToFlight(null);
  };

  const handleSelectFromRecents = (flight: ProcessedFlight) => {
    setSelectedFlight(flight);
    setFlyToFlight(flight);
    addToRecents(flight);
  };

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
          <MapRenderer
            flights={flights}
            selectedFlight={selectedFlight}
            flyToFlight={flyToFlight}
            onSelectFlight={handleSelectFromMap}
          />
        </div>

        {/* Floating Overlay Layer */}
        <div className="map-overlay p-3 d-flex flex-column flex-md-row justify-content-between">
          {/* Left Panel: Filters */}
          <div
            className="floating-panel p-3 mb-3 mb-md-0 align-self-start"
            style={{ width: "100%", maxWidth: "320px" }}
          >
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
                className="btn btn-sm p-0 border-0 shadow-none text-dark"
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

                  {/* 3. Altitude Slider */}
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

                  {/* 4. Velocity Slider */}
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

          {/* Right Panel: Flight Monitor with Details & Recent Tabs */}
          <div
            className="floating-panel p-3 align-self-start"
            style={{ width: "100%", maxWidth: "380px" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h6 className="fw-bold mb-0">Flight Monitor</h6>
              <button
                className="btn btn-sm p-0 border-0 shadow-none text-dark"
                onClick={() => setIsDetailsCollapsed(!isDetailsCollapsed)}
                aria-expanded={!isDetailsCollapsed}
                aria-controls="details-collapse"
              >
                <span
                  className={`collapse-arrow ${
                    isDetailsCollapsed ? "collapsed" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
            </div>

            <Collapse in={!isDetailsCollapsed}>
              <div id="details-collapse">
                {/* Tab Navigation Headers */}
                <ul className="nav nav-tabs nav-fill mb-3 small">
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link py-1 border-0 ${
                        activeTab === "details"
                          ? "active fw-bold border-bottom border-primary border-2"
                          : "text-muted"
                      }`}
                      onClick={() => setActiveTab("details")}
                    >
                      Details
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link py-1 border-0 ${
                        activeTab === "recents"
                          ? "active fw-bold border-bottom border-primary border-2"
                          : "text-muted"
                      }`}
                      onClick={() => setActiveTab("recents")}
                    >
                      Recent Flights ({recentFlights.length})
                    </button>
                  </li>
                </ul>

                <div className="tab-content">
                  {isLoading ? (
                    <div className="d-flex justify-content-center py-3">
                      <div
                        className="spinner-border spinner-border-sm text-primary"
                        role="status"
                      />
                    </div>
                  ) : activeTab === "details" ? (
                    /* TAB 1: DETAILS PANEL */
                    <>
                      <div className="small mb-3 pb-2 border-bottom d-flex justify-content-between align-items-center">
                        <span className="text-muted">Active Flights:</span>
                        <span className="badge bg-primary rounded-pill font-monospace">
                          {flights.length}
                        </span>
                      </div>

                      {selectedFlight ? (
                        <div className="flight-info-details small">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold fs-6">
                              {selectedFlight.callsign || "N/A"}
                            </span>
                            <span className="badge bg-secondary font-monospace">
                              {selectedFlight.icao24?.toUpperCase()}
                            </span>
                          </div>

                          <ul className="list-group list-group-flush border-top border-bottom mb-3">
                            <li className="list-group-item d-flex justify-content-between px-0 py-1">
                              <span className="text-muted">
                                Origin Country:
                              </span>
                              <span className="fw-semibold text-end">
                                {selectedFlight.originCountry || "Unknown"}
                              </span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between px-0 py-1">
                              <span className="text-muted">Coordinates:</span>
                              <span className="font-monospace">
                                {selectedFlight.latitude?.toFixed(4)}°,{" "}
                                {selectedFlight.longitude?.toFixed(4)}°
                              </span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between px-0 py-1">
                              <span className="text-muted">Altitude:</span>
                              <span className="font-monospace">
                                {selectedFlight.altitude != null
                                  ? `${selectedFlight.altitude.toLocaleString()} m`
                                  : "N/A"}
                              </span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between px-0 py-1">
                              <span className="text-muted">Velocity:</span>
                              <span className="font-monospace">
                                {selectedFlight.velocity != null
                                  ? `${selectedFlight.velocity} m/s`
                                  : "N/A"}
                              </span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between px-0 py-1">
                              <span className="text-muted">Heading:</span>
                              <span className="font-monospace">
                                {selectedFlight.heading != null
                                  ? `${selectedFlight.heading}°`
                                  : "N/A"}
                              </span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between px-0 py-1">
                              <span className="text-muted">Vertical Rate:</span>
                              <span className="font-monospace">
                                {selectedFlight.verticalRate != null
                                  ? `${selectedFlight.verticalRate} m/s`
                                  : "N/A"}
                              </span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between px-0 py-1">
                              <span className="text-muted">Status:</span>
                              <span
                                className={`badge ${
                                  selectedFlight.onGround
                                    ? "bg-warning text-dark"
                                    : "bg-success"
                                }`}
                              >
                                {selectedFlight.onGround
                                  ? "On Ground"
                                  : "In Flight"}
                              </span>
                            </li>
                          </ul>
                        </div>
                      ) : (
                        <div className="bg-light rounded border p-3 text-center text-muted small">
                          <p className="mb-0">
                            Click an aircraft on the map to view detailed flight
                            parameters.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    /* TAB 2: RECENT FLIGHTS TABLE */
                    <div className="table-responsive small">
                      {recentFlights.length > 0 ? (
                        <table className="table table-hover table-sm align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>ICAO24</th>
                              <th>Country</th>
                              <th className="text-end">Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentFlights.map(({ flight, timestamp }) => {
                              const isSelected =
                                selectedFlight?.icao24 === flight.icao24;
                              return (
                                <tr
                                  key={flight.icao24}
                                  style={{ cursor: "pointer" }}
                                  className={
                                    isSelected ? "table-active fw-bold" : ""
                                  }
                                  onClick={() =>
                                    handleSelectFromRecents(flight)
                                  }
                                >
                                  <td className="font-monospace text-primary fw-bold">
                                    {flight.icao24.toUpperCase()}
                                  </td>
                                  <td>{flight.originCountry || "Unknown"}</td>
                                  <td className="text-end font-monospace text-muted">
                                    {timestamp}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div className="bg-light rounded border p-3 text-center text-muted small">
                          <p className="mb-0">No recently selected flights.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Collapse>
          </div>
        </div>
      </div>
    </div>
  );
}
