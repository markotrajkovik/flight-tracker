import { useState, useEffect, useMemo } from "react";
import { useFlightEngine } from "./hooks/useFlightEngine";
import "./App.css";
import { MapRenderer } from "./components/MapRenderer";
import { Collapse } from "react-bootstrap";
import type { ProcessedFlight } from "./types/flights";
import "bootstrap-icons/font/bootstrap-icons.css";

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
    isDebouncing,
  } = useFlightEngine();

  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);

  const [activeTab, setActiveTab] = useState<"details" | "recents">("details");
  const [selectedIcao24, setSelectedIcao24] = useState<string | null>(null);

  const selectedFlight = useMemo(
    () => flights.find((f) => f.icao24 === selectedIcao24) ?? null,
    [flights, selectedIcao24],
  );
  const [flyToFlight, setFlyToFlight] = useState<ProcessedFlight | null>(null);
  const [recentFlights, setRecentFlights] = useState<RecentFlightItem[]>([]);

  // Real-time clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
    setSelectedIcao24(flight?.icao24 ?? null);
    setFlyToFlight(null);
    if (flight) {
      addToRecents(flight);
    }
  };

  const handleSelectFromRecents = (flight: ProcessedFlight) => {
    setSelectedIcao24(flight.icao24);
    setFlyToFlight(flight);
    addToRecents(flight);
  };

  return (
    <div className="d-flex flex-column vh-100 lounge-app">
      {/* Top Navbar */}
      <nav className="lounge-navbar px-4 shadow-sm" style={{ height: "56px" }}>
        <div className="nav-left">
          <span className="mb-0 h5">Cosmic Console</span>
        </div>
        <div className="nav-center clock-text">
          {currentTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
        <div className="nav-right date-text lounge-label">
          {currentTime.toLocaleDateString(undefined, {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
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
        <div className="map-overlay p-4 d-flex flex-column flex-md-row justify-content-between">
          {/* Left Panel: Filters */}
          <div
            className="lounge-panel p-3 mb-3 mb-md-0 align-self-start"
            style={{ width: "100%", maxWidth: "320px" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2">
                <h6 className="mb-0 panel-title">Filters</h6>
                <i
                  className="bi bi-info-circle-fill ms-1 lounge-label"
                  title="Filter visible aircraft by callsign, origin country, altitude range, velocity range, or ground status.
                  Text filters match by containing characters, not starting or ending with."
                  style={{ cursor: "help", fontSize: "0.85rem", opacity: 0.75 }}
                />

                {(isDebouncing || isLoading) && (
                  <div
                    className="spinner-border spinner-border-sm lounge-accent"
                    role="status"
                    style={{
                      width: "0.85rem",
                      height: "0.85rem",
                      borderWidth: "1.5px",
                    }}
                  >
                    <span className="visually-hidden">Filtering...</span>
                  </div>
                )}
              </div>
              <button
                className="btn btn-sm p-0 border-0 shadow-none lounge-text"
                onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
                aria-expanded={!isFiltersCollapsed}
                aria-controls="filter-collapse"
              >
                <span
                  className={`collapse-arrow ${isFiltersCollapsed ? "collapsed" : ""}`}
                >
                  ▼
                </span>
              </button>
            </div>

            <Collapse in={!isFiltersCollapsed}>
              <div id="filter-collapse">
                <div className="mt-2">
                  {/* 1. Search Callsign */}
                  <div className="mb-3">
                    <label className="form-label small mb-1 lounge-label">
                      Search Callsign
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm lounge-input"
                      placeholder="e.g. DAL123..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* 2. Search Origin Country */}
                  <div className="mb-3">
                    <label className="form-label small mb-1 lounge-label">
                      Search Origin Country
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm lounge-input"
                      placeholder="e.g. Germany..."
                      value={originCountry}
                      onChange={(e) => setOriginCountry(e.target.value)}
                    />
                  </div>

                  {/* 3. Altitude Slider */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label small mb-0 lounge-label">
                        Altitude
                      </label>
                      <span className="small lounge-value">
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
                      <label className="form-label small mb-0 lounge-label">
                        Velocity
                      </label>
                      <span className="small lounge-value">
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
                  <div className="form-check form-switch mb-0 d-flex align-items-center gap-2">
                    <input
                      className="form-check-input lounge-switch"
                      type="checkbox"
                      id="showGround"
                      checked={showGround}
                      onChange={(e) => setShowGround(e.target.checked)}
                    />
                    <label
                      className="form-check-label small lounge-label m-0"
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
            className="lounge-panel p-3 align-self-start"
            style={{ width: "100%", maxWidth: "380px" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="mb-0 panel-title">Flight Monitor</h6>
              <button
                className="btn btn-sm p-0 border-0 shadow-none lounge-text"
                onClick={() => setIsDetailsCollapsed(!isDetailsCollapsed)}
                aria-expanded={!isDetailsCollapsed}
                aria-controls="details-collapse"
              >
                <span
                  className={`collapse-arrow ${isDetailsCollapsed ? "collapsed" : ""}`}
                >
                  ▼
                </span>
              </button>
            </div>

            <Collapse in={!isDetailsCollapsed}>
              <div id="details-collapse">
                {/* Tab Navigation Headers */}
                <div className="d-flex justify-content-around lounge-tabs-container mb-3">
                  <button
                    type="button"
                    className={`lounge-tab ${activeTab === "details" ? "active" : ""}`}
                    onClick={() => setActiveTab("details")}
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    className={`lounge-tab ${activeTab === "recents" ? "active" : ""}`}
                    onClick={() => setActiveTab("recents")}
                  >
                    Recent Flights ({recentFlights.length})
                  </button>
                </div>

                <div className="tab-content">
                  {isLoading ? (
                    <div className="d-flex justify-content-center py-3">
                      <div
                        className="spinner-border spinner-border-sm lounge-accent"
                        role="status"
                      />
                    </div>
                  ) : activeTab === "details" ? (
                    /* TAB 1: DETAILS PANEL */
                    <div className="lounge-details">
                      <div className="small mb-3 pb-2 border-bottom border-secondary d-flex justify-content-between align-items-center">
                        <span className="lounge-label">Active Flights:</span>
                        <span className="badge lounge-badge">
                          {flights.length}
                        </span>
                      </div>

                      {selectedFlight ? (
                        <div className="flight-info-details small">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="fs-6 panel-title">
                              {selectedFlight.callsign || "N/A"}
                            </span>
                            <span className="lounge-value">
                              {selectedFlight.icao24?.toUpperCase()}
                            </span>
                          </div>

                          <ul className="list-unstyled mb-3 lounge-list">
                            <li className="d-flex justify-content-between py-1">
                              <span className="lounge-label fw-bold">
                                Origin Country:
                              </span>
                              <span className="lounge-value">
                                {selectedFlight.originCountry || "Unknown"}
                              </span>
                            </li>
                            <li className="d-flex justify-content-between py-1">
                              <span className="lounge-label fw-bold">
                                Coordinates:
                              </span>
                              <span className="lounge-value">
                                {selectedFlight.latitude?.toFixed(4)}°,{" "}
                                {selectedFlight.longitude?.toFixed(4)}°
                              </span>
                            </li>
                            <li className="d-flex justify-content-between py-1">
                              <span className="lounge-label fw-bold">
                                Altitude:
                              </span>
                              <span className="lounge-value">
                                {selectedFlight.altitude != null
                                  ? `${selectedFlight.altitude.toLocaleString()} m`
                                  : "N/A"}
                              </span>
                            </li>
                            <li className="d-flex justify-content-between py-1">
                              <span className="lounge-label fw-bold">
                                Velocity:
                              </span>
                              <span className="lounge-value">
                                {selectedFlight.velocity != null
                                  ? `${selectedFlight.velocity} m/s`
                                  : "N/A"}
                              </span>
                            </li>
                            <li className="d-flex justify-content-between py-1">
                              <span className="lounge-label fw-bold">
                                Heading:
                              </span>
                              <span className="lounge-value">
                                {selectedFlight.heading != null
                                  ? `${selectedFlight.heading}°`
                                  : "N/A"}
                              </span>
                            </li>
                            <li className="d-flex justify-content-between py-1">
                              <span className="lounge-label fw-bold">
                                Vertical Rate:
                              </span>
                              <span className="lounge-value">
                                {selectedFlight.verticalRate != null
                                  ? `${selectedFlight.verticalRate} m/s`
                                  : "N/A"}
                              </span>
                            </li>
                            <li className="d-flex justify-content-between py-1">
                              <span className="lounge-label fw-bold">
                                Status:
                              </span>
                              <span
                                className={`lounge-value ${selectedFlight.onGround ? "text-warning" : "text-success"}`}
                              >
                                {selectedFlight.onGround
                                  ? "On Ground"
                                  : "In Flight"}
                              </span>
                            </li>
                          </ul>
                        </div>
                      ) : (
                        <div className="p-3 text-center small lounge-label">
                          <p className="mb-0">
                            Click an aircraft on the map to view detailed flight
                            parameters.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* TAB 2: RECENT FLIGHTS TABLE (Matches image_b4735d.png exactly) */
                    <div className="table-responsive small">
                      {recentFlights.length > 0 ? (
                        <table className="lounge-table w-100">
                          <thead>
                            <tr>
                              <th className="text-start fw-bold">ICA024</th>
                              <th className="text-start fw-bold">Country</th>
                              <th className="text-end fw-bold">Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentFlights.map(({ flight, timestamp }) => {
                              const isSelected =
                                selectedFlight?.icao24 === flight.icao24;
                              return (
                                <tr
                                  key={flight.icao24}
                                  className={isSelected ? "selected-row" : ""}
                                  onClick={() =>
                                    handleSelectFromRecents(flight)
                                  }
                                >
                                  <td className="text-start">
                                    {flight.icao24.toUpperCase()}
                                  </td>
                                  <td className="text-start">
                                    {flight.originCountry || "Unknown"}
                                  </td>
                                  <td className="text-end">{timestamp}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-3 text-center small lounge-label">
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
