/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { LogOut, User, Navigation, MapPin, Loader, Info, HelpCircle } from "lucide-react";
import LeafletMap from "./LeafletMap";
import { UserState, BusLocation } from "../types";
import { calculateDistance, calculateETA, formatDistance, formatETA } from "../utils";

interface StudentHomeProps {
  userState: UserState;
  onLogout: () => void;
  onNavigateToProfile: () => void;
  busLocation: BusLocation | null;
  isWaiting: boolean;
  onToggleWaiting: (waiting: boolean) => void;
}

export default function StudentHome({
  userState,
  onLogout,
  onNavigateToProfile,
  busLocation,
  isWaiting,
  onToggleWaiting,
}: StudentHomeProps) {
  const [activeTab, setActiveTab] = useState<"home" | "profile">("home");
  
  // Student position - slightly offset from stop for visual clarity on the map
  const stopLat = userState.profile?.busStopLat || 37.7749;
  const stopLon = userState.profile?.busStopLon || -122.4194;
  const studentLat = stopLat + 0.001; // ~100m north
  const studentLon = stopLon + 0.001; // ~100m east

  // Calculate distances & ETAs
  let distanceMeters = 0;
  let etaMinutes = 0;
  const isBusActive = busLocation && busLocation.isActive && busLocation.busNumber === userState.profile?.busNumber;

  if (isBusActive && busLocation) {
    distanceMeters = calculateDistance(
      busLocation.latitude,
      busLocation.longitude,
      stopLat,
      stopLon
    );
    etaMinutes = calculateETA(distanceMeters);
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-[#F5F5F5]" id="student-home">
      
      {/* Top Floating Board */}
      <div className="absolute top-12 left-4 right-4 z-10 pointer-events-none flex flex-col space-y-2">
        {/* Active Bus Indicator Card */}
        <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${isBusActive ? "bg-blue-100 text-blue-600 animate-pulse" : "bg-slate-100 text-slate-400"}`}>
              🚌
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase leading-none">
                Assigned Bus {userState.profile?.busNumber || "N/A"}
              </p>
              <p className="text-xs font-extrabold text-slate-800 mt-1 leading-none">
                {isBusActive ? "Active & En Route" : "Bus Not Active Yet"}
              </p>
            </div>
          </div>
          {isBusActive && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-grow relative overflow-hidden">
        <LeafletMap
          center={[stopLat, stopLon]}
          zoom={15}
          busMarker={isBusActive && busLocation ? { lat: busLocation.latitude, lng: busLocation.longitude, busNumber: busLocation.busNumber } : null}
          stopMarker={{ lat: stopLat, lng: stopLon, name: userState.profile?.busStopName || "My Stop" }}
          userMarker={{ lat: studentLat, lng: studentLon, role: "student" }}
          enableRouting={true}
          height="100%"
        />
      </div>

      {/* Bottom Information Sheet */}
      <div className="bg-white rounded-t-[32px] p-6 shadow-2xl border-t border-slate-100 shrink-0 z-20 space-y-4 pb-4">
        {/* Drag Handle Accent */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-2 mb-2" />

        {/* Dynamic ETAs if Active */}
        {isBusActive ? (
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-50">
            <div className="bg-blue-50/50 border border-blue-100/50 p-3 rounded-2xl flex flex-col justify-center">
              <span className="text-[9px] text-blue-500 font-bold tracking-wider uppercase">Distance to Stop</span>
              <span className="text-lg font-extrabold text-blue-900 mt-0.5">{formatDistance(distanceMeters)}</span>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100/50 p-3 rounded-2xl flex flex-col justify-center">
              <span className="text-[9px] text-emerald-600 font-bold tracking-wider uppercase">ETA</span>
              <span className="text-lg font-extrabold text-emerald-900 mt-0.5">{formatETA(etaMinutes)}</span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-2xl text-slate-700 text-[11px] font-semibold flex items-center space-x-2.5">
            <span className="text-base">⚠️</span>
            <span>Waiting for the driver to launch tracking and start driving.</span>
          </div>
        )}

        {/* Bus Stop Details & Toggle Board */}
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-11 h-11 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-lg shadow-sm shrink-0">
              📍
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase leading-none">
                My Pick-Up Stop
              </p>
              <h4 className="text-xs font-extrabold text-slate-800 mt-1.5 truncate">
                {userState.profile?.busStopName || "No Stop Picked"}
              </h4>
            </div>
          </div>

          {/* I'm Waiting Toggle Action */}
          <button
            onClick={() => onToggleWaiting(!isWaiting)}
            className={`px-4 py-2.5 rounded-xl text-[11px] font-extrabold tracking-wide uppercase transition-all shadow-sm ${
              isWaiting
                ? "bg-orange-500 text-white hover:bg-orange-600 shadow-md animate-pulse"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {isWaiting ? "🙋‍♂️ I'm Waiting" : "Ping Waiting"}
          </button>
        </div>

        {/* Logout Quick Trigger */}
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold px-2">
          <span>Assigned to Bus {userState.profile?.busNumber}</span>
          <button
            onClick={onLogout}
            className="text-slate-400 hover:text-red-500 flex items-center space-x-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
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
