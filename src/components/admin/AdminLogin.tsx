import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  Lock,
  User,
  ArrowRight,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  AlertTriangle,
  Clock,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Layers,
  Database,
  Truck,
  Activity,
  ArrowLeft,
} from "lucide-react";
import { loginAdmin, getLockoutStatus } from "@/lib/api/auth.functions";
import logo from "@/assets/logo.png";

interface AdminLoginProps {
  onSuccess: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("pools");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [remainingTimeStr, setRemainingTimeStr] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  // Check initial lockout status
  useEffect(() => {
    getLockoutStatus({ data: { username: "pools" } }).then((res) => {
      if (res.isLocked && res.lockedUntil) {
        setIsLocked(true);
        setLockedUntil(res.lockedUntil);
      } else if (res.attemptsLeft !== undefined) {
        setAttemptsLeft(res.attemptsLeft);
      }
    });
  }, []);

  // Live countdown timer for 2-hour lockout
  useEffect(() => {
    if (!isLocked || !lockedUntil) return;

    const updateTimer = () => {
      const diff = lockedUntil - Date.now();
      if (diff <= 0) {
        setIsLocked(false);
        setLockedUntil(null);
        setError("");
        setAttemptsLeft(3);
        return;
      }

      const totalSecs = Math.floor(diff / 1000);
      const hours = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;

      const pad = (n: number) => n.toString().padStart(2, "0");
      setRemainingTimeStr(`${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockedUntil]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setError("");
    setIsLoading(true);

    try {
      const res = await loginAdmin({ data: { username, password } });

      if (res.success && res.token) {
        localStorage.setItem("aquapro_admin_token", res.token);
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        if (res.isLocked && res.lockedUntil) {
          setIsLocked(true);
          setLockedUntil(res.lockedUntil);
        }
        if (res.attemptsLeft !== undefined) {
          setAttemptsLeft(res.attemptsLeft);
        }
        setError(res.error || "Authentication failed. Invalid username or password.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Server connection issue. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-hidden font-sans select-none bg-[#040d1a]">
      {/* ─── BACKGROUND AMBIENT IMAGERY & GLOWS ─── */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60 pointer-events-none scale-100"
        style={{ backgroundImage: "url('/about-hero.png')" }}
      />

      {/* Deep Gradient Overlays for High Legibility */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#040d1a]/85 via-[#06162a]/80 to-[#040d1a]/95 pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#040d1a]/90 via-[#040d1a]/70 to-[#040d1a]/90 pointer-events-none" />

      {/* Ambient Glowing Orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none z-[1]"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full pointer-events-none z-[1]"
        style={{
          background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#0891b2_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none z-[1]" />

      {/* ─── 2-COLUMN SPLIT CONTAINER ─── */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* ─── LEFT COLUMN: BRAND & ENTERPRISE TELEMETRY CONTENT ─── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="lg:col-span-7 space-y-6 text-white"
        >
          {/* Brand Badge */}
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-block group">
              <img
                src={logo}
                alt="Pool Supply Wholesalers"
                className="h-9 w-auto object-contain brightness-0 invert opacity-95 group-hover:opacity-100 transition-opacity"
              />
            </Link>
            <span className="text-[10px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-400/30">
              Master Admin Console
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              Global Supply Chain{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-white">
                Command Center
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium max-w-xl">
              Enterprise administrative gateway for managing multi-hub inventory, wholesale dealer accounts, high-frequency freight dispatch, and catalog pricing.
            </p>
          </div>

          {/* 4 Feature Value Tiles */}
          <div className="grid sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-2">
                <Database className="size-4 text-cyan-400" />
                <span className="font-extrabold text-xs text-white">Multi-Hub Inventory</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                Real-time stock feeds across Nashville, LA, Dallas, and Orlando warehouses.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-2">
                <Truck className="size-4 text-cyan-400" />
                <span className="font-extrabold text-xs text-white">Freight Logistics</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                Live carrier dispatch, electronic BOLs, and automated shipment tracking.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-cyan-400" />
                <span className="font-extrabold text-xs text-white">8,000+ OEM SKUs</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                Pentair, Hayward, Jandy & Raypak distributor pricing and margin management.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-cyan-400" />
                <span className="font-extrabold text-xs text-white">256-Bit Protection</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                End-to-end encrypted session controls with brute-force lockout guard.
              </p>
            </div>
          </div>

          {/* System Status Banner */}
          <div className="pt-2 flex items-center justify-between flex-wrap gap-3 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Production DB Active · Latency &lt; 18ms</span>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>Return to Storefront</span>
            </Link>
          </div>
        </motion.div>

        {/* ─── RIGHT COLUMN: LOGIN CARD ─── */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="lg:col-span-5 w-full"
        >
          <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-[#061220]/85 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)]">
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            {/* Header */}
            <div className="text-center mb-6 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[10px] font-extrabold uppercase tracking-widest">
                <ShieldCheck className="size-3 text-cyan-400" />
                Authorized Access Only
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight">
                Account Sign In
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Enter your administrative credentials to continue.
              </p>
            </div>

            {/* 2-HOUR LOCKOUT WARNING BANNER */}
            <AnimatePresence>
              {isLocked ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-5 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-center space-y-2 backdrop-blur-md shadow-lg"
                >
                  <div className="flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider text-rose-400">
                    <ShieldAlert className="size-4 animate-bounce" />
                    Security Lockout Active
                  </div>
                  <p className="text-xs text-rose-200/90 font-medium leading-relaxed">
                    Too many incorrect password attempts (3/3). Account temporarily locked for 2 hours for security.
                  </p>
                  <div className="pt-2 border-t border-rose-500/20 flex items-center justify-center gap-2 text-sm font-black text-white font-mono">
                    <Clock className="size-4 text-rose-400 animate-spin" style={{ animationDuration: "6s" }} />
                    {remainingTimeStr || "Calculating time..."}
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs font-bold text-center leading-relaxed space-y-1 backdrop-blur-md"
                >
                  <div className="flex items-center justify-center gap-1.5 text-rose-300">
                    <AlertTriangle className="size-3.5 text-rose-400" />
                    <span>Authentication Failed</span>
                  </div>
                  <div className="text-[11px] text-rose-200 font-medium">{error}</div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Attempt Indicator Badge */}
            {!isLocked && attemptsLeft !== null && attemptsLeft < 3 && (
              <div className="mb-4 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-extrabold">
                  <AlertTriangle className="size-3.5" />
                  {attemptsLeft} Attempt{attemptsLeft === 1 ? "" : "s"} Remaining Before Lockout
                </span>
              </div>
            )}

            {/* ─── LOGIN FORM ─── */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-300 pl-1">
                  Admin Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                    <User className="size-4" />
                  </div>
                  <input
                    type="text"
                    required
                    disabled={isLocked}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-xs font-bold text-white placeholder:text-slate-500 bg-white/5 border border-white/10 outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-300 pl-1">
                  Security Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                    <Lock className="size-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLocked}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl text-xs font-bold text-white placeholder:text-slate-500 bg-white/5 border border-white/10 outline-none focus:bg-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all disabled:opacity-40 tracking-wider"
                  />
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Login Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isLocked || !username || !password}
                className="w-full relative overflow-hidden rounded-xl py-3.5 text-xs font-black uppercase tracking-wider text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3 cursor-pointer shadow-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 shadow-cyan-900/40"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : isLocked ? (
                  <>
                    <Lock className="size-4" />
                    <span>Account Locked (2 Hours)</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate & Access Console</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>

            {/* Encrypted Footer Badge */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-cyan-400" /> 256-Bit TLS Protected
              </span>
              <span className="text-slate-500">Authorized Personnel Only</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
