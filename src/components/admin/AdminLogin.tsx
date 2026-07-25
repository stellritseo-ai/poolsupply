import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  CheckCircle2
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
        }, 600);
      } else {
        if (res.isLocked && res.lockedUntil) {
          setIsLocked(true);
          setLockedUntil(res.lockedUntil);
        }
        if (res.attemptsLeft !== undefined) {
          setAttemptsLeft(res.attemptsLeft);
        }
        setError(res.error || "Authentication failed. Please check credentials.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Server connection issue. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans select-none"
      style={{
        background: "linear-gradient(135deg, #000c1a 0%, #001f3f 40%, #003366 75%, #004080 100%)"
      }}
    >
      {/* Background Animated Gradient Orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-15%] w-[60vw] h-[60vw] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(89,210,243,0.3) 0%, transparent 70%)", filter: "blur(80px)" }}
      />
      <motion.div
        animate={{ scale: [1, 1.25, 1], opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-25%] right-[-20%] w-[55vw] h-[55vw] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,137,201,0.25) 0%, transparent 70%)", filter: "blur(90px)" }}
      />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[460px] relative z-10"
      >
        <div
          className="relative rounded-[2.5rem] overflow-hidden p-7 sm:p-10"
          style={{
            background: "rgba(10, 25, 47, 0.75)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 40px 100px -20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
          }}
        >
          {/* Top Metallic Specular Line */}
          <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

          {/* Logo & Security Badge Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div
              className="relative inline-flex size-20 rounded-3xl items-center justify-center mx-auto mb-5 shadow-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05))",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.25)"
              }}
            >
              <img src={logo} alt="Poolsby Logo" className="w-11 h-11 object-contain brightness-0 invert drop-shadow-md" />
              {isLocked ? (
                <span className="absolute -top-1 -right-1 size-5 rounded-full bg-rose-600 text-white grid place-items-center text-[10px] font-black border-2 border-slate-900 shadow-md">
                  🔒
                </span>
              ) : (
                <span className="absolute -bottom-1 -right-1 size-4 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-md" />
              )}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-cyan-300 text-[10px] font-extrabold uppercase tracking-widest mb-3 backdrop-blur-md">
              <ShieldCheck className="size-3 text-cyan-400" />
              Enterprise Security Shield
            </div>

            <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">
              Admin Portal
            </h1>
            <p className="text-xs text-slate-300/80 font-medium">
              Authenticate with credential privileges to access global control
            </p>
          </motion.div>

          {/* 2-HOUR LOCKOUT WARNING BANNER */}
          <AnimatePresence>
            {isLocked ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 p-5 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-center space-y-2 backdrop-blur-md shadow-xl"
              >
                <div className="flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider text-rose-400">
                  <ShieldAlert className="size-4 animate-bounce" />
                  Security Lockout Active
                </div>
                <p className="text-xs text-rose-200/90 font-semibold leading-relaxed">
                  Too many incorrect password attempts (3/3). Your account has been temporarily locked for 2 hours for security.
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
                className="mb-6 p-4 rounded-2xl bg-rose-900/40 border border-rose-500/30 text-rose-200 text-xs font-bold text-center leading-relaxed space-y-1 backdrop-blur-md"
              >
                <div className="flex items-center justify-center gap-1.5 text-rose-300">
                  <AlertTriangle className="size-4 text-rose-400" />
                  <span>Authentication Failed</span>
                </div>
                <div>{error}</div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Attempt Indicator Badge */}
          {!isLocked && attemptsLeft !== null && attemptsLeft < 3 && (
            <div className="mb-4 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-extrabold">
                <AlertTriangle className="size-3.5" />
                {attemptsLeft} Attempt{attemptsLeft === 1 ? "" : "s"} Remaining Before 2-Hour Lockout
              </span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300 pl-1">
                Admin Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                  <User className="size-4" />
                </div>
                <input
                  type="text"
                  required
                  disabled={isLocked}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold text-white placeholder:text-slate-500 outline-none transition-all disabled:opacity-40"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)"
                  }}
                  onFocus={(e) => {
                    e.target.style.background = "rgba(255,255,255,0.1)";
                    e.target.style.border = "1px solid rgba(89,210,243,0.5)";
                    e.target.style.boxShadow = "0 0 20px rgba(89,210,243,0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.background = "rgba(255,255,255,0.06)";
                    e.target.style.border = "1px solid rgba(255,255,255,0.12)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300 pl-1">
                Security Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                  <Lock className="size-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLocked}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-xs font-bold text-white placeholder:text-slate-500 outline-none transition-all disabled:opacity-40 tracking-wider"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)"
                  }}
                  onFocus={(e) => {
                    e.target.style.background = "rgba(255,255,255,0.1)";
                    e.target.style.border = "1px solid rgba(89,210,243,0.5)";
                    e.target.style.boxShadow = "0 0 20px rgba(89,210,243,0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.background = "rgba(255,255,255,0.06)";
                    e.target.style.border = "1px solid rgba(255,255,255,0.12)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Login Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || isLocked || !username || !password}
              whileHover={{ scale: isLocked ? 1 : 1.02 }}
              whileTap={{ scale: isLocked ? 1 : 0.98 }}
              className="w-full relative overflow-hidden rounded-2xl py-4 text-xs font-black uppercase tracking-wider text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-2xl"
              style={
                isLocked
                  ? { background: "#475569" }
                  : {
                      background: "linear-gradient(135deg, #0089C9 0%, #0066cc 100%)",
                      boxShadow: "0 10px 30px rgba(0, 137, 201, 0.4)"
                    }
              }
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
                  <span>Authenticate & Enter</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Encrypted Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-cyan-400" /> 256-Bit Encrypted
            </span>
            <span className="text-slate-500">3-Strike Security Active</span>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center mt-5 text-[11px] font-semibold text-slate-400/70">
          Pool Supply Wholesalers — Authorized Personnel Only
        </p>
      </motion.div>
    </div>
  );
}
