import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { loginAdmin } from "@/lib/api/auth.functions";
import logo from "@/assets/logo.png";

interface AdminLoginProps {
  onSuccess: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setError(res.error || "Authentication failed. Please try again.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Server connection failed. Please check your network.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans" style={{ background: "linear-gradient(135deg, #0089C9 0%, #006DAB 40%, #004A7C 100%)" }}>

      {/* Animated Orbs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, #59D2F3 0%, transparent 70%)" }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-20%] right-[-15%] w-[50vw] h-[50vw] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, #003F6B 0%, transparent 70%)" }}
      />
      <motion.div
        animate={{ y: [0, -20, 0], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[30%] right-[10%] w-[25vw] h-[25vw] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, #59D2F3 0%, transparent 70%)" }}
      />

      {/* Floating geometric accents */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute top-[15%] left-[8%] w-32 h-32 rounded-[2rem] border border-white/10 pointer-events-none"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[20%] right-[12%] w-20 h-20 rounded-full border border-white/10 pointer-events-none"
      />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Card */}
        <div
          className="relative rounded-[2.5rem] overflow-hidden p-10"
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
          }}
        >
          {/* Inner top highlight */}
          <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

          {/* Logo + Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-10"
          >
            <div
              className="inline-flex size-16 rounded-[1.25rem] items-center justify-center mx-auto mb-5"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.25)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
              }}
            >
              <img src={logo} alt="Logo" className="w-9 h-9 object-contain brightness-0 invert" />
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight mb-1.5">
              Welcome Back
            </h1>
            <p className="text-sm text-white/60 font-medium">
              Sign in to access your admin control center
            </p>
          </motion.div>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-5 px-4 py-3 rounded-2xl text-xs font-bold text-center"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#fca5a5"
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            onSubmit={handleLogin}
            className="space-y-4"
          >
            {/* Username */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-white/80 transition-colors">
                <User className="size-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-semibold text-white placeholder:text-white/40 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  caretColor: "white"
                }}
                onFocus={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.12)";
                  e.target.style.border = "1px solid rgba(255,255,255,0.35)";
                  e.target.style.boxShadow = "0 0 0 4px rgba(89,210,243,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.08)";
                  e.target.style.border = "1px solid rgba(255,255,255,0.15)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-white/80 transition-colors">
                <Lock className="size-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm font-semibold text-white placeholder:text-white/40 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  caretColor: "white"
                }}
                onFocus={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.12)";
                  e.target.style.border = "1px solid rgba(255,255,255,0.35)";
                  e.target.style.boxShadow = "0 0 0 4px rgba(89,210,243,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.08)";
                  e.target.style.border = "1px solid rgba(255,255,255,0.15)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white/80 transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || !username || !password}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full relative overflow-hidden rounded-2xl py-4 text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              style={{
                background: "linear-gradient(135deg, #59D2F3, #0089C9)",
                boxShadow: "0 8px 32px rgba(89,210,243,0.35), inset 0 1px 0 rgba(255,255,255,0.3)"
              }}
            >
              {/* shimmer */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                className="absolute inset-0 w-1/3"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)", skewX: "-20deg" }}
              />
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Enter Dashboard</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            <ShieldCheck className="size-3.5" style={{ color: "rgba(89,210,243,0.7)" }} />
            End-to-End Encrypted · Secure Portal
          </motion.div>
        </div>

        {/* Below-card label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 text-xs font-medium"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Pool Supply Wholesalers — Administrative Access Only
        </motion.p>
      </motion.div>
    </div>
  );
}
