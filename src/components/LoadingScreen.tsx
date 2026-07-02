/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";

interface LoadingScreenProps {
  onLoaded: () => void;
}

export default function LoadingScreen({ onLoaded }: LoadingScreenProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    // 10 seconds maximum loading timeout, but we automatically finish in 2.5s for a great user experience
    const mainTimer = setTimeout(() => {
      onLoaded();
    }, 2500);

    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);

    return () => {
      clearTimeout(mainTimer);
      clearInterval(dotInterval);
    };
  }, [onLoaded]);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-between py-16 bg-[#F5F5F5] z-50 text-slate-900"
      id="loading-screen"
    >
      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        {/* Animated Brand Pulse */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [1, 1.05, 1], opacity: 1 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="flex items-center justify-center w-24 h-24 rounded-3xl bg-blue-500 text-white shadow-xl shadow-blue-500/20"
        >
          <span className="text-5xl select-none">🚌</span>
        </motion.div>

        <div className="text-center space-y-2">
          <motion.h1
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl font-bold font-sans tracking-tight text-blue-600"
          >
            BusPing
          </motion.h1>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 0.6 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-xs font-mono tracking-wider uppercase"
          >
            Real-Time Bus Tracking
          </motion.p>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        {/* Modern Progress Line Indicator */}
        <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.3, ease: "easeInOut" }}
            className="h-full bg-blue-500 rounded-full"
          />
        </div>

        <p className="text-xs text-slate-500 font-medium font-sans h-4 select-none">
          Loading BusPing{dots}
        </p>
      </div>
    </div>
  );
}
