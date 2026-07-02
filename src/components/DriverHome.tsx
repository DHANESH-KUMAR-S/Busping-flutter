/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Play, Square, Settings, User, Navigation, Power } from "lucide-react";
import LeafletMap from "./LeafletMap";
import { UserState } from "../types";

interface DriverHomeProps {
  userState: UserState;
  onLogout: () => void;
  onNavigateToProfile: () => void;
  busLocation: { latitude: number; longitude: number; isActive: boolean } | null;
  onUpdateLocation: (lat: number, lon: number, isActive: boolean) => void;
  waitingCount: number;
}

export default function DriverHome({
  userState,
  onLogout,
  onNavigateToProfile,
  busLocation,
  onUpdateLocation,
  waitingCount,
}: DriverHomeProps) {
  const [activeTab, setActiveTab] = useState<"home" | "profile">("home");
  const [isTracking, setIsTracking] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Start location: San Francisco or custom starting center
  const [lat, setLat] = useState(37.7749);
  const [lon, setLon] = useState(-122.4194);
  const [angle, setAngle] = useState(0);

  const latRef = useRef(lat);
  const lonRef = useRef(lon);
  const angleRef = useRef(angle);

  // Keep refs in sync with state
  useEffect(() => {
    latRef.current = lat;
  }, [lat]);

  useEffect(() => {
    lonRef.current = lon;
  }, [lon]);

  useEffect(() => {
    angleRef.current = angle;
  }, [angle]);

  const simTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gpsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state initially
  useEffect(() => {
    if (busLocation && busLocation.isActive) {
      setIsTracking(true);
      setLat(busLocation.latitude);
      setLon(busLocation.longitude);
    }
  }, []);

  // Handle Simulation Loop
  useEffect(() => {
    if (isSimulating && isTracking) {
      const radius = 0.004; // ~400 meters circular track radius
      simTimerRef.current = setInterval(() => {
        const nextAngle = angleRef.current + 0.15;
        angleRef.current = nextAngle;
        setAngle(nextAngle);

        const newLat = 37.7749 + Math.cos(nextAngle) * radius;
        const newLon = -122.4194 + Math.sin(nextAngle) * radius;
        latRef.current = newLat;
        lonRef.current = newLon;
        setLat(newLat);
        setLon(newLon);
        onUpdateLocation(newLat, newLon, true);
      }, 3000);
    } else {
      if (simTimerRef.current) {
        clearInterval(simTimerRef.current);
        simTimerRef.current = null;
      }
    }

    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, [isSimulating, isTracking]);

  // Handle Mock GPS tracker updates (slight jitter when simulation is off but tracking is active)
  useEffect(() => {
    if (isTracking && !isSimulating) {
      gpsTimerRef.current = setInterval(() => {
        // Small random movement simulation
        const newLat = latRef.current + (Math.random() - 0.5) * 0.0001;
        const newLon = lonRef.current + (Math.random() - 0.5) * 0.0001;
        latRef.current = newLat;
        lonRef.current = newLon;
        setLat(newLat);
        setLon(newLon);
        onUpdateLocation(newLat, newLon, true);
      }, 3000);
    } else {
      if (gpsTimerRef.current) {
        clearInterval(gpsTimerRef.current);
        gpsTimerRef.current = null;
      }
    }

    return () => {
      if (gpsTimerRef.current) clearInterval(gpsTimerRef.current);
    };
  }, [isTracking, isSimulating]);

  const handleStartTracking = () => {
    setIsTracking(true);
    // Push immediate location update
    onUpdateLocation(lat, lon, true);
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    setIsSimulating(false);
    onUpdateLocation(lat, lon, false);
  };

  const toggleSimulation = () => {
    if (!isTracking) {
      // Must start tracking to simulate
      setIsTracking(true);
    }
    setIsSimulating(!isSimulating);
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#F5F5F5]" id="driver-home">
      {/* Dynamic Status Pill */}
      <div className="absolute top-12 left-4 right-4 z-10 pointer-events-none flex justify-between items-center">
        <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-100 flex items-center space-x-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${isTracking ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
          <span className="text-[11px] font-bold text-slate-800 tracking-wide uppercase">
            {isTracking ? (isSimulating ? "Simulation Live" : "Active Tracking") : "Offline"}
          </span>
        </div>

        {waitingCount > 0 && (
          <div className="bg-orange-500 text-white px-4 py-2 rounded-2xl shadow-lg flex items-center space-x-2 animate-bounce">
            <span className="text-sm">🙋‍♂️</span>
            <span className="text-[11px] font-extrabold tracking-wide">
              {waitingCount} WAITING
            </span>
          </div>
        )}
      </div>

      {/* Full Screen Interactive Map */}
      <div className="flex-1 relative overflow-hidden">
        <LeafletMap
          center={[lat, lon]}
          zoom={15}
          busMarker={isTracking ? { lat, lng: lon, busNumber: userState.profile?.busNumber || "12" } : null}
          userMarker={{ lat, lng: lon, role: "driver" }}
          enableRouting={false}
          height="100%"
        />
      </div>

      {/* Bottom Sheet Dashboard Overlay */}
      <div className="bg-white rounded-t-[32px] shadow-2xl border-t border-slate-100 p-6 z-20 space-y-5 shrink-0 relative pb-4">
        {/* Drag Handle Accent */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-2 mb-2" />

        {/* Header Driver info & status summary */}
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-lg shadow-sm">
              🚌
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 leading-none">
                Bus {userState.profile?.busNumber || "N/A"}
              </h4>
              <p className="text-[10px] text-slate-400 font-mono mt-1 font-semibold">
                {userState.profile?.busPlateNumber || "PLATE-N/A"} • Driver License: {userState.profile?.driverLicense || "N/A"}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors border border-slate-100"
          >
            <Power className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Controls */}
        <div className="grid grid-cols-2 gap-4">
          {isTracking ? (
            <button
              onClick={handleStopTracking}
              className="py-4 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-2xl font-bold text-xs transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Stop Tracking</span>
            </button>
          ) : (
            <button
              onClick={handleStartTracking}
              className="py-4 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl font-bold text-xs transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Tracking</span>
            </button>
          )}

          <button
            onClick={toggleSimulation}
            className={`py-4 px-4 border rounded-2xl font-bold text-xs transition-all shadow-sm flex items-center justify-center space-x-2 ${
              isSimulating
                ? "bg-orange-50 border-orange-200 text-orange-600 ring-2 ring-orange-500/10"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Navigation className={`w-4 h-4 ${isSimulating ? "animate-spin text-orange-500" : ""}`} />
            <span>{isSimulating ? "Sim Running" : "Simulate Mode"}</span>
          </button>
        </div>

        {/* Dashboard Status Metadata Row */}
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl grid grid-cols-2 gap-2 text-center text-[10px] font-semibold text-slate-500">
          <div className="border-r border-slate-200/50">
            <p className="font-mono text-slate-400">WAITING STUDENTS</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{waitingCount}</p>
          </div>
          <div>
            <p className="font-mono text-slate-400">GPS COORDINATES</p>
            <p className="text-[10px] font-mono font-bold text-slate-700 mt-1 truncate">
              {lat.toFixed(5)}, {lon.toFixed(5)}
            </p>
          </div>
        </div>

        {/* Simple Bottom Navigation Bar */}
        <div className="flex justify-around items-center pt-2 border-t border-slate-100 select-none">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center space-y-1 py-1 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === "home" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <span>🏠</span>
            <span className="text-[10px]">Home</span>
          </button>
          <button
            onClick={onNavigateToProfile}
            className="flex flex-col items-center space-y-1 py-1 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 transition-all"
          >
            <span>👤</span>
            <span className="text-[10px]">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
