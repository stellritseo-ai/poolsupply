import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Settings as SettingsIcon,
  Lock,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  User,
  Database,
  RefreshCw,
  Server,
  Eye,
  EyeOff,
  Sparkles,
  Copy,
  Check,
  Activity,
  Key,
  Layers,
  Globe,
  Sliders,
  X,
  Search,
  ArrowUpRight,
  HardDrive,
  Radio,
  HelpCircle,
  Clock,
  Zap,
  ShoppingBag,
  MessageSquare,
  FileText,
} from "lucide-react";
import { getUsers, createUser, deleteUser, updateSuperAdmin } from "@/lib/api/users.functions";
import { getGlobalSettings, updateGlobalSettings } from "@/lib/api/settings.functions";
import { getDatabaseStats, migrateData } from "@/lib/api/migration.functions";
import { products, invalidateProductsCache } from "@/lib/products";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/admin/settings")({
  component: SystemSettings,
});

type TabType = "users" | "security" | "platform" | "database" | "integrations";

export function SystemSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "manager" | "viewer">("manager");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Security State
  const [currentUsername, setCurrentUsername] = useState("pools");
  const [secCurrentPassword, setSecCurrentPassword] = useState("");
  const [secNewPassword, setSecNewPassword] = useState("");
  const [secConfirmPassword, setSecConfirmPassword] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false);

  // Platform State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceNotice, setMaintenanceNotice] = useState("Scheduled maintenance in progress. Orders will resume shortly.");
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isSavingPlatform, setIsSavingPlatform] = useState(false);

  // Database Sync State
  const [dbStats, setDbStats] = useState<any>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);

  // Copy state helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const triggerToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    triggerToast(`Copied ${label} to clipboard!`, "info");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const loadAllData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [usersRes, settingsRes, dbRes] = await Promise.all([
        getUsers(),
        getGlobalSettings(),
        getDatabaseStats()
      ]);

      if (usersRes.success && usersRes.users) {
        setUsers(usersRes.users);
      }

      if (settingsRes.success && settingsRes.settings) {
        setMaintenanceMode(Boolean(settingsRes.settings.maintenanceMode));
        if (settingsRes.settings.paymentMethods && Array.isArray(settingsRes.settings.paymentMethods)) {
          setPaymentMethods(settingsRes.settings.paymentMethods);
        } else {
          setPaymentMethods([
            {
              id: "stripe",
              name: "Stripe Card Processing",
              active: true,
              mode: "Live Production (256-bit SSL)",
              publicKey: "pk_live_51TxoN3LlienmBCcZCAlvmfLnIsLe0BaWwIaBTSm8CrVBjuh7dPLzpHbe9QXiWKR9zxPYdBqJNbEoPNDCSGWcL5C900sY0uRiB2"
            },
            { id: "paypal", name: "PayPal B2B Wholesale", active: false, mode: "Standard" },
            { id: "authorize", name: "Authorize.net Direct", active: false, mode: "Commercial ACH" }
          ]);
        }
      }

      if (dbRes.success) {
        setDbStats(dbRes.stats);
      }
    } catch (err: any) {
      console.error("Failed to load settings data:", err);
      triggerToast("Could not retrieve all system data", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = !userSearch.trim() ||
        (u.username || "").toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = userRoleFilter === "all" || (u.role || "admin").toLowerCase() === userRoleFilter.toLowerCase();
      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, userRoleFilter]);

  // Handle Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      return triggerToast("Username and password are required", "error");
    }
    if (newPassword.length < 6) {
      return triggerToast("Password must be at least 6 characters", "error");
    }

    setIsCreatingUser(true);
    try {
      const res = await createUser({
        data: {
          username: newUsername.trim().toLowerCase(),
          password: newPassword,
          role: newRole,
        }
      });

      if (res.success && res.user) {
        setUsers((prev) => [...prev, { ...res.user, createdAt: new Date() }]);
        triggerToast(`Staff account '${newUsername}' created successfully`, "success");
        setIsAddUserModalOpen(false);
        setNewUsername("");
        setNewPassword("");
        setNewRole("manager");
      } else {
        triggerToast(res.error || "Failed to create staff account", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Failed to add user", "error");
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Handle Delete User
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      const res = await deleteUser({ data: { id: userToDelete.id } });
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        triggerToast(`Account '${userToDelete.username}' removed successfully`, "success");
        setUserToDelete(null);
      } else {
        triggerToast(res.error || "Failed to remove staff user", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Error deleting user", "error");
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!secNewPassword) return { score: 0, label: "None", color: "bg-slate-200", textColor: "text-slate-400" };
    let score = 0;
    if (secNewPassword.length >= 6) score += 1;
    if (secNewPassword.length >= 10) score += 1;
    if (/[A-Z]/.test(secNewPassword)) score += 1;
    if (/[0-9]/.test(secNewPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(secNewPassword)) score += 1;

    if (score <= 2) return { score, label: "Weak", color: "bg-rose-500", textColor: "text-rose-500" };
    if (score <= 4) return { score, label: "Good", color: "bg-amber-500", textColor: "text-amber-500" };
    return { score, label: "Strong", color: "bg-emerald-500", textColor: "text-emerald-500" };
  }, [secNewPassword]);

  // Handle Security Update
  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secCurrentPassword) {
      return triggerToast("Current master password is required", "error");
    }
    if (secNewPassword && secNewPassword !== secConfirmPassword) {
      return triggerToast("New passwords do not match", "error");
    }
    if (secNewPassword && secNewPassword.length < 6) {
      return triggerToast("New password must be at least 6 characters", "error");
    }

    setIsUpdatingSecurity(true);
    try {
      const res = await updateSuperAdmin({
        data: {
          currentUsername: currentUsername.trim(),
          currentPassword: secCurrentPassword,
          newPassword: secNewPassword || undefined,
        },
      });

      if (res.success) {
        triggerToast("Master security credentials updated successfully", "success");
        setSecCurrentPassword("");
        setSecNewPassword("");
        setSecConfirmPassword("");
      } else {
        triggerToast(res.error || "Authentication failed. Current password incorrect.", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Failed to update security credentials", "error");
    } finally {
      setIsUpdatingSecurity(false);
    }
  };

  // Toggle payment method
  const handleTogglePaymentMethod = (methodId: string) => {
    setPaymentMethods((prev) =>
      prev.map((m) => (m.id === methodId ? { ...m, active: !m.active } : m))
    );
  };

  // Handle Save Platform Settings
  const handleSavePlatform = async () => {
    setIsSavingPlatform(true);
    try {
      const res = await updateGlobalSettings({
        data: {
          maintenanceMode,
          paymentMethods,
        },
      });

      if (res.success) {
        triggerToast("Platform configuration saved successfully", "success");
      } else {
        triggerToast(res.error || "Failed to save platform configuration", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Error saving platform settings", "error");
    } finally {
      setIsSavingPlatform(false);
    }
  };

  // Handle Database Migration Seed
  const handleRunMigration = async () => {
    setIsMigrating(true);
    setIsMigrationModalOpen(false);
    try {
      const res = await migrateData({ data: { products, orders: [], reviews: [] } });
      if (res.success && res.stats) {
        triggerToast(`Catalog Seed Successful: ${res.stats.products} products synchronized`, "success");
        invalidateProductsCache(queryClient);
        const dbRes = await getDatabaseStats();
        if (dbRes.success) setDbStats(dbRes.stats);
      } else {
        triggerToast(res.error || "Database sync failed", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Migration process encountered an error", "error");
    } finally {
      setIsMigrating(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: any; count?: number | string; badge?: string }[] = [
    { id: "users", label: "Staff & Roles", icon: Users, count: users.length },
    { id: "security", label: "Security & Master Auth", icon: Lock, badge: "Encrypted" },
    { id: "platform", label: "Storefront & Platform", icon: Sliders, badge: maintenanceMode ? "Maintenance" : "Live" },
    { id: "database", label: "Database Telemetry", icon: Database, count: dbStats?.productsCount || "Live" },
    { id: "integrations", label: "API & Gateways", icon: Key, badge: "Stripe Active" },
  ];

  return (
    <div className="space-y-7 max-w-[1400px] mx-auto w-full pb-16">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-24 right-6 z-50 px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-2xl text-xs font-bold border backdrop-blur-md ${
              toast.type === "error"
                ? "bg-rose-950/90 text-rose-200 border-rose-800"
                : toast.type === "info"
                ? "bg-sky-950/90 text-sky-200 border-sky-800"
                : "bg-slate-900/95 text-white border-slate-700/80"
            }`}
          >
            {toast.type === "error" ? (
              <AlertTriangle className="size-4.5 text-rose-400 shrink-0" />
            ) : toast.type === "info" ? (
              <Sparkles className="size-4.5 text-sky-400 shrink-0" />
            ) : (
              <CheckCircle2 className="size-4.5 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Executive Top Header ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-4 sm:p-6 sm:p-8 shadow-xl border border-slate-800">
        {/* Glow ambient decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Radio className="size-3 text-cyan-400 animate-pulse" />
                Production Engine
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="size-3 text-emerald-400" />
                MongoDB Atlas Live
              </span>
              {maintenanceMode && (
                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <AlertTriangle className="size-3 text-amber-400" />
                  Maintenance Mode Active
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>System & Security Operations</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
              Master control panel for team credentials, cryptographic authentication, live checkout configurations, and real-time MongoDB database telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 self-start md:self-auto shrink-0 flex-wrap">
            <button
              onClick={() => loadAllData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 text-xs font-bold border border-slate-700 hover:border-slate-600 transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : "text-slate-400"}`} />
              <span>{isRefreshing ? "Refreshing..." : "Refresh Feed"}</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-[11px] text-slate-300 font-mono">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>v2.4.0-stable</span>
            </div>
          </div>
        </div>

        {/* ── KPI Quick Highlights ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-800/80">
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-[11px] font-bold">
              <span>Super Admin</span>
              <Shield className="size-3.5 text-cyan-400" />
            </div>
            <div className="mt-1 text-sm sm:text-base lg:text-lg font-black text-white truncate">pools (Master)</div>
            <div className="text-[9px] sm:text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5 truncate">
              <CheckCircle className="size-2.5" /> Bcrypt Salt 10 Active
            </div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-[11px] font-bold">
              <span>Staff Accounts</span>
              <Users className="size-3.5 text-blue-400" />
            </div>
            <div className="mt-1 text-sm sm:text-base lg:text-lg font-black text-white">{users.length} Active</div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 font-semibold mt-0.5 truncate">
              {users.filter(u => u.role === "admin").length} Admins · {users.filter(u => u.role !== "admin").length} Staff
            </div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-[11px] font-bold">
              <span>Storefront</span>
              <Globe className="size-3.5 text-emerald-400" />
            </div>
            <div className="mt-1 text-sm sm:text-base lg:text-lg font-black text-white truncate">
              {maintenanceMode ? "Maintenance" : "Live Store"}
            </div>
            <div className={`text-[9px] sm:text-[10px] font-semibold mt-0.5 truncate ${maintenanceMode ? "text-amber-400" : "text-emerald-400"}`}>
              {maintenanceMode ? "Access Blocked" : "Checkout Active"}
            </div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-[11px] font-bold">
              <span>DB Products</span>
              <Database className="size-3.5 text-purple-400" />
            </div>
            <div className="mt-1 text-sm sm:text-base lg:text-lg font-black text-white truncate">
              {dbStats ? `${dbStats.productsCount || 0} Synced` : "Connecting..."}
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 font-semibold mt-0.5 truncate">
              {dbStats?.ordersCount || 0} Orders · {dbStats?.reviewsCount || 0} Reviews
            </div>
          </div>
        </div>
      </div>

      {/* ── Modern Segmented Tab Bar ────────────────────────────────────────── */}
      <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-slate-100/90 border border-slate-200 shadow-inner overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? "text-slate-900 font-extrabold shadow-sm bg-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSettingsTab"
                  className="absolute inset-0 rounded-lg sm:rounded-xl bg-white shadow-xs border border-slate-200/70"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className={`size-3.5 sm:size-4 ${isActive ? "text-cyan-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? "bg-cyan-50 text-cyan-700 border border-cyan-200" : "bg-slate-200/80 text-slate-600"
                  }`}>
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider hidden xs:inline ${
                    isActive ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Main Tab Panels ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-4 sm:p-6 lg:p-8 transition-all">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: USERS & ROLES */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>Staff & Team Access Management</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-100">
                    {users.length} Users
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage authorized administrative accounts, assign operational permissions, and audit credentials.
                </p>
              </div>

              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer active:scale-98"
              >
                <Plus className="size-4" />
                <span>Add Staff User</span>
              </button>
            </div>

            {/* Controls / Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search staff by username..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
                />
                {userSearch && (
                  <button
                    onClick={() => setUserSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Administrators</option>
                  <option value="manager">Managers</option>
                  <option value="viewer">Support / Viewers</option>
                </select>
              </div>
            </div>

            {/* Users Grid / List */}
            {isLoading ? (
              <div className="py-16 text-center">
                <Loader2 className="size-8 text-cyan-500 animate-spin mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-400">Loading authorized accounts...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                <Users className="size-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700">No staff accounts found</h3>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or role filter.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredUsers.map((u) => {
                  const isMaster = u.username === "pools";
                  const roleUpper = (u.role || "Admin").toUpperCase();

                  return (
                    <div
                      key={u.id}
                      className={`relative p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                        isMaster
                          ? "bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700 shadow-md"
                          : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-md"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`size-11 rounded-2xl grid place-items-center font-black text-sm shadow-inner ${
                              isMaster
                                ? "bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950"
                                : "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 border border-slate-300/60"
                            }`}>
                              {u.username?.charAt(0).toUpperCase() || "U"}
                            </div>

                            <div>
                              <div className={`font-black text-sm tracking-tight flex items-center gap-1.5 ${
                                isMaster ? "text-white" : "text-slate-900"
                              }`}>
                                <span>{u.username}</span>
                                {isMaster && (
                                  <Shield className="size-3.5 text-cyan-400 fill-cyan-400/20" />
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase ${
                                  isMaster
                                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                                    : u.role === "admin"
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : u.role === "manager"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                                }`}>
                                  {isMaster ? "Super Admin" : roleUpper}
                                </span>
                              </div>
                            </div>
                          </div>

                          {!isMaster && (
                            <button
                              onClick={() => setUserToDelete(u)}
                              className="size-8 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 grid place-items-center transition cursor-pointer"
                              title="Delete staff account"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className={`mt-4 pt-3.5 border-t flex items-center justify-between text-[11px] ${
                        isMaster ? "border-slate-700/70 text-slate-400" : "border-slate-100 text-slate-400"
                      }`}>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="size-3 text-slate-400" />
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active"}
                        </span>
                        <span className="font-semibold text-emerald-500 flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Authorized
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: SECURITY & MASTER CREDENTIALS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "security" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="pb-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Lock className="size-5 text-cyan-600" />
                <span>Master Security & Credential Management</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Protect your administration panel by regularly cycling cryptographic passwords and auditing security standards.
              </p>
            </div>

            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
              {/* Left Column: Password Update Form */}
              <form onSubmit={handleUpdateSecurity} className="space-y-5 bg-slate-50/70 p-6 sm:p-7 rounded-3xl border border-slate-200/80">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Update Master Password</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Account: <span className="font-mono font-bold text-slate-700">pools (Super Administrator)</span></p>
                </div>

                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center justify-between">
                    <span>Current Password</span>
                    <span className="text-rose-500 font-normal">*Required</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPwd ? "text" : "password"}
                      required
                      value={secCurrentPassword}
                      onChange={(e) => setSecCurrentPassword(e.target.value)}
                      placeholder="Enter current password to verify..."
                      className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    >
                      {showCurrentPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center justify-between">
                    <span>New Master Password</span>
                    {secNewPassword && (
                      <span className={`text-[10px] font-bold ${passwordStrength.textColor}`}>
                        Strength: {passwordStrength.label}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? "text" : "password"}
                      value={secNewPassword}
                      onChange={(e) => setSecNewPassword(e.target.value)}
                      placeholder="Enter strong new password (min. 6 chars)..."
                      className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    >
                      {showNewPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>

                  {/* Password Strength Bar */}
                  {secNewPassword && (
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1.5 flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength.score ? passwordStrength.color : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPwd ? "text" : "password"}
                      value={secConfirmPassword}
                      onChange={(e) => setSecConfirmPassword(e.target.value)}
                      placeholder="Re-type new password..."
                      className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    >
                      {showConfirmPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {secNewPassword && secConfirmPassword && (
                    <div className={`text-[10px] font-bold flex items-center gap-1 mt-1 ${
                      secNewPassword === secConfirmPassword ? "text-emerald-600" : "text-rose-500"
                    }`}>
                      {secNewPassword === secConfirmPassword ? (
                        <CheckCircle className="size-3" />
                      ) : (
                        <AlertTriangle className="size-3" />
                      )}
                      <span>
                        {secNewPassword === secConfirmPassword ? "Passwords match" : "Passwords do not match"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingSecurity || !secCurrentPassword}
                    className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
                  >
                    {isUpdatingSecurity ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Updating Credentials...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-4" />
                        <span>Save New Security Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Right Column: Security Checklist & Policies */}
              <div className="space-y-5">
                <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2.5 text-cyan-400">
                    <Shield className="size-5" />
                    <h4 className="font-black text-sm uppercase tracking-wider">Active Security Policies</h4>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-2.5 text-slate-300">
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-bold">Bcrypt Hashing (Salt Rounds: 10)</strong>
                        <p className="text-slate-400 text-[11px] mt-0.5">All passwords stored in MongoDB use one-way cryptographic salted hashing.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-slate-300">
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-bold">Session Expiry Protection</strong>
                        <p className="text-slate-400 text-[11px] mt-0.5">Administrative tokens expire after inactivity to safeguard session hijacking.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-slate-300">
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-bold">Isolated Primary Account</strong>
                        <p className="text-slate-400 text-[11px] mt-0.5">Master administrator account cannot be deleted by other staff users.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/70 text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                    <AlertTriangle className="size-4 text-amber-600" />
                    <span>Best Practice Recommendation</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    Always use distinct credentials for individual employees. Avoid sharing the master <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">pools</code> password with non-executive staff.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: STOREFRONT & PLATFORM CONFIG */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "platform" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Sliders className="size-5 text-cyan-600" />
                  <span>Platform & Storefront Configuration</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage global checkout operations, active payment gateways, and storefront availability states.
                </p>
              </div>

              <button
                onClick={handleSavePlatform}
                disabled={isSavingPlatform}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 active:scale-98"
              >
                {isSavingPlatform ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="size-4 text-emerald-400" />
                    <span>Save Platform Settings</span>
                  </>
                )}
              </button>
            </div>

            {/* Maintenance Mode Card */}
            <div className={`p-6 rounded-3xl border transition-all ${
              maintenanceMode
                ? "bg-amber-50/80 border-amber-200"
                : "bg-slate-50/80 border-slate-200/80"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`size-3 rounded-full ${maintenanceMode ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                    <h3 className="font-extrabold text-sm text-slate-900">
                      Storefront Maintenance Mode
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 max-w-xl">
                    When enabled, public visitors will see a graceful maintenance banner. Admin dashboard remains fully operational.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>

            {/* Payment Gateways Config */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="size-4 text-cyan-600" />
                  <span>Wholesale Payment Gateways</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Toggle active payment methods available to contractors and wholesale buyers.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      pm.active
                        ? "bg-white border-cyan-200 shadow-sm ring-1 ring-cyan-500/20"
                        : "bg-slate-50/80 border-slate-200 opacity-70"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-sm text-slate-900">{pm.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          pm.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-200 text-slate-500"
                        }`}>
                          {pm.active ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 font-mono">{pm.mode}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600">Checkout Option</span>
                      <button
                        type="button"
                        onClick={() => handleTogglePaymentMethod(pm.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          pm.active
                            ? "bg-slate-900 text-white hover:bg-slate-800"
                            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                        }`}
                      >
                        {pm.active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Storefront Defaults Overview */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 grid sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Default Currency</div>
                <div className="text-base font-black text-white font-mono">USD ($) · United States</div>
                <div className="text-[10px] text-emerald-400 font-semibold">Standard Wholesale ISO-4217</div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Freight & Logistics</div>
                <div className="text-base font-black text-white">15% Standard Dispatch</div>
                <div className="text-[10px] text-slate-400">Applied automatically at checkout</div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Sales Tax Policy</div>
                <div className="text-base font-black text-white">Destination-Based (AVATAX)</div>
                <div className="text-[10px] text-cyan-400 font-semibold">Reseller Exemption Ready</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: DATABASE TELEMETRY & DATA MIGRATIONS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "database" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Database className="size-5 text-cyan-600" />
                  <span>MongoDB Atlas Telemetry & Data Sync</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Real-time document telemetry across core database collections and default wholesale catalog seeding utilities.
                </p>
              </div>

              <button
                onClick={() => setIsMigrationModalOpen(true)}
                disabled={isMigrating}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-40 active:scale-98"
              >
                <RefreshCw className={`size-4 ${isMigrating ? "animate-spin" : ""}`} />
                <span>Seed Wholesale Catalog</span>
              </button>
            </div>

            {/* Real-time Collection Counter Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                  <span>Products Collection</span>
                  <ShoppingBag className="size-4 text-cyan-600" />
                </div>
                <div className="mt-2 text-3xl font-black text-slate-900 font-mono">
                  {dbStats?.productsCount ?? "..."}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-1 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-cyan-500" />
                  db.products
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                  <span>Customer Orders</span>
                  <FileText className="size-4 text-blue-600" />
                </div>
                <div className="mt-2 text-3xl font-black text-slate-900 font-mono">
                  {dbStats?.ordersCount ?? "..."}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-1 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-blue-500" />
                  db.orders
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                  <span>Product Reviews</span>
                  <MessageSquare className="size-4 text-amber-500" />
                </div>
                <div className="mt-2 text-3xl font-black text-slate-900 font-mono">
                  {dbStats?.reviewsCount ?? "..."}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-1 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  db.reviews
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                  <span>Staff & Auth</span>
                  <Users className="size-4 text-purple-600" />
                </div>
                <div className="mt-2 text-3xl font-black text-slate-900 font-mono">
                  {users.length}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-1 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-purple-500" />
                  db.users
                </div>
              </div>
            </div>

            {/* Database Engine Telemetry Details */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <HardDrive className="size-5 text-cyan-400" />
                  <h3 className="font-black text-sm uppercase tracking-wider text-white">Cluster Health & Connectivity</h3>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  Cluster Operational
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-slate-400 text-[10px] font-black uppercase">Engine Type</div>
                  <div className="font-bold text-white mt-1">MongoDB Atlas v7.0</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Wire Protocol 4.4+</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-slate-400 text-[10px] font-black uppercase">Database Schema</div>
                  <div className="font-bold text-white mt-1 font-mono">aquapro_pool</div>
                  <div className="text-[10px] text-cyan-400 mt-0.5">Read/Write Access Confirmed</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-slate-400 text-[10px] font-black uppercase">Client Connection Pool</div>
                  <div className="font-bold text-white mt-1">Single Global Shared Pool</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Zero Leakage Re-use</div>
                </div>
              </div>
            </div>

            {/* Cache Flush Card */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-slate-900">Query Cache Invalidation</h4>
                <p className="text-xs text-slate-500">Purge client-side memory cache across all product catalogs and detail routes.</p>
              </div>
              <button
                onClick={() => {
                  invalidateProductsCache(queryClient);
                  triggerToast("Product cache successfully purged!", "info");
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-white text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
              >
                Purge Query Cache
              </button>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 5: API KEYS & GATEWAY INTEGRATIONS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "integrations" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="pb-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Key className="size-5 text-cyan-600" />
                <span>API Keys & Service Integrations</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Inspect public gateway keys, webhook handlers, and transactional notification services.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Stripe API Credentials */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm text-slate-900">
                    <CreditCard className="size-4 text-cyan-600" />
                    <span>Stripe Live Gateway</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                    Live
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Publishable API Key</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value="pk_live_51TxoN3LlienmBCcZCAlvmfLnIsLe0BaWwIaBTSm8CrVBjuh7dPLzpHbe9QXiWKR9zxPYdBqJNbEoPNDCSGWcL5C900sY0uRiB2"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-slate-700 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard("pk_live_51TxoN3LlienmBCcZCAlvmfLnIsLe0BaWwIaBTSm8CrVBjuh7dPLzpHbe9QXiWKR9zxPYdBqJNbEoPNDCSGWcL5C900sY0uRiB2", "Stripe Public Key")}
                      className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition cursor-pointer"
                      title="Copy key"
                    >
                      {copiedKey === "Stripe Public Key" ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Webhook Endpoint</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value="https://poolsupplywholesalers.com/api/stripe/webhook"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-slate-700 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard("https://poolsupplywholesalers.com/api/stripe/webhook", "Webhook URL")}
                      className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition cursor-pointer"
                      title="Copy webhook URL"
                    >
                      {copiedKey === "Webhook URL" ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Transactional Email Service */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm text-slate-900">
                    <Zap className="size-4 text-amber-500" />
                    <span>Nodemailer / SMTP Gateway</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-cyan-100 text-cyan-800">
                    SSL 465
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                    <span className="font-bold text-slate-400">Host Server</span>
                    <span className="font-mono font-bold text-slate-800">smtp.poolsupplywholesalers.com</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                    <span className="font-bold text-slate-400">Automated Dispatch</span>
                    <span className="font-bold text-emerald-600">Order Confirmation & Invoices</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="font-bold text-slate-400">Admin Notification Alerts</span>
                    <span className="font-bold text-slate-800">orders@poolsupplywholesalers.com</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Add User Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isAddUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-5"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-cyan-50 text-cyan-600 grid place-items-center">
                    <User className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Add Staff Account</h3>
                    <p className="text-[11px] text-slate-400">Authorize a new team member with specific role rights.</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="size-8 rounded-xl bg-slate-100 hover:bg-slate-200 grid place-items-center text-slate-500 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600">Username</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. jiten.operations"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600">Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600">Account Access Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="manager">Manager (Orders, Products, Customer Quotes)</option>
                    <option value="viewer">Support / Viewer (Read-only catalog & returns)</option>
                    <option value="admin">Administrator (Full Dashboard Access)</option>
                  </select>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingUser}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {isCreatingUser ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="size-3.5" />
                        <span>Create Account</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 max-w-sm w-full space-y-4 text-center"
            >
              <div className="size-12 rounded-2xl bg-rose-50 text-rose-600 grid place-items-center mx-auto">
                <Trash2 className="size-6" />
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">Delete Staff Account?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to revoke access for <strong className="text-slate-800">'{userToDelete.username}'</strong>? This action is immediate.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteUser}
                  disabled={isDeletingUser}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-md transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeletingUser ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Wholesale Catalog Seed Confirmation Modal ────────────────────── */}
      <AnimatePresence>
        {isMigrationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-cyan-50 text-cyan-600 grid place-items-center shrink-0">
                  <Database className="size-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Seed Default Wholesale Catalog</h3>
                  <p className="text-xs text-slate-400">Synchronize commercial pool catalog into MongoDB.</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                This process will populate your live database with the complete commercial product database ({products.length} master SKU items). Existing product IDs will be safely updated without deleting customer order records.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMigrationModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRunMigration}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-md transition cursor-pointer"
                >
                  Begin Seed Sync
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
