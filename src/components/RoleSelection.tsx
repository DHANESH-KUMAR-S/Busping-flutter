/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, ArrowRight, Check } from "lucide-react";
import { UserRole } from "../types";

interface RoleSelectionProps {
  onRoleSelected: (role: "driver" | "student") => void;
  onLogout: () => void;
}

export default function RoleSelection({
  onRoleSelected,
  onLogout,
}: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    if (selectedRole) {
      onRoleSelected(selectedRole);
    }
  };

  return (
    <div
      className="absolute inset-0 flex flex-col justify-between p-6 bg-[#F5F5F5] overflow-y-auto text-slate-800"
      id="role-selection"
    >
      {/* Header */}
      <div className="flex justify-between items-center select-none pt-2">
        <div className="flex items-center space-x-1">
          <span className="text-xl">🚌</span>
          <span className="font-bold text-slate-900 tracking-tight text-sm">BusPing</span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full hover:bg-slate-200/50 text-slate-500 hover:text-slate-900 transition-colors text-xs font-semibold"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-grow flex flex-col justify-center max-w-sm mx-auto w-full py-6 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Choose Your Role</h2>
          <p className="text-xs text-slate-500 font-medium">
            Please select how you will be using BusPing today.
          </p>
        </div>

        {/* Role Cards */}
        <div className="space-y-4">
          {/* Driver Card */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole("driver")}
            className={`w-full p-5 rounded-3xl border text-left flex items-start space-x-4 transition-all relative overflow-hidden ${
              selectedRole === "driver"
                ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-md"
                : "bg-white border-slate-100 shadow-sm hover:border-slate-300"
            }`}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl shadow-sm">
              🚌
            </div>
            <div className="flex-grow space-y-1 pr-6">
              <h3 className="font-bold text-slate-950 text-base">I'm a Bus Driver</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Broadcast your bus coordinates, stream live location, and see waiting students.
              </p>
            </div>
            {selectedRole === "driver" && (
              <div className="absolute right-4 top-4 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
          </motion.button>

          {/* Student Card */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole("student")}
            className={`w-full p-5 rounded-3xl border text-left flex items-start space-x-4 transition-all relative overflow-hidden ${
              selectedRole === "student"
                ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-md"
                : "bg-white border-slate-100 shadow-sm hover:border-slate-300"
            }`}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl shadow-sm">
              🎓
            </div>
            <div className="flex-grow space-y-1 pr-6">
              <h3 className="font-bold text-slate-950 text-base">I'm a Student / Parent</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Pick your stop, see real-time map updates, view ETAs, and notify the driver.
              </p>
            </div>
            {selectedRole === "student" && (
              <div className="absolute right-4 top-4 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
          </motion.button>
        </div>

        {/* Action Button */}
        <button
          disabled={!selectedRole}
          onClick={() => setShowConfirm(true)}
          className={`w-full py-4 rounded-2xl font-semibold text-sm shadow-sm flex items-center justify-center space-x-2 transition-all ${
            selectedRole
              ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md hover:shadow-lg"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Confirmation Dialog Overlay */}
      <AnimatePresence>
        {showConfirm && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-30 flex items-end justify-center">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full bg-white rounded-t-[32px] p-6 space-y-5 shadow-2xl border-t border-slate-100"
            >
              {/* Drag Accent Handle */}
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />

              <div className="space-y-2 text-center">
                <h4 className="text-lg font-bold text-slate-950">Confirm Account Role</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  You are setting up your account profile as a{" "}
                  <strong className="text-blue-600 uppercase tracking-wide">
                    {selectedRole === "driver" ? "Bus Driver 🚌" : "Student / Parent 🎓"}
                  </strong>
                  . This selection links your profile features permanently.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="py-3 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-all shadow-sm"
                >
                  Change Role
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-xs font-semibold text-white shadow-sm hover:shadow-md transition-all"
                >
                  Yes, Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="text-center text-[10px] text-slate-400 select-none pb-2">
        You can sign out to change authentication accounts later.
      </div>
    </div>
  );
}
