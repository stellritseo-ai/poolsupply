import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Users,
  Settings as SettingsIcon,
  Lock,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ServerCrash,
  User,
  Database,
  RefreshCw,
  Server,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { getUsers, createUser, deleteUser, updateSuperAdmin } from "@/lib/api/users.functions";
import { getGlobalSettings, updateGlobalSettings } from "@/lib/api/settings.functions";
import { getDatabaseStats, migrateData } from "@/lib/api/migration.functions";
import { products } from "@/lib/products";

export const Route = createFileRoute("/admin/settings")({
  component: SystemSettings,
});

function SystemSettings() {
  const [activeTab, setActiveTab] = useState<"users" | "security" | "platform" | "database">("users");
  const [toast, setToast] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("manager");

  // Security State
  const [currentUsername, setCurrentUsername] = useState("pools");
  const [secCurrentPassword, setSecCurrentPassword] = useState("");
  const [secNewPassword, setSecNewPassword] = useState("");
  const [secConfirmPassword, setSecConfirmPassword] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Platform State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  // Database Sync State
  const [dbStats, setDbStats] = useState<any>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      const [usersRes, settingsRes] = await Promise.all([getUsers(), getGlobalSettings()]);

      if (usersRes.success && usersRes.users) {
        setUsers(usersRes.users);
      }

      if (settingsRes.success && settingsRes.settings) {
        setMaintenanceMode(settingsRes.settings.maintenanceMode);
        setPaymentMethods(settingsRes.settings.paymentMethods || []);
      }

      const dbRes = await getDatabaseStats();
      if (dbRes.success) setDbStats(dbRes.stats);

      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;

    const res = await createUser({ data: { username: newUsername, password: newPassword, role: newRole as any } });
    if (res.success && res.user) {
      setUsers([...users, { ...res.user, createdAt: new Date() }]);
      triggerToast("Staff user added successfully");
      setIsAddUserModalOpen(false);
      setNewUsername("");
      setNewPassword("");
    } else {
      triggerToast(res.error || "Failed to add user");
    }
  };

  const handleDeleteUser = async (id: string) => {
    const res = await deleteUser({ data: { id } });
    if (res.success) {
      setUsers(users.filter((u) => u.id !== id));
      triggerToast("User deleted");
    } else {
      triggerToast(res.error || "Failed to delete user");
    }
  };

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secCurrentPassword) return triggerToast("Current password required");
    if (secNewPassword && secNewPassword !== secConfirmPassword) {
      return triggerToast("New passwords do not match.");
    }
    if (secNewPassword && secNewPassword.length < 6) {
      return triggerToast("New password must be at least 6 characters.");
    }

    const res = await updateSuperAdmin({
      data: {
        currentUsername,
        currentPassword: secCurrentPassword,
        newPassword: secNewPassword || undefined,
      },
    });

    if (res.success) {
      triggerToast("Security password updated successfully");
      setSecCurrentPassword("");
      setSecNewPassword("");
      setSecConfirmPassword("");
    } else {
      triggerToast(res.error || "Failed to update profile");
    }
  };

  const handleSavePlatform = async () => {
    const res = await updateGlobalSettings({
      data: {
        maintenanceMode,
        paymentMethods,
      },
    });
    if (res.success) {
      triggerToast("Platform settings saved successfully");
    } else {
      triggerToast(res.error || "Failed to save settings");
    }
  };

  const handleRunMigration = async () => {
    if (!confirm("Are you sure you want to seed default mock catalog data into MongoDB?")) return;
    setIsMigrating(true);
    const res = await migrateData({ data: { products, orders: [], reviews: [] } });
    if (res.success && res.stats) {
      triggerToast(`Database migration complete (${res.stats.products} products synced)`);
      const dbRes = await getDatabaseStats();
      if (dbRes.success) setDbStats(dbRes.stats);
    } else {
      triggerToast(res.error || "Migration failed");
    }
    setIsMigrating(false);
  };

  return (
    <div className="space-y-6 max-w-[1360px] mx-auto w-full">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-2xl text-xs font-bold border border-slate-800"
          >
            <CheckCircle className="size-4 text-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="size-7 text-cyan-600" />
          <span>System & Security Controls</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
          Configure administrative users, security credentials, platform settings, and live database telemetry.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-white border border-slate-200/90 p-2 rounded-2xl shadow-2xs overflow-x-auto">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === "users" ? "bg-slate-900 text-white shadow-sm font-extrabold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Users className="size-3.5" />
          <span>Staff Accounts</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === "security" ? "bg-slate-900 text-white shadow-sm font-extrabold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Lock className="size-3.5" />
          <span>Security & Password</span>
        </button>

        <button
          onClick={() => setActiveTab("platform")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === "platform" ? "bg-slate-900 text-white shadow-sm font-extrabold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <SettingsIcon className="size-3.5" />
          <span>Platform Config</span>
        </button>

        <button
          onClick={() => setActiveTab("database")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === "database" ? "bg-slate-900 text-white shadow-sm font-extrabold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Database className="size-3.5" />
          <span>Database Telemetry</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs">
        {/* TAB 1: USERS */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Administrator & Staff Users</h3>
                <p className="text-xs text-slate-400 font-medium">Manage authorized staff credentials and access roles.</p>
              </div>

              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-md cursor-pointer transition"
              >
                <Plus className="size-4" />
                <span>Add Staff User</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {users.map((u) => (
                <div key={u.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-cyan-50 text-cyan-700 grid place-items-center font-black text-xs">
                      {u.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">{u.username}</div>
                      <span className="inline-block text-[10px] font-black uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                        {u.role || "Admin"}
                      </span>
                    </div>
                  </div>

                  {u.username !== "pools" && (
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SECURITY */}
        {activeTab === "security" && (
          <form onSubmit={handleUpdateSecurity} className="max-w-md space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Update Master Credentials</h3>
              <p className="text-xs text-slate-400 font-medium">Modify administrative password for the master account.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Current Password</label>
              <input
                type="password"
                required
                value={secCurrentPassword}
                onChange={(e) => setSecCurrentPassword(e.target.value)}
                placeholder="Enter current password..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">New Password</label>
              <input
                type="password"
                required
                value={secNewPassword}
                onChange={(e) => setSecNewPassword(e.target.value)}
                placeholder="Enter new security password..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Confirm New Password</label>
              <input
                type="password"
                required
                value={secConfirmPassword}
                onChange={(e) => setSecConfirmPassword(e.target.value)}
                placeholder="Confirm new security password..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-md cursor-pointer transition"
            >
              <ShieldCheck className="size-4" />
              <span>Update Security Password</span>
            </button>
          </form>
        )}

        {/* TAB 3: PLATFORM */}
        {activeTab === "platform" && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h3 className="text-lg font-black text-slate-900">Platform & Checkout Config</h3>
              <p className="text-xs text-slate-400 font-medium">Control global storefront flags and maintenance statuses.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <div className="font-extrabold text-sm text-slate-900">Maintenance Mode</div>
                <div className="text-xs text-slate-400">Temporarily display maintenance banner to public visitors.</div>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="size-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
              />
            </div>

            <button
              onClick={handleSavePlatform}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider shadow-md cursor-pointer transition"
            >
              <CheckCircle className="size-4" />
              <span>Save Platform Settings</span>
            </button>
          </div>
        )}

        {/* TAB 4: DATABASE */}
        {activeTab === "database" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">Database Engine & Migrations</h3>
              <p className="text-xs text-slate-400 font-medium">Monitor active MongoDB collections and trigger data seeds.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Products in DB</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{dbStats?.productsCount || 0}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Orders Logged</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{dbStats?.ordersCount || 0}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Database Engine</div>
                <div className="text-base font-black text-emerald-600 mt-1">MongoDB Atlas Live</div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleRunMigration}
                disabled={isMigrating}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-md cursor-pointer disabled:opacity-40 transition"
              >
                <RefreshCw className={`size-4 ${isMigrating ? "animate-spin" : ""}`} />
                <span>Seed Default Wholesale Catalog</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 max-w-md w-full space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">Add Staff Account</h3>
                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="size-8 rounded-xl bg-slate-100 hover:bg-slate-200 grid place-items-center text-slate-500"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Username</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Staff username..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:bg-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Staff password..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:bg-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:bg-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="manager">Manager</option>
                    <option value="support">Support Agent</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black uppercase shadow-md"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
