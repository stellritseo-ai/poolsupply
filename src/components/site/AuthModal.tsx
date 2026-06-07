import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { useAuth } from "./auth-context";
import { loginCustomer, registerCustomer } from "@/lib/api/customers.functions";
import { toast } from "sonner";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalType, openAuthModal, login } = useAuth();
  const isLogin = authModalType === "login";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const res = await loginCustomer({ data: { identifier, password } });
        if (res.success && res.token && res.user) {
          login(res.user, res.token);
          toast.success(`Welcome back, ${res.user.name}!`);
          closeAuthModal();
        } else {
          toast.error(res.error || "Login failed.");
        }
      } else {
        const res = await registerCustomer({ data: { name, identifier, password } });
        if (res.success && res.token && res.user) {
          login(res.user, res.token);
          toast.success("Account created successfully!");
          closeAuthModal();
        } else {
          toast.error(res.error || "Registration failed.");
        }
      }
    } catch (e) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80"
        >
          <button
            onClick={closeAuthModal}
            className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
          >
            <X className="size-5" />
          </button>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-black tracking-tight text-foreground">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isLogin
                ? "Enter your credentials to access your orders."
                : "Join us for premium pool equipment at wholesale prices."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white/50 px-12 py-4 text-sm font-medium outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-black/20 dark:focus:bg-black/40"
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Email or Mobile Number"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white/50 px-12 py-4 text-sm font-medium outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-black/20 dark:focus:bg-black/40"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white/50 px-12 py-4 text-sm font-medium outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-black/20 dark:focus:bg-black/40"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-ocean py-4 font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? <Loader2 className="size-5 animate-spin" /> : (isLogin ? "Sign In" : "Register")}
            </button>
          </form>

          <div className="mt-6 text-center text-sm font-medium text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => openAuthModal(isLogin ? "register" : "login")}
              className="text-primary hover:underline"
            >
              {isLogin ? "Create one" : "Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
