/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { User, Phone, Bus, Shield, FileText, MapPin, ArrowRight, Save, LogOut } from "lucide-react";
import { UserState, UserProfile } from "../types";
import StopPicker from "./StopPicker";

interface ProfileScreenProps {
  userState: UserState;
  onSaveProfile: (profile: UserProfile) => void;
  onLogout: () => void;
  onCancel?: () => void;
}

export default function ProfileScreen({
  userState,
  onSaveProfile,
  onLogout,
  onCancel,
}: ProfileScreenProps) {
  const isDriver = userState.role === "driver";
  
  // State variables for form input
  const [name, setName] = useState(userState.profile?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(userState.profile?.phoneNumber || "");
  const [busNumber, setBusNumber] = useState(userState.profile?.busNumber || "");
  
  // Driver specific
  const [driverLicense, setDriverLicense] = useState(userState.profile?.driverLicense || "");
  const [busPlateNumber, setBusPlateNumber] = useState(userState.profile?.busPlateNumber || "");

  // Student specific
  const [busStopName, setBusStopName] = useState(userState.profile?.busStopName || "");
  const [busStopLat, setBusStopLat] = useState<number | undefined>(userState.profile?.busStopLat);
  const [busStopLon, setBusStopLon] = useState<number | undefined>(userState.profile?.busStopLon);

  // Stop Picker Modal state
  const [showStopPicker, setShowStopPicker] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Please enter your name.");
    if (!phoneNumber.trim()) return setError("Please enter your phone number.");
    if (!busNumber.trim()) return setError("Please enter the bus number.");

    if (isDriver) {
      if (!driverLicense.trim()) return setError("Driver License is required.");
      if (!busPlateNumber.trim()) return setError("Bus Plate Number is required.");
    } else {
      if (!busStopName || busStopLat === undefined || busStopLon === undefined) {
        return setError("Please select your bus stop on the map.");
      }
    }

    // Call callback to save profile
    const updatedProfile: UserProfile = {
      name,
      phoneNumber,
      busNumber,
      ...(isDriver ? { driverLicense, busPlateNumber } : { busStopName, busStopLat, busStopLon }),
    };

    onSaveProfile(updatedProfile);
  };

  const handleStopPicked = (stopName: string, lat: number, lon: number) => {
    setBusStopName(stopName);
    setBusStopLat(lat);
    setBusStopLon(lon);
    setShowStopPicker(false);
  };

  if (showStopPicker) {
    return (
      <StopPicker
        onStopPicked={handleStopPicked}
        onCancel={() => setShowStopPicker(false)}
      />
    );
  }

  return (
    <div
      className="absolute inset-0 flex flex-col justify-between bg-[#F5F5F5] overflow-y-auto"
      id="profile-screen"
    >
      {/* Top Header */}
      <div className="p-4 bg-white/90 backdrop-blur-md border-b border-slate-100 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{isDriver ? "🚌" : "👨‍🎓"}</span>
          <span className="font-bold text-slate-900 tracking-tight text-sm">
            {userState.profileCompleted ? "Edit Profile" : "Profile Setup"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold px-2 py-1"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="flex-grow p-5 space-y-5 max-w-sm mx-auto w-full">
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-slate-950">
            {userState.profileCompleted ? "Update Your Details" : "Let's Get Started!"}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Complete your profile details to unlock all live sync features.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 shadow-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* COMMON FIELDS */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase px-1">
              Full Name
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-950 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase px-1">
              Phone Number
            </label>
            <div className="relative flex items-center">
              <Phone className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                placeholder="+1 (555) 019-2834"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-950 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase px-1">
              Bus Number
            </label>
            <div className="relative flex items-center">
              <Bus className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Bus 12A"
                value={busNumber}
                onChange={(e) => setBusNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-950 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* DRIVER SPECIFIC FIELDS */}
          {isDriver && (
            <div className="pt-3 border-t border-slate-200/50 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase px-1">
                  Driver License ID
                </label>
                <div className="relative flex items-center">
                  <Shield className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="DL-82910"
                    value={driverLicense}
                    onChange={(e) => setDriverLicense(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-950 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase px-1">
                  Bus Plate Number
                </label>
                <div className="relative flex items-center">
                  <FileText className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="7XYZ89"
                    value={busPlateNumber}
                    onChange={(e) => setBusPlateNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-950 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STUDENT SPECIFIC FIELDS */}
          {!isDriver && (
            <div className="pt-3 border-t border-slate-200/50 space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase px-1">
                  My Pick-Up Bus Stop
                </label>
                
                {busStopName ? (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-2.5 overflow-hidden pr-3">
                      <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {busStopName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowStopPicker(true)}
                      className="text-[10px] font-extrabold text-blue-600 hover:text-blue-800 underline shrink-0 uppercase tracking-wide"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowStopPicker(true)}
                    className="w-full py-3 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl text-xs font-bold text-slate-500 hover:text-blue-600 bg-white transition-all flex items-center justify-center space-x-1.5"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Select Stop On Map</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full mt-4 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5"
          >
            {userState.profileCompleted ? (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Updates</span>
              </>
            ) : (
              <>
                <span>Complete Account Setup</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="p-4 text-center text-[10px] text-slate-400 select-none border-t border-slate-100 shrink-0">
        Changes will persist instantly to SharedPreferences database.
      </div>
    </div>
  );
}
