/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (email: string, isNewAccount: boolean) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Simple robust form validations
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    // Simulate Firebase Authentication delay
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(email, isSignUp);
    }, 1200);
  };

  return (
    <div
      className="absolute inset-0 flex flex-col justify-between p-6 bg-[#F5F5F5] overflow-y-auto scrollbar-none text-slate-800"
      id="login-screen"
    >
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-6">
        {/* Header Visual */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500 text-white shadow-lg select-none">
            <span className="text-3xl">🚌</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {isSignUp
                ? "Sign up to track or manage your school bus"
                : "Sign in to access your BusPing tracker"}
            </p>
          </div>
        </div>

        {/* Auth Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 shadow-sm"
          >
            ⚠️ {error}
          </motion.div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 px-1 select-none">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 px-1 select-none">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-11 pr-11 py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 relative overflow-hidden"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? "Sign Up" : "Sign In"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Account mode Divider */}
        <div className="relative flex py-5 items-center select-none">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-mono tracking-wider uppercase">
            or
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setError("");
            setIsSignUp(!isSignUp);
          }}
          className="w-full py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 font-semibold text-xs rounded-2xl transition-all shadow-sm flex items-center justify-center space-x-1"
        >
          {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up Now"}
        </button>
      </div>

      <div className="text-center text-[10px] text-slate-400 select-none">
        Powered by Firebase Auth & Firestore • v1.0.0
      </div>
    </div>
  );
}
