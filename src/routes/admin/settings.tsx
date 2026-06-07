import { createFileRoute } from '@tanstack/react-router';
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
  EyeOff
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
  const [currentUsername, setCurrentUsername] = useState("pools"); // Default assumption
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

      const [usersRes, settingsRes] = await Promise.all([
        getUsers(),
        getGlobalSettings()
      ]);

      if (usersRes.success && usersRes.users) {
        setUsers(usersRes.users);
      }

      if (settingsRes.success && settingsRes.settings) {
        setMaintenanceMode(settingsRes.settings.maintenanceMode);
        setPaymentMethods(settingsRes.settings.paymentMethods || []);
      }

      // Fetch DB Stats
      const dbRes = await getDatabaseStats();
      if (dbRes.success) setDbStats(dbRes.stats);

      setIsLoading(false);
    }
    loadData();
  }, []);

  // Handlers: Users
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;

    const res = await createUser({ data: { username: newUsername, password: newPassword, role: newRole as any } });
    if (res.success && res.user) {
      setUsers([...users, { ...res.user, createdAt: new Date() }]);
      triggerToast("User added successfully");
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
      setUsers(users.filter(u => u.id !== id));
      triggerToast("User deleted");
    } else {
      triggerToast(res.error || "Failed to delete user");
    }
  };

  // Handlers: Security
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
        newPassword: secNewPassword || undefined
      }
    });

    if (res.success) {
      triggerToast("Security profile updated successfully");
      setSecCurrentPassword("");
      setSecNewPassword("");
      setSecConfirmPassword("");
    } else {
      triggerToast(res.error || "Failed to update profile");
    }
  };

  // Handlers: Platform
  const handleToggleMaintenance = async () => {
    const newState = !maintenanceMode;
    setMaintenanceMode(newState);
    await updateGlobalSettings({ data: { maintenanceMode: newState } });
    triggerToast(`Maintenance mode ${newState ? "Enabled" : "Disabled"}`);
  };

  const handleTogglePayment = async (id: string) => {
    const updated = paymentMethods.map(p =>
      p.id === id ? { ...p, active: !p.active } : p
    );
    setPaymentMethods(updated);
    await updateGlobalSettings({ data: { paymentMethods: updated } });
    triggerToast("Payment gateways updated");
  };

  // Handlers: Database
  const handleMigration = async () => {
    setIsMigrating(true);
    try {
      const storedProducts = JSON.parse(localStorage.getItem("aquapro_db_products") || "[]");
      const storedOrders = JSON.parse(localStorage.getItem("aquapro_orders") || "[]");
      const storedReviews = JSON.parse(localStorage.getItem("aquapro_global_reviews") || "[]");
      const payloadProducts = storedProducts.length > 0 ? storedProducts : products;
      const res = await migrateData({ data: { products: payloadProducts, orders: storedOrders, reviews: storedReviews } });
      if (res.success) {
        setDbStats(res.stats);
        triggerToast("Data synced to MongoDB Atlas!");
      } else {
        triggerToast("Migration failed: " + res.error);
      }
    } catch (e) {
      console.error(e);
      triggerToast("Migration encountered an error.");
    } finally {
      setIsMigrating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg text-xs font-bold"
          >
            <CheckCircle className="size-4.5 text-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage global configuration, security, and staff access.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: "users", label: "User Management", icon: Users },
          { id: "security", label: "Security", icon: Shield },
          { id: "platform", label: "Platform Config", icon: SettingsIcon },
          { id: "database", label: "Database Sync", icon: Database }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl"
              }`}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="pt-4">

        {/* USERS TAB */}
        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">Staff Accounts</h2>
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="py-2.5 px-4 rounded-full bg-slate-900 text-white font-semibold text-xs shadow-md flex items-center gap-1.5 hover:bg-slate-800 transition-all"
              >
                <Plus className="size-4" /> Add User
              </button>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs font-semibold border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-400 uppercase tracking-wider">
                    <th className="p-4 font-bold">Username</th>
                    <th className="p-4 font-bold">Role</th>
                    <th className="p-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                        <div className="size-8 rounded-full bg-slate-100 grid place-items-center">
                          <User className="size-4 text-slate-400" />
                        </div>
                        {u.username}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${u.role === "admin" ? "bg-primary/10 text-primary" :
                            u.role === "manager" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                          }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="size-8 rounded-lg hover:bg-rose-50 text-rose-600 inline-grid place-items-center transition"
                          title="Delete User"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add User Modal */}
            <AnimatePresence>
              {isAddUserModalOpen && (
                <>
                  <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={() => setIsAddUserModalOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-full max-w-sm bg-white rounded-[2rem] border border-slate-200 p-6 shadow-2xl"
                  >
                    <h3 className="font-extrabold text-lg text-slate-900 mb-4">Create Staff Account</h3>
                    <form onSubmit={handleAddUser} className="space-y-4">
                      <label className="block">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Username</span>
                        <input
                          type="text" required value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-primary transition"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Password</span>
                        <input
                          type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-primary transition"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Role Level</span>
                        <select
                          value={newRole} onChange={(e) => setNewRole(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:outline-none focus:border-primary transition"
                        >
                          <option value="admin">Super Admin</option>
                          <option value="manager">Manager</option>
                          <option value="viewer">Order Viewer</option>
                        </select>
                      </label>
                      <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="flex-1 py-2.5 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-100 transition">Cancel</button>
                        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-md hover:bg-primary/90 transition">Create User</button>
                      </div>
                    </form>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* SECURITY TAB */}
        {activeTab === "security" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl">
            <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-ocean" />
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <Lock className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Update Profile Credentials</h2>
                  <p className="text-xs text-slate-500 font-medium">Change your Super Admin login details.</p>
                </div>
              </div>

              <form onSubmit={handleUpdateSecurity} className="space-y-4">
                <label className="block">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Current Password (Required)</span>
                  <div className="relative">
                    <input
                      type={showCurrentPwd ? "text" : "password"} required value={secCurrentPassword} onChange={(e) => setSecCurrentPassword(e.target.value)}
                      placeholder="Enter current password to authorize changes"
                      className="w-full h-11 pl-3 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-primary transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showCurrentPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </label>

                <div className="pt-4 border-t border-slate-100">
                  <label className="block mb-4">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">New Password (Required)</span>
                    <div className="relative">
                      <input
                        type={showNewPwd ? "text" : "password"} value={secNewPassword} onChange={(e) => setSecNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full h-11 pl-3 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-primary transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPwd(!showNewPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      >
                        {showNewPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </label>
                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Confirm Password (Required)</span>
                    <div className="relative">
                      <input
                        type={showConfirmPwd ? "text" : "password"} value={secConfirmPassword} onChange={(e) => setSecConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full h-11 pl-3 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-primary transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      >
                        {showConfirmPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </label>
                </div>

                <button type="submit" className="w-full mt-2 py-3.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md hover:bg-slate-800 transition">
                  Securely Update Credentials
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* PLATFORM TAB */}
        {activeTab === "platform" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-3xl">

            {/* Maintenance Mode */}
            <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`size-12 rounded-full flex items-center justify-center ${maintenanceMode ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {maintenanceMode ? <ServerCrash className="size-6" /> : <CheckCircle className="size-6" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Storefront Maintenance Mode</h3>
                  <p className="text-xs text-slate-500 font-medium">When active, the public store is hidden behind a maintenance page.</p>
                </div>
              </div>

              <button
                onClick={handleToggleMaintenance}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${maintenanceMode ? 'bg-amber-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block size-5 transform rounded-full bg-white shadow-sm transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Payment Gateways */}
            <div>
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="size-5 text-primary" /> Active Payment Gateways
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                {paymentMethods.map(pm => (
                  <div key={pm.id} className={`bg-white border rounded-[1.5rem] p-5 transition-all ${pm.active ? 'border-primary shadow-[0_0_0_1px_rgba(2,132,199,0.2)]' : 'border-slate-200/60 shadow-sm opacity-70'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="font-bold text-slate-900">{pm.name}</div>
                      <button
                        onClick={() => handleTogglePayment(pm.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${pm.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block size-3.5 transform rounded-full bg-white shadow-sm transition-transform ${pm.active ? 'translate-x-4.5' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {Object.keys(pm).filter(k => !['id', 'name', 'active'].includes(k)).map(key => (
                        <div key={key}>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">{key}</span>
                          <input
                            type="text" disabled value={pm[key]}
                            className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-slate-50 text-[10px] text-slate-500 font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {/* DATABASE TAB */}
        {activeTab === "database" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl">
            <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-ocean" />
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                    <Database className="size-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 tracking-tight text-base">MongoDB Atlas Sync</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-md">
                      Synchronize your active local datasets to your secure cloud database cluster.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleMigration}
                  disabled={isMigrating}
                  className="shrink-0 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-md"
                >
                  <RefreshCw className={`size-4 ${isMigrating ? 'animate-spin' : ''}`} />
                  {isMigrating ? "Syncing to Cloud..." : "Sync Local Data to Atlas"}
                </button>
              </div>

              {dbStats && (
                <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-3 gap-4">
                  {[
                    { label: "Products", value: dbStats.products, color: "text-primary" },
                    { label: "Orders", value: dbStats.orders, color: "text-emerald-600" },
                    { label: "Reviews", value: dbStats.reviews, color: "text-violet-600" }
                  ].map(stat => (
                    <div key={stat.label} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className={`text-2xl font-black tracking-tight ${stat.color}`}>{stat.value}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">{stat.label} in Atlas</div>
                    </div>
                  ))}
                </div>
              )}

              {!dbStats && !isMigrating && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <Server className="size-4 text-slate-300" />
                    Click "Sync" above to push your local data to MongoDB Atlas and see live stats.
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
