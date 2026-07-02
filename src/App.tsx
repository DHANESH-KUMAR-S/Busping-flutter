/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Play, Code, Smartphone, Info, RefreshCw, Layers } from "lucide-react";
import LoadingScreen from "./components/LoadingScreen";
import LoginScreen from "./components/LoginScreen";
import RoleSelection from "./components/RoleSelection";
import ProfileScreen from "./components/ProfileScreen";
import DriverHome from "./components/DriverHome";
import StudentHome from "./components/StudentHome";
import PhoneSimulator from "./components/PhoneSimulator";
import FlutterExporter from "./components/FlutterExporter";
import { UserState, BusLocation, UserProfile } from "./types";

export default function App() {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"simulator" | "flutter">("simulator");

  // Device-level authentication & profiles (Simulated Firebase Auth + Firestore)
  const [driverState, setDriverState] = useState<UserState>({
    uid: "driver_123",
    email: "driver@school.edu",
    role: "driver",
    profileCompleted: true,
    profile: {
      name: "Arthur Pendelton",
      phoneNumber: "+1 (555) 019-2834",
      busNumber: "12",
      driverLicense: "DL-908212",
      busPlateNumber: "7XYZ90",
    },
  });

  const [studentState, setStudentState] = useState<UserState>({
    uid: "student_456",
    email: "student@school.edu",
    role: "student",
    profileCompleted: true,
    profile: {
      name: "Bobby Drake",
      phoneNumber: "+1 (555) 891-0192",
      busNumber: "12",
      busStopName: "Golden Gate High School",
      busStopLat: 37.7749,
      busStopLon: -122.4194,
    },
  });

  // Simulated screen navigations for both emulator devices
  const [driverScreen, setDriverScreen] = useState<"loading" | "login" | "role" | "setup" | "home">("home");
  const [studentScreen, setStudentScreen] = useState<"loading" | "login" | "role" | "setup" | "home">("home");

  // Realtime Database state
  const [busLocation, setBusLocation] = useState<BusLocation | null>({
    driverUid: "driver_123",
    busNumber: "12",
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 10,
    timestamp: Date.now(),
    isActive: false,
  });

  const [isWaiting, setIsWaiting] = useState(false);

  // Load state from SharedPreferences (localStorage)
  useEffect(() => {
    try {
      const cachedDriver = localStorage.getItem("bp_cached_driver");
      const cachedStudent = localStorage.getItem("bp_cached_student");
      const cachedLocation = localStorage.getItem("bp_cached_bus_location");
      const cachedWaiting = localStorage.getItem("bp_cached_waiting");

      if (cachedDriver) setDriverState(JSON.parse(cachedDriver));
      if (cachedStudent) setStudentState(JSON.parse(cachedStudent));
      if (cachedLocation) setBusLocation(JSON.parse(cachedLocation));
      if (cachedWaiting) setIsWaiting(JSON.parse(cachedWaiting));
    } catch (e) {
      console.warn("Could not parse cached data, defaults used.");
    }
  }, []);

  // Save states back to SharedPreferences (localStorage) when they change
  useEffect(() => {
    localStorage.setItem("bp_cached_driver", JSON.stringify(driverState));
  }, [driverState]);

  useEffect(() => {
    localStorage.setItem("bp_cached_student", JSON.stringify(studentState));
  }, [studentState]);

  useEffect(() => {
    localStorage.setItem("bp_cached_bus_location", JSON.stringify(busLocation));
  }, [busLocation]);

  useEffect(() => {
    localStorage.setItem("bp_cached_waiting", JSON.stringify(isWaiting));
  }, [isWaiting]);

  // Update real-time coordinates of the bus
  const handleUpdateLocation = (latitude: number, longitude: number, isActive: boolean) => {
    setBusLocation((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        latitude,
        longitude,
        isActive,
        timestamp: Date.now(),
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans" id="app-root">
      
      {/* Top Main Navigation Banner */}
      <header className="px-6 py-5 bg-slate-950 border-b border-slate-900 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 select-none">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-500/20">
            🚌
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center space-x-2">
              <span>BusPing</span>
              <span className="text-[10px] font-mono tracking-widest uppercase bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">
                PRO Companion
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Interactive dual-device tracking simulator & production Flutter project codebase
            </p>
          </div>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-sm">
          <button
            onClick={() => setActiveWorkspaceTab("simulator")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeWorkspaceTab === "simulator"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Interactive Simulator</span>
          </button>
          <button
            onClick={() => setActiveWorkspaceTab("flutter")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeWorkspaceTab === "flutter"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Flutter Production Source</span>
          </button>
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="flex-grow p-6 flex flex-col overflow-y-auto">
        {activeWorkspaceTab === "simulator" ? (
          <div className="space-y-6 flex flex-col items-center">
            
            {/* Quick Demo Tutorial Card */}
            <div className="max-w-4xl w-full bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-start space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-950 text-blue-400 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">How to test live synchronization:</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  1. On the <strong className="text-blue-400">Driver Phone (Left)</strong>, tap <strong className="text-emerald-400">"Start Tracking"</strong> and then toggle <strong className="text-orange-400">"Simulate Mode"</strong> to start the school bus driving. <br />
                  2. Look at the <strong className="text-blue-400">Student Phone (Right)</strong>: the green bus marker will instantly start driving along the real OSRM road routes towards the student's selected stop, automatically updating the distance and ETA on the bottom panel in real-time! <br />
                  3. Tap <strong className="text-orange-400">"Ping Waiting"</strong> on the student app to write waiting status to the database, which will raise the driver's screen alert immediately!
                </p>
              </div>
            </div>

            {/* Dual Device Emulator Grid */}
            <div className="flex flex-wrap justify-center items-center gap-10 xl:gap-14 py-4 w-full">
              
              {/* DRIVER EMULATOR */}
              <PhoneSimulator title="Arthur's Bus Dashboard" role="driver">
                {driverScreen === "loading" && (
                  <LoadingScreen onLoaded={() => setDriverScreen("login")} />
                )}
                {driverScreen === "login" && (
                  <LoginScreen
                    onLoginSuccess={(email) => {
                      setDriverState((prev) => ({ ...prev, email }));
                      setDriverScreen("role");
                    }}
                  />
                )}
                {driverScreen === "role" && (
                  <RoleSelection
                    onRoleSelected={(role) => {
                      setDriverState((prev) => ({ ...prev, role }));
                      setDriverScreen("setup");
                    }}
                    onLogout={() => setDriverScreen("login")}
                  />
                )}
                {driverScreen === "setup" && (
                  <ProfileScreen
                    userState={driverState}
                    onSaveProfile={(profile) => {
                      setDriverState((prev) => ({ ...prev, profile, profileCompleted: true }));
                      setDriverScreen("home");
                    }}
                    onLogout={() => setDriverScreen("login")}
                  />
                )}
                {driverScreen === "home" && (
                  <DriverHome
                    userState={driverState}
                    busLocation={busLocation}
                    onUpdateLocation={handleUpdateLocation}
                    waitingCount={isWaiting ? 1 : 0}
                    onLogout={() => {
                      // Turn off tracking on logout
                      handleUpdateLocation(37.7749, -122.4194, false);
                      setDriverScreen("login");
                    }}
                    onNavigateToProfile={() => setDriverScreen("setup")}
                  />
                )}
              </PhoneSimulator>

              {/* STUDENT EMULATOR */}
              <PhoneSimulator title="Bobby's Live Tracker" role="student">
                {studentScreen === "loading" && (
                  <LoadingScreen onLoaded={() => setStudentScreen("login")} />
                )}
                {studentScreen === "login" && (
                  <LoginScreen
                    onLoginSuccess={(email) => {
                      setStudentState((prev) => ({ ...prev, email }));
                      setStudentScreen("role");
                    }}
                  />
                )}
                {studentScreen === "role" && (
                  <RoleSelection
                    onRoleSelected={(role) => {
                      setStudentState((prev) => ({ ...prev, role }));
                      setStudentScreen("setup");
                    }}
                    onLogout={() => setStudentScreen("login")}
                  />
                )}
                {studentScreen === "setup" && (
                  <ProfileScreen
                    userState={studentState}
                    onSaveProfile={(profile) => {
                      setStudentState((prev) => ({ ...prev, profile, profileCompleted: true }));
                      setStudentScreen("home");
                    }}
                    onLogout={() => setStudentScreen("login")}
                  />
                )}
                {studentScreen === "home" && (
                  <StudentHome
                    userState={studentState}
                    busLocation={busLocation}
                    isWaiting={isWaiting}
                    onToggleWaiting={setIsWaiting}
                    onLogout={() => setStudentScreen("login")}
                    onNavigateToProfile={() => setStudentScreen("setup")}
                  />
                )}
              </PhoneSimulator>

            </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col space-y-6">
            <div className="max-w-4xl mx-auto w-full bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-start space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-950 text-blue-400 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Full-Featured Flutter Architecture Available:</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  You can browse all production-quality, compilable Flutter Dart files below. To download the entire structured codebase, simply export the project ZIP using the <strong className="text-white">settings menu (top-right of AI Studio)</strong> or check the <code className="text-blue-400">/flutter_project</code> folder on disk!
                </p>
              </div>
            </div>

            <div className="max-w-6xl mx-auto w-full flex-grow flex flex-col">
              <FlutterExporter />
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="py-4 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500 font-medium select-none">
        BusPing companion simulator designed in full compliance with Material 3 styling.
      </footer>
    </div>
  );
}
