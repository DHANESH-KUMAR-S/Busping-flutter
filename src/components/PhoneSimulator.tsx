/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from "react";

interface PhoneSimulatorProps {
  children: ReactNode;
  title: string;
  role: "driver" | "student";
}

export default function PhoneSimulator({
  children,
  title,
  role,
}: PhoneSimulatorProps) {
  const isDriver = role === "driver";

  return (
    <div className="relative flex flex-col items-center select-none" id={`phone-sim-${role}`}>
      {/* Device Frame */}
      <div className="relative w-[385px] h-[780px] bg-[#1E293B] rounded-[48px] p-3.5 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-600/30 overflow-hidden flex flex-col justify-between">
        
        {/* Dynamic Island / Camera Punch Hole */}
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-28 h-6 bg-black rounded-2xl z-30 flex items-center justify-between px-3 text-[10px] text-white/90">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/80 animate-ping"></div>
          <div className="font-sans font-semibold tracking-wider text-[9px] uppercase opacity-75">
            {isDriver ? "Driver App" : "Student App"}
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
        </div>

        {/* Screen Content Wrapper */}
        <div className="w-full h-full bg-[#F5F5F5] rounded-[36px] overflow-hidden flex flex-col relative border border-slate-900/10 text-slate-800">
          
          {/* Status Bar */}
          <div className="h-10 pt-2 px-6 flex justify-between items-center bg-transparent text-slate-900 font-sans text-[11px] font-semibold tracking-tight z-20 pointer-events-none shrink-0 select-none">
            <div>08:10</div>
            <div className="flex items-center space-x-1.5">
              <span>📶</span>
              <span>🔋 100%</span>
            </div>
          </div>

          {/* App Body */}
          <div className="flex-1 flex flex-col relative overflow-hidden">
            {children}
          </div>

          {/* Home Indicator */}
          <div className="h-6 flex items-center justify-center bg-transparent z-20 shrink-0 pointer-events-none select-none">
            <div className="w-28 h-1 bg-slate-900/20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Label under the phone */}
      <div className="mt-3.5 flex items-center space-x-2 text-sm font-medium bg-slate-800/80 text-white/90 px-4 py-1.5 rounded-full shadow-md backdrop-blur border border-slate-700/50">
        <span className="text-base">{isDriver ? "🚌" : "👨‍🎓"}</span>
        <span className="font-sans tracking-wide">{title}</span>
      </div>
    </div>
  );
}
