import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Lock,
  Unlock,
  CreditCard,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  User,
  Database,
  RefreshCw,
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
  HardDrive,
  Radio,
  Clock,
  Zap,
  ShoppingBag,
  MessageSquare,
  FileText,
  Mail,
  Download,
  Send,
  AlertCircle,
  Cpu,
  Wifi,
} from "lucide-react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  updateSuperAdmin,
} from "@/lib/api/users.functions";
import {
  getGlobalSettings,
  updateGlobalSettings,
  testMongoPing,
  sendTestEmail,
  getSecurityAuditLogs,
  clearSecurityLockout,
  GlobalSettingsType,
} from "@/lib/api/settings.functions";
import {
  getDatabaseStats,
  migrateData,
  exportCollectionSnapshot,
} from "@/lib/api/migration.functions";
import { deduplicateProductsDb, inspectProductsCollection } from "@/lib/api/products.functions";
import { products, invalidateProductsCache } from "@/lib/products";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/admin/settings")({
  component: SystemSettings,
});

type TabType = "users" | "security" | "platform" | "database" | "integrations";

export function SystemSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [toast, setToast] = useState<{
    message: string;
    type?: "success" | "error" | "info";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Global Platform & Integration Settings State ──────────────────────────
  const [settings, setSettings] = useState<GlobalSettingsType | null>(null);
  const [isSavingPlatform, setIsSavingPlatform] = useState(false);
  const [isSavingIntegrations, setIsSavingIntegrations] = useState(false);

  // Form states for editable settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceNotice, setMaintenanceNotice] = useState("");
  const [storeProfile, setStoreProfile] = useState({
    name: "Pool Supply Wholesalers",
    tagline: "Commercial Grade Pool Equipment & Supplies",
    supportEmail: "support@poolsupplywholesalers.com",
    phone: "(800) 555-POOL",
    address: "742 Evergreen Terrace, Suite 100, Phoenix, AZ 85001",
    supportHours: "Mon - Fri: 7:00 AM - 6:00 PM MST",
    currency: "USD ($)",
  });
  const [logistics, setLogistics] = useState({
    freeShippingThreshold: 500,
    standardFreightRatePercent: 15,
    estimatedDeliveryDays: "3-5 Business Days",
    handlingFee: 0,
  });
  const [compliance, setCompliance] = useState({
    taxRatePercent: 8.25,
    taxExemptionEnabled: true,
    requireBusinessTaxId: false,
  });
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [stripeConfig, setStripeConfig] = useState({
    mode: "live" as "live" | "test",
    publishableKey: "",
    secretKey: "",
    webhookSecret: "",
  });
  const [smtpConfig, setSmtpConfig] = useState({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    user: "jitenksony@gmail.com",
    fromName: "Pool Supply Wholesalers Desk",
    fromEmail: "orders@poolsupplywholesalers.com",
    adminAlertEmail: "jitenksony@gmail.com, pswelio@yahoo.com",
  });
  const [analyticsConfig, setAnalyticsConfig] = useState({
    ga4Id: "G-PSWH99201X",
    gtmId: "GTM-KB882PL",
    metaPixelId: "982341908234",
  });
  const [notificationsConfig, setNotificationsConfig] = useState({
    orderAlerts: true,
    inquiryAlerts: true,
    lowStockAlerts: true,
    discordWebhookUrl: "",
    slackWebhookUrl: "",
  });
  const [securityPolicy, setSecurityPolicy] = useState({
    sessionTimeoutMinutes: 60,
    maxFailedAttempts: 3,
    lockoutDurationMinutes: 180,
  });

  // ── Staff & Roles State ───────────────────────────────────────────────────
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("all");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any | null>(null);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);

  // New user modal form
  const [newUsername, setNewUsername] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "manager" | "viewer">("manager");
  const [newStatus, setNewStatus] = useState<"active" | "inactive">("active");
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Edit user modal form
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "manager" | "viewer">("manager");
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active");
  const [editPassword, setEditPassword] = useState("");
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // ── Security & Master Auth State ──────────────────────────────────────────
  const [currentUsername, setCurrentUsername] = useState("pools");
  const [newMasterUsername, setNewMasterUsername] = useState("");
  const [secCurrentPassword, setSecCurrentPassword] = useState("");
  const [secNewPassword, setSecNewPassword] = useState("");
  const [secConfirmPassword, setSecConfirmPassword] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false);
  const [isSavingSecurityPolicy, setIsSavingSecurityPolicy] = useState(false);

  // Security audit logs & lockouts
  const [securityLocks, setSecurityLocks] = useState<any[]>([]);
  const [securityLogins, setSecurityLogins] = useState<any[]>([]);
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false);
  const [clearingLockKey, setClearingLockKey] = useState<string | null>(null);

  // ── Database Telemetry State ──────────────────────────────────────────────
  const [dbStats, setDbStats] = useState<any>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);

  // Ping Latency State
  const [isPingingDb, setIsPingingDb] = useState(false);
  const [lastPingResult, setLastPingResult] = useState<{
    latencyMs: number;
    status: string;
    collectionsCount: number;
    timestamp: string;
  } | null>(null);

  // Snapshot export
  const [exportCollection, setExportCollection] = useState<any>("products");
  const [isExporting, setIsExporting] = useState(false);

  // Catalog Deduplication State
  const [isDeduplicateModalOpen, setIsDeduplicateModalOpen] = useState(false);
  const [isDeduplicating, setIsDeduplicating] = useState(false);
  const [isInspectingDuplicates, setIsInspectingDuplicates] = useState(false);
  const [duplicateAuditInfo, setDuplicateAuditInfo] = useState<{
    total: number;
    excessDuplicates: number;
    cleanTotal: number;
    uniqueDuplicateSkusCount: number;
    sampleDuplicates?: any[];
  } | null>(null);

  // ── SMTP Test Email State ─────────────────────────────────────────────────
  const [testEmailRecipient, setTestEmailRecipient] = useState("jitenksony@gmail.com");
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showStripeWebhookSecret, setShowStripeWebhookSecret] = useState(false);

  // Copy helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const triggerToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    triggerToast(`Copied ${label} to clipboard!`, "info");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ── Load All Data ─────────────────────────────────────────────────────────
  const loadAllData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [usersRes, settingsRes, dbRes, auditRes] = await Promise.all([
        getUsers(),
        getGlobalSettings(),
        getDatabaseStats(),
        getSecurityAuditLogs(),
      ]);

      if (usersRes.success && usersRes.users) {
        setUsers(usersRes.users);
      }

      if (settingsRes.success && settingsRes.settings) {
        const s = settingsRes.settings;
        setSettings(s);
        setMaintenanceMode(Boolean(s.maintenanceMode));
        setMaintenanceNotice(s.maintenanceNotice || "");
        if (s.store) setStoreProfile((prev) => ({ ...prev, ...s.store }));
        if (s.logistics) setLogistics((prev) => ({ ...prev, ...s.logistics }));
        if (s.compliance) setCompliance((prev) => ({ ...prev, ...s.compliance }));
        if (s.paymentMethods && Array.isArray(s.paymentMethods))
          setPaymentMethods(s.paymentMethods);
        if (s.stripe) setStripeConfig((prev) => ({ ...prev, ...s.stripe }));
        if (s.smtp) setSmtpConfig((prev) => ({ ...prev, ...s.smtp }));
        if (s.analytics) setAnalyticsConfig((prev) => ({ ...prev, ...s.analytics }));
        if (s.notifications) setNotificationsConfig((prev) => ({ ...prev, ...s.notifications }));
        if (s.securityPolicy) setSecurityPolicy((prev) => ({ ...prev, ...s.securityPolicy }));
      }

      if (dbRes.success && dbRes.stats) {
        setDbStats(dbRes.stats);
      }

      if (auditRes.success) {
        setSecurityLocks(auditRes.locks || []);
        setSecurityLogins(auditRes.logins || []);
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

  // ── Filtered Users List ───────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const query = userSearch.trim().toLowerCase();
      const matchesSearch =
        !query ||
        (u.username || "").toLowerCase().includes(query) ||
        (u.fullName || "").toLowerCase().includes(query) ||
        (u.email || "").toLowerCase().includes(query);

      const matchesRole =
        userRoleFilter === "all" ||
        (u.role || "manager").toLowerCase() === userRoleFilter.toLowerCase();
      const matchesStatus =
        userStatusFilter === "all" ||
        (u.status || "active").toLowerCase() === userStatusFilter.toLowerCase();

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  // ── User Handlers ─────────────────────────────────────────────────────────
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
          fullName: newFullName.trim() || undefined,
          email: newEmail.trim() || undefined,
          password: newPassword,
          role: newRole,
          status: newStatus,
        },
      });

      if (res.success && res.user) {
        setUsers((prev) => [...prev, res.user]);
        triggerToast(`Staff account '${newUsername}' created successfully`, "success");
        setIsAddUserModalOpen(false);
        setNewUsername("");
        setNewFullName("");
        setNewEmail("");
        setNewPassword("");
        setNewRole("manager");
        setNewStatus("active");
      } else {
        triggerToast(res.error || "Failed to create staff account", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Failed to add user", "error");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleOpenEditUser = (user: any) => {
    setUserToEdit(user);
    setEditFullName(user.fullName || user.username || "");
    setEditEmail(user.email || "");
    setEditRole(user.role || "manager");
    setEditStatus(user.status || "active");
    setEditPassword("");
  };

  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    setIsUpdatingUser(true);
    try {
      const res = await updateUser({
        data: {
          id: userToEdit.id,
          fullName: editFullName.trim(),
          email: editEmail.trim(),
          role: editRole,
          status: editStatus,
          password: editPassword.trim().length >= 6 ? editPassword.trim() : undefined,
        },
      });

      if (res.success && res.user) {
        setUsers((prev) => prev.map((u) => (u.id === userToEdit.id ? { ...u, ...res.user } : u)));
        triggerToast(`Staff account '${userToEdit.username}' updated!`, "success");
        setUserToEdit(null);
      } else {
        triggerToast(res.error || "Failed to update staff user", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Error updating user", "error");
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleToggleUserStatus = async (user: any) => {
    const nextStatus = user.status === "active" ? "inactive" : "active";
    try {
      const res = await updateUser({
        data: {
          id: user.id,
          status: nextStatus,
        },
      });
      if (res.success) {
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)));
        triggerToast(`Account status set to ${nextStatus}`, "info");
      } else {
        triggerToast(res.error || "Failed to update status", "error");
      }
    } catch (err: any) {
      triggerToast("Failed to toggle status", "error");
    }
  };

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

  // ── Master Security Handlers ──────────────────────────────────────────────
  const passwordStrength = useMemo(() => {
    if (!secNewPassword)
      return { score: 0, label: "None", color: "bg-slate-200", textColor: "text-slate-400" };
    let score = 0;
    if (secNewPassword.length >= 6) score += 1;
    if (secNewPassword.length >= 10) score += 1;
    if (/[A-Z]/.test(secNewPassword)) score += 1;
    if (/[0-9]/.test(secNewPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(secNewPassword)) score += 1;

    if (score <= 2)
      return { score, label: "Weak", color: "bg-rose-500", textColor: "text-rose-500" };
    if (score <= 4)
      return { score, label: "Good", color: "bg-amber-500", textColor: "text-amber-500" };
    return {
      score,
      label: "Enterprise Strong",
      color: "bg-emerald-500",
      textColor: "text-emerald-500",
    };
  }, [secNewPassword]);

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
          newUsername: newMasterUsername.trim() || undefined,
          currentPassword: secCurrentPassword,
          newPassword: secNewPassword || undefined,
        },
      });

      if (res.success) {
        triggerToast("Master security credentials updated successfully", "success");
        if (newMasterUsername.trim()) setCurrentUsername(newMasterUsername.trim());
        setNewMasterUsername("");
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

  const handleSaveSecurityPolicy = async () => {
    setIsSavingSecurityPolicy(true);
    try {
      const res = await updateGlobalSettings({
        data: { securityPolicy },
      });
      if (res.success) {
        triggerToast("Session & Lockout Security Policies saved!", "success");
      } else {
        triggerToast(res.error || "Failed to update security policies", "error");
      }
    } catch (err: any) {
      triggerToast("Error saving security policy", "error");
    } finally {
      setIsSavingSecurityPolicy(false);
    }
  };

  const handleClearLockout = async (key: string) => {
    setClearingLockKey(key);
    try {
      const res = await clearSecurityLockout({ data: { key } });
      if (res.success) {
        setSecurityLocks((prev) => prev.filter((l) => l.key !== key && l.id !== key));
        triggerToast(`Lockout cleared for ${key}`, "success");
      } else {
        triggerToast(res.error || "Failed to clear lockout", "error");
      }
    } catch (err: any) {
      triggerToast("Error clearing lockout", "error");
    } finally {
      setClearingLockKey(null);
    }
  };

  const refreshAuditLogs = async () => {
    setIsLoadingAuditLogs(true);
    try {
      const res = await getSecurityAuditLogs();
      if (res.success) {
        setSecurityLocks(res.locks || []);
        setSecurityLogins(res.logins || []);
        triggerToast("Audit logs refreshed", "info");
      }
    } finally {
      setIsLoadingAuditLogs(false);
    }
  };

  // ── Platform & Storefront Handlers ────────────────────────────────────────
  const handleTogglePaymentMethod = (methodId: string) => {
    setPaymentMethods((prev) =>
      prev.map((m) => (m.id === methodId ? { ...m, active: !m.active } : m)),
    );
  };

  const handleSavePlatform = async () => {
    setIsSavingPlatform(true);
    try {
      const res = await updateGlobalSettings({
        data: {
          maintenanceMode,
          maintenanceNotice,
          store: storeProfile,
          logistics,
          compliance,
          paymentMethods,
        },
      });

      if (res.success) {
        triggerToast("Storefront & Platform configuration saved successfully", "success");
      } else {
        triggerToast(res.error || "Failed to save platform configuration", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Error saving platform settings", "error");
    } finally {
      setIsSavingPlatform(false);
    }
  };

  // ── Integrations Handlers ─────────────────────────────────────────────────
  const handleSaveIntegrations = async () => {
    setIsSavingIntegrations(true);
    try {
      const res = await updateGlobalSettings({
        data: {
          stripe: stripeConfig,
          smtp: smtpConfig,
          analytics: analyticsConfig,
          notifications: notificationsConfig,
        },
      });

      if (res.success) {
        triggerToast("API Keys & Gateways updated successfully!", "success");
      } else {
        triggerToast(res.error || "Failed to update integrations", "error");
      }
    } catch (err: any) {
      triggerToast("Error saving integrations", "error");
    } finally {
      setIsSavingIntegrations(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes("@")) {
      return triggerToast("Please enter a valid recipient email", "error");
    }

    setIsSendingTestEmail(true);
    try {
      const res = await sendTestEmail({ data: { recipientEmail: testEmailRecipient.trim() } });
      if (res.success) {
        triggerToast(
          `Test email dispatched successfully to ${testEmailRecipient}! (MessageId: ${res.messageId})`,
          "success",
        );
      } else {
        triggerToast(res.error || "Failed to dispatch test email", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Email dispatch failed", "error");
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // ── Database Telemetry Handlers ───────────────────────────────────────────
  const handlePingMongo = async () => {
    setIsPingingDb(true);
    try {
      const res = await testMongoPing();
      if (res.success) {
        setLastPingResult({
          latencyMs: res.latencyMs,
          status: res.status,
          collectionsCount: res.collectionsCount,
          timestamp: new Date().toLocaleTimeString(),
        });
        triggerToast(`MongoDB Atlas Ping: ${res.latencyMs}ms (${res.status})`, "success");
      } else {
        triggerToast(res.error || "Ping failed", "error");
      }
    } catch (err: any) {
      triggerToast("Database ping error", "error");
    } finally {
      setIsPingingDb(false);
    }
  };

  const handleRunMigration = async () => {
    setIsMigrating(true);
    setIsMigrationModalOpen(false);
    try {
      const res = await migrateData({ data: { products, orders: [], reviews: [] } });
      if (res.success && res.stats) {
        triggerToast(
          `Catalog Seed Successful: ${res.stats.products} products synchronized`,
          "success",
        );
        invalidateProductsCache(queryClient);
        setDbStats(res.stats);
      } else {
        triggerToast(res.error || "Database sync failed", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Migration process encountered an error", "error");
    } finally {
      setIsMigrating(false);
    }
  };

  const handleInspectDuplicates = async () => {
    setIsInspectingDuplicates(true);
    try {
      const res = await inspectProductsCollection();
      if (res && res.success) {
        setDuplicateAuditInfo({
          total: res.total || 0,
          excessDuplicates: res.excessDuplicates || 0,
          cleanTotal: res.cleanTotal || 0,
          uniqueDuplicateSkusCount: res.uniqueDuplicateSkusCount || 0,
          sampleDuplicates: res.sampleDuplicates || [],
        });
        setIsDeduplicateModalOpen(true);
      } else {
        triggerToast(res?.error || "Inspection failed", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Failed to inspect products collection", "error");
    } finally {
      setIsInspectingDuplicates(false);
    }
  };

  const handleRunDeduplication = async () => {
    setIsDeduplicating(true);
    try {
      const res = await deduplicateProductsDb();
      if (res && res.success) {
        triggerToast(
          `Catalog Deduplication Complete: Removed ${res.removedCount} duplicate documents. Current inventory: ${res.remainingTotal} products.`,
          "success",
        );
        setIsDeduplicateModalOpen(false);
        invalidateProductsCache(queryClient);
        const statsRes = await getDatabaseStats();
        if (statsRes.success && statsRes.stats) {
          setDbStats(statsRes.stats);
        }
      } else {
        triggerToast(res?.error || "Deduplication failed", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Deduplication encountered an error", "error");
    } finally {
      setIsDeduplicating(false);
    }
  };

  const handleExportSnapshot = async () => {
    setIsExporting(true);
    try {
      const res = (await exportCollectionSnapshot({
        data: { collectionName: exportCollection },
      })) as any;
      if (res && res.success && res.data) {
        const jsonStr = JSON.stringify(res.data, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `backup_${exportCollection}_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        triggerToast(`Exported ${res.count} documents from '${exportCollection}'!`, "success");
      } else {
        triggerToast(res.error || "Snapshot export failed", "error");
      }
    } catch (err: any) {
      triggerToast("Failed to download collection snapshot", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: any; count?: number | string; badge?: string }[] =
    [
      { id: "users", label: "Staff & Roles", icon: Users, count: users.length },
      { id: "security", label: "Security & Master Auth", icon: Lock, badge: "Bcrypt Salt 10" },
      {
        id: "platform",
        label: "Storefront & Platform",
        icon: Sliders,
        badge: maintenanceMode ? "Maintenance" : "Live",
      },
      {
        id: "database",
        label: "Database Telemetry",
        icon: Database,
        count: dbStats?.products ?? "Atlas",
      },
      { id: "integrations", label: "API & Integrations", icon: Key, badge: "Stripe & SMTP" },
    ];

  return (
    <div className="space-y-7 max-w-[1400px] mx-auto w-full pb-20">
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
      <div className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-5 sm:p-7 sm:p-9 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Radio className="size-3 text-cyan-400 animate-pulse" />
                Live Control Center
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="size-3 text-emerald-400" />
                MongoDB Atlas Connected
              </span>
              {maintenanceMode ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <AlertTriangle className="size-3 text-amber-400" />
                  Maintenance Mode Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  <Globe className="size-3 text-sky-400" />
                  Public Storefront Live
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>System & Operations Center</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
              Full-spectrum management suite for staff access control, cryptographic authentication,
              dynamic checkout rules, real-time database telemetry, and payment gateways.
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 self-start md:self-auto shrink-0 flex-wrap">
            <button
              onClick={() => loadAllData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 hover:border-slate-600 transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`size-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : "text-slate-400"}`}
              />
              <span>{isRefreshing ? "Synchronizing..." : "Refresh Live Feed"}</span>
            </button>

            <button
              onClick={handlePingMongo}
              disabled={isPingingDb}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
              title="Ping MongoDB cluster for roundtrip latency"
            >
              <Activity className={`size-3.5 ${isPingingDb ? "animate-spin" : "text-cyan-400"}`} />
              <span>
                {isPingingDb
                  ? "Pinging..."
                  : lastPingResult
                    ? `${lastPingResult.latencyMs}ms`
                    : "Test DB Ping"}
              </span>
            </button>
          </div>
        </div>

        {/* ── Top HUD Metrics ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-7 pt-5 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Super Admin</span>
              <Shield className="size-3.5 text-cyan-400" />
            </div>
            <div className="mt-1 text-base sm:text-lg font-black text-white truncate">
              {currentUsername} (Master)
            </div>
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-0.5 truncate">
              <CheckCircle className="size-2.5" /> Bcrypt Salt 10 Active
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Staff Accounts</span>
              <Users className="size-3.5 text-blue-400" />
            </div>
            <div className="mt-1 text-base sm:text-lg font-black text-white">
              {users.length} Team Members
            </div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5 truncate">
              {users.filter((u) => u.role === "admin").length} Admins ·{" "}
              {users.filter((u) => u.status === "active").length} Active
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Storefront</span>
              <Globe className="size-3.5 text-emerald-400" />
            </div>
            <div className="mt-1 text-base sm:text-lg font-black text-white truncate">
              {maintenanceMode ? "Maintenance" : "Live Storefront"}
            </div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5 truncate">
              {paymentMethods.filter((p) => p.active).length} Gateways Active
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Database Docs</span>
              <Database className="size-3.5 text-purple-400" />
            </div>
            <div className="mt-1 text-base sm:text-lg font-black text-white">
              {dbStats
                ? (dbStats.products || 0) + (dbStats.orders || 0) + (dbStats.customers || 0)
                : "Loading..."}{" "}
              Docs
            </div>
            <div className="text-xs text-cyan-400 font-semibold mt-0.5 truncate">
              10 Managed Collections
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80 font-black"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Icon className={`size-4 ${isActive ? "text-cyan-600" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-xs font-black uppercase ${
                    isActive
                      ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
              {tab.count !== undefined && !tab.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                    isActive ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Main Content Tabs Container ────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {isLoading && !isRefreshing ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="size-8 animate-spin text-cyan-500" />
            <p className="text-xs font-bold uppercase tracking-wider">
              Connecting to MongoDB & Loading Settings...
            </p>
          </div>
        ) : null}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: STAFF & ACCESS ROLES */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "users" && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Users className="size-5 text-cyan-600" />
                  <span>Staff & Access Roles</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage administrative permissions, team member credentials, and active portal
                  accounts.
                </p>
              </div>

              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer active:scale-98"
              >
                <Plus className="size-4" />
                <span>Add Staff Member</span>
              </button>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by username, full name, or email..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
                  <span className="px-2 text-xs uppercase font-black text-slate-400">
                    Role:
                  </span>
                  {(["all", "admin", "manager", "viewer"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setUserRoleFilter(r)}
                      className={`px-2.5 py-1 rounded-lg capitalize transition cursor-pointer ${
                        userRoleFilter === r
                          ? "bg-white text-slate-900 shadow-xs font-black"
                          : "hover:text-slate-900"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
                  <span className="px-2 text-xs uppercase font-black text-slate-400">
                    Status:
                  </span>
                  {(["all", "active", "inactive"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setUserStatusFilter(s)}
                      className={`px-2.5 py-1 rounded-lg capitalize transition cursor-pointer ${
                        userStatusFilter === s
                          ? "bg-white text-slate-900 shadow-xs font-black"
                          : "hover:text-slate-900"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-4 py-3.5">Staff Member</th>
                      <th className="px-4 py-3.5">Assigned Role</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Last Login</th>
                      <th className="px-4 py-3.5">Created</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          <Users className="size-8 mx-auto mb-2 opacity-40" />
                          <p className="font-bold">No staff accounts match the filter criteria</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Try resetting search or filters
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isPrimaryAdmin = u.username === "pools" || u.role === "superadmin";
                        return (
                          <tr key={u.id || u.username} className="hover:bg-slate-50/70 transition">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`size-9 rounded-xl flex items-center justify-center font-black text-xs uppercase ${
                                    u.role === "admin"
                                      ? "bg-purple-100 text-purple-700"
                                      : u.role === "manager"
                                        ? "bg-cyan-100 text-cyan-700"
                                        : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {(u.fullName || u.username).slice(0, 2)}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 flex items-center gap-2">
                                    <span>{u.fullName || u.username}</span>
                                    {isPrimaryAdmin && (
                                      <span className="px-1.5 py-0.5 rounded text-xs font-black uppercase bg-amber-100 text-amber-800">
                                        Primary
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                                    <span>@{u.username}</span>
                                    {u.email && <span>· {u.email}</span>}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                  u.role === "admin"
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : u.role === "manager"
                                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                                      : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}
                              >
                                <Shield className="size-3" />
                                {u.role}
                              </span>
                            </td>

                            <td className="px-4 py-3.5">
                              <button
                                onClick={() => !isPrimaryAdmin && handleToggleUserStatus(u)}
                                disabled={isPrimaryAdmin}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase transition ${
                                  u.status === "active"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                                } ${!isPrimaryAdmin ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                                title={
                                  !isPrimaryAdmin
                                    ? "Click to toggle active/inactive"
                                    : "Primary account is always active"
                                }
                              >
                                <span
                                  className={`size-1.5 rounded-full ${u.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`}
                                />
                                {u.status || "active"}
                              </button>
                            </td>

                            <td className="px-4 py-3.5 text-slate-500 text-xs">
                              {u.lastLoginAt
                                ? new Date(u.lastLoginAt).toLocaleString()
                                : "Never logged in"}
                            </td>

                            <td className="px-4 py-3.5 text-slate-500 text-xs">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "System"}
                            </td>

                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditUser(u)}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                                  title="Edit Staff Member"
                                >
                                  <Edit3 className="size-4" />
                                </button>

                                {!isPrimaryAdmin && (
                                  <button
                                    onClick={() => setUserToDelete(u)}
                                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                    title="Revoke & Delete"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: SECURITY & MASTER AUTH */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "security" && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="pb-5 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Lock className="size-5 text-cyan-600" />
                <span>Security & Master Authentication</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Cryptographic authentication safeguards, brute-force lockout thresholds, and master
                executive credentials.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
              {/* Left Column: Master Credential Update */}
              <div className="lg:col-span-7 space-y-6">
                <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-6">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="size-4.5 text-cyan-600" />
                      <span>Update Master Administrator Credentials</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verify your current master password to rotate administrative credentials.
                    </p>
                  </div>

                  <form onSubmit={handleUpdateSecurity} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                          Current Username
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={currentUsername}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono text-xs font-bold text-slate-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                          New Username (Optional)
                        </label>
                        <input
                          type="text"
                          value={newMasterUsername}
                          onChange={(e) => setNewMasterUsername(e.target.value)}
                          placeholder="Keep current or enter new"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center justify-between">
                        <span>Current Master Password *</span>
                        <span className="text-xs text-slate-400 font-normal">
                          Required for verification
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPwd ? "text" : "password"}
                          required
                          value={secCurrentPassword}
                          onChange={(e) => setSecCurrentPassword(e.target.value)}
                          placeholder="Enter current password..."
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showCurrentPwd ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                          New Master Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPwd ? "text" : "password"}
                            value={secNewPassword}
                            onChange={(e) => setSecNewPassword(e.target.value)}
                            placeholder="Min 6 characters..."
                            className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPwd(!showNewPwd)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showNewPwd ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPwd ? "text" : "password"}
                            value={secConfirmPassword}
                            onChange={(e) => setSecConfirmPassword(e.target.value)}
                            placeholder="Repeat new password..."
                            className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showConfirmPwd ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Password Strength Meter */}
                    {secNewPassword && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-500">Password Strength:</span>
                          <span className={passwordStrength.textColor}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isUpdatingSecurity}
                        className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-2 active:scale-98"
                      >
                        {isUpdatingSecurity ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            <span>Updating Credentials...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="size-3.5" />
                            <span>Save Credentials</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Session & Lockout Security Policy Card */}
                <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Clock className="size-4 text-cyan-600" />
                        <span>Security & Lockout Governance</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Control brute-force rate limits and idle session lifetimes.
                      </p>
                    </div>

                    <button
                      onClick={handleSaveSecurityPolicy}
                      disabled={isSavingSecurityPolicy}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isSavingSecurityPolicy ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Check className="size-3" />
                      )}
                      <span>Save Policy</span>
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-500">
                        Session Inactivity (Min)
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={480}
                        value={securityPolicy.sessionTimeoutMinutes}
                        onChange={(e) =>
                          setSecurityPolicy({
                            ...securityPolicy,
                            sessionTimeoutMinutes: Number(e.target.value) || 60,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold font-mono text-slate-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-500">
                        Max Failed Logins
                      </label>
                      <input
                        type="number"
                        min={3}
                        max={20}
                        value={securityPolicy.maxFailedAttempts}
                        onChange={(e) =>
                          setSecurityPolicy({
                            ...securityPolicy,
                            maxFailedAttempts: Number(e.target.value) || 5,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold font-mono text-slate-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-500">
                        Lockout Duration (Min)
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={1440}
                        value={securityPolicy.lockoutDurationMinutes}
                        onChange={(e) =>
                          setSecurityPolicy({
                            ...securityPolicy,
                            lockoutDurationMinutes: Number(e.target.value) || 15,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold font-mono text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Security Telemetry & Active Lockouts */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="size-4.5 text-cyan-400" />
                      <h4 className="font-black text-sm uppercase tracking-wider text-white">
                        Active Lockouts & IP Guards
                      </h4>
                    </div>

                    <button
                      onClick={refreshAuditLogs}
                      disabled={isLoadingAuditLogs}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                      title="Refresh Audit Logs"
                    >
                      <RefreshCw
                        className={`size-3.5 ${isLoadingAuditLogs ? "animate-spin text-cyan-400" : ""}`}
                      />
                    </button>
                  </div>

                  {securityLocks.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      <ShieldCheck className="size-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                      <p className="font-bold text-white">No Active Security Lockouts</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        All administrative IP gates and user accounts are clear.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {securityLocks.map((lock) => (
                        <div
                          key={lock.id || lock.key}
                          className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-mono font-bold text-white flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-rose-400 animate-pulse" />
                              <span>{lock.key}</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {lock.failedAttempts} Failed Attempts · Locked until{" "}
                              {lock.lockedUntil
                                ? new Date(lock.lockedUntil).toLocaleTimeString()
                                : "Indefinite"}
                            </div>
                          </div>

                          <button
                            onClick={() => handleClearLockout(lock.key)}
                            disabled={clearingLockKey === lock.key}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase transition cursor-pointer shrink-0"
                          >
                            {clearingLockKey === lock.key ? "Clearing..." : "Release"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Authentication Events */}
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Activity className="size-4 text-cyan-600" />
                    <span>Recent Staff Logins</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    {securityLogins.slice(0, 4).map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/60"
                      >
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-emerald-500" />
                          <span className="font-bold text-slate-900">{staff.username}</span>
                          <span className="text-xs text-slate-400">({staff.role})</span>
                        </div>
                        <span className="text-xs font-mono text-slate-500">
                          {staff.lastLoginAt
                            ? new Date(staff.lastLoginAt).toLocaleTimeString()
                            : "Never"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: STOREFRONT & PLATFORM CONFIG */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "platform" && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Sliders className="size-5 text-cyan-600" />
                  <span>Storefront & Platform Configuration</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage live checkout rules, maintenance downtime messages, store identity, freight
                  logistics, and payment methods.
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
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="size-4 text-emerald-400" />
                    <span>Save Platform Settings</span>
                  </>
                )}
              </button>
            </div>

            {/* Maintenance Mode Card & Banner Customizer */}
            <div
              className={`p-6 rounded-3xl border transition-all space-y-4 ${
                maintenanceMode
                  ? "bg-amber-50/90 border-amber-300"
                  : "bg-slate-50/80 border-slate-200/80"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-3 rounded-full ${maintenanceMode ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}
                    />
                    <h3 className="font-extrabold text-sm text-slate-900">
                      Storefront Maintenance Mode
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 max-w-xl">
                    When enabled, public storefront visitors will see a graceful system upgrade
                    screen. The admin panel remains 100% accessible.
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

              {/* Maintenance Notice Input & Live Preview */}
              <div className="pt-2 border-t border-slate-200/60 grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-700 flex items-center justify-between">
                    <span>Custom Maintenance Notice</span>
                    <span className="text-xs text-slate-400 font-normal">
                      Displayed on public screen
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={maintenanceNotice}
                    onChange={(e) => setMaintenanceNotice(e.target.value)}
                    placeholder="e.g. We are performing scheduled upgrades. Orders will resume in 30 minutes."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-500">
                    Visitor Screen Preview
                  </label>
                  <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs space-y-1.5 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase">
                      <span className="size-1.5 rounded-full bg-amber-400 animate-ping" />
                      Under Maintenance
                    </div>
                    <div className="font-bold text-white text-sm">System Upgrade</div>
                    <p className="text-slate-300 text-xs line-clamp-2">
                      {maintenanceNotice ||
                        "We are currently performing scheduled maintenance to serve you better. We'll be back online shortly with exciting new updates."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Profile & Identity */}
            <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="size-4 text-cyan-600" />
                  <span>Wholesale Storefront Profile</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Physical warehouse details, corporate contact channels, and currency standard.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-500">
                    Store Brand Name
                  </label>
                  <input
                    type="text"
                    value={storeProfile.name}
                    onChange={(e) => setStoreProfile({ ...storeProfile, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-500">
                    Support Phone
                  </label>
                  <input
                    type="text"
                    value={storeProfile.phone}
                    onChange={(e) => setStoreProfile({ ...storeProfile, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-500">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={storeProfile.supportEmail}
                    onChange={(e) =>
                      setStoreProfile({ ...storeProfile, supportEmail: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-black uppercase text-slate-500">
                    Physical Warehouse / Fulfillment Address
                  </label>
                  <input
                    type="text"
                    value={storeProfile.address}
                    onChange={(e) => setStoreProfile({ ...storeProfile, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-500">
                    Support Operating Hours
                  </label>
                  <input
                    type="text"
                    value={storeProfile.supportHours}
                    onChange={(e) =>
                      setStoreProfile({ ...storeProfile, supportHours: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Logistics & Shipping Rules */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ShoppingBag className="size-4 text-cyan-600" />
                    <span>Freight & Logistics Policy</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Automated calculations applied at checkout.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-500">
                      Free Freight Threshold ($)
                    </label>
                    <input
                      type="number"
                      value={logistics.freeShippingThreshold}
                      onChange={(e) =>
                        setLogistics({
                          ...logistics,
                          freeShippingThreshold: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold font-mono text-slate-900"
                    />
                    <span className="text-xs text-slate-400">
                      Orders above this amount receive free freight.
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-500">
                      Standard Freight Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={logistics.standardFreightRatePercent}
                      onChange={(e) =>
                        setLogistics({
                          ...logistics,
                          standardFreightRatePercent: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold font-mono text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-500">
                      Estimated Delivery Timeline
                    </label>
                    <input
                      type="text"
                      value={logistics.estimatedDeliveryDays}
                      onChange={(e) =>
                        setLogistics({ ...logistics, estimatedDeliveryDays: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Tax & Compliance */}
              <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="size-4 text-cyan-600" />
                    <span>Tax & Resale Compliance</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Commercial tax calculation and contractor exemptions.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-500">
                      Standard Sales Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={compliance.taxRatePercent}
                      onChange={(e) =>
                        setCompliance({
                          ...compliance,
                          taxRatePercent: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold font-mono text-slate-900"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                    <div>
                      <div className="font-bold text-xs text-slate-800">
                        Resale Certificate Exemption
                      </div>
                      <div className="text-xs text-slate-400">
                        Permit tax waiver for contractors with valid EIN
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={compliance.taxExemptionEnabled}
                        onChange={(e) =>
                          setCompliance({ ...compliance, taxExemptionEnabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                    <div>
                      <div className="font-bold text-xs text-slate-800">
                        Require Business Tax ID
                      </div>
                      <div className="text-xs text-slate-400">
                        Mandate company EIN during guest order submission
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={compliance.requireBusinessTaxId}
                        onChange={(e) =>
                          setCompliance({ ...compliance, requireBusinessTaxId: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Gateways Config */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="size-4 text-cyan-600" />
                  <span>Wholesale Payment Gateways</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Toggle active payment methods available to contractors and wholesale buyers.
                </p>
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
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-black uppercase ${
                            pm.active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {pm.active ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-mono">{pm.mode}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">Checkout Option</span>
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
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: DATABASE TELEMETRY & BACKUPS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "database" && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Database className="size-5 text-cyan-600" />
                  <span>MongoDB Atlas Telemetry & Backups</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  10 real-time collection metrics, roundtrip ping diagnostic test, catalog seeder,
                  and JSON backup snapshot exporter.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={handlePingMongo}
                  disabled={isPingingDb}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                >
                  <Activity
                    className={`size-3.5 ${isPingingDb ? "animate-spin" : "text-cyan-400"}`}
                  />
                  <span>{isPingingDb ? "Testing Latency..." : "Test Connection Latency"}</span>
                </button>

                <button
                  onClick={handleInspectDuplicates}
                  disabled={isInspectingDuplicates || isDeduplicating}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                >
                  <Sparkles
                    className={`size-3.5 ${isInspectingDuplicates ? "animate-spin" : "text-amber-500"}`}
                  />
                  <span>
                    {isInspectingDuplicates ? "Auditing Catalog..." : "Clean Duplicate Products"}
                  </span>
                </button>

                <button
                  onClick={() => setIsMigrationModalOpen(true)}
                  disabled={isMigrating}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-40"
                >
                  <RefreshCw className={`size-4 ${isMigrating ? "animate-spin" : ""}`} />
                  <span>Seed Wholesale Catalog</span>
                </button>
              </div>
            </div>

            {/* Live Ping Telemetry Banner */}
            {lastPingResult && (
              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-cyan-500/20 grid place-items-center text-cyan-400">
                    <Wifi className="size-4" />
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      <span>Cluster Response Time:</span>
                      <span className="font-mono text-cyan-300 text-sm font-black">
                        {lastPingResult.latencyMs}ms
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-black uppercase bg-emerald-500/20 text-emerald-300">
                        {lastPingResult.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {lastPingResult.collectionsCount} collections accessible · Checked at{" "}
                      {lastPingResult.timestamp}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
                  <span>mongodb+srv://atlas-cluster</span>
                </div>
              </div>
            )}

            {/* 10 Collection Counters Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="size-4 text-cyan-600" />
                <span>Live Document Counters Across 10 Core Collections</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                {[
                  {
                    name: "Products",
                    key: "products",
                    icon: ShoppingBag,
                    col: "db.products",
                    color: "text-cyan-600 bg-cyan-50",
                  },
                  {
                    name: "Orders",
                    key: "orders",
                    icon: FileText,
                    col: "db.orders",
                    color: "text-blue-600 bg-blue-50",
                  },
                  {
                    name: "Customers",
                    key: "customers",
                    icon: Users,
                    col: "db.customers",
                    color: "text-indigo-600 bg-indigo-50",
                  },
                  {
                    name: "Reviews",
                    key: "reviews",
                    icon: MessageSquare,
                    col: "db.reviews",
                    color: "text-amber-600 bg-amber-50",
                  },
                  {
                    name: "Staff Users",
                    key: "users",
                    icon: Shield,
                    col: "db.users",
                    color: "text-purple-600 bg-purple-50",
                  },
                  {
                    name: "Categories",
                    key: "categories",
                    icon: Layers,
                    col: "db.categories",
                    color: "text-emerald-600 bg-emerald-50",
                  },
                  {
                    name: "Cart Items",
                    key: "cart_items",
                    icon: ShoppingBag,
                    col: "db.cart_items",
                    color: "text-sky-600 bg-sky-50",
                  },
                  {
                    name: "Inquiries",
                    key: "inquiries",
                    icon: Mail,
                    col: "db.inquiries",
                    color: "text-rose-600 bg-rose-50",
                  },
                  {
                    name: "Security Locks",
                    key: "admin_security_locks",
                    icon: Lock,
                    col: "db.admin_security_locks",
                    color: "text-orange-600 bg-orange-50",
                  },
                  {
                    name: "Settings",
                    key: "settings",
                    icon: Sliders,
                    col: "db.settings",
                    color: "text-teal-600 bg-teal-50",
                  },
                ].map((c) => {
                  const Icon = c.icon;
                  const count = dbStats ? (dbStats[c.key] ?? 0) : "...";
                  return (
                    <div
                      key={c.key}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition"
                    >
                      <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                        <span>{c.name}</span>
                        <div className={`p-1.5 rounded-lg ${c.color}`}>
                          <Icon className="size-3.5" />
                        </div>
                      </div>
                      <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
                        {count}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-1 truncate">
                        {c.col}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Disaster Recovery & Snapshot Exporter */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Download className="size-4 text-cyan-600" />
                    <span>Disaster Recovery & Collection Snapshot Exporter</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Download sanitized JSON backups of your product catalog, orders, customers, or
                    inquiries for offline archiving.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={exportCollection}
                    onChange={(e) => setExportCollection(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="products">Products Collection</option>
                    <option value="orders">Orders Collection</option>
                    <option value="customers">Customers Collection</option>
                    <option value="reviews">Reviews Collection</option>
                    <option value="inquiries">Contact Inquiries</option>
                    <option value="settings">Global Settings</option>
                  </select>

                  <button
                    onClick={handleExportSnapshot}
                    disabled={isExporting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    {isExporting ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Download className="size-3.5" />
                    )}
                    <span>{isExporting ? "Exporting..." : "Download JSON"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Cache Invalidation Card */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-slate-900">Query Cache Invalidation</h4>
                <p className="text-xs text-slate-500">
                  Purge client-side memory cache across all product catalogs and detail routes.
                </p>
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
        {/* TAB 5: API KEYS & INTEGRATIONS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "integrations" && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Key className="size-5 text-cyan-600" />
                  <span>API Keys & Service Integrations</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Configure live Stripe gateways, transactional SMTP dispatch with interactive
                  tester, GA4 telemetry, and alert webhooks.
                </p>
              </div>

              <button
                onClick={handleSaveIntegrations}
                disabled={isSavingIntegrations}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 active:scale-98"
              >
                {isSavingIntegrations ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="size-4 text-emerald-400" />
                    <span>Save All Keys</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Stripe API Credentials */}
              <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm text-slate-900">
                    <CreditCard className="size-4 text-cyan-600" />
                    <span>Stripe Payment Processing Keys</span>
                  </div>

                  <div className="flex items-center gap-1 p-1 bg-slate-200 rounded-lg text-xs font-black uppercase">
                    <button
                      type="button"
                      onClick={() => setStripeConfig({ ...stripeConfig, mode: "test" })}
                      className={`px-2 py-0.5 rounded transition cursor-pointer ${
                        stripeConfig.mode === "test"
                          ? "bg-amber-500 text-white font-black"
                          : "text-slate-600"
                      }`}
                    >
                      Test Sandbox
                    </button>
                    <button
                      type="button"
                      onClick={() => setStripeConfig({ ...stripeConfig, mode: "live" })}
                      className={`px-2 py-0.5 rounded transition cursor-pointer ${
                        stripeConfig.mode === "live"
                          ? "bg-emerald-600 text-white font-black"
                          : "text-slate-600"
                      }`}
                    >
                      Live Production
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Publishable API Key
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={stripeConfig.publishableKey}
                      onChange={(e) =>
                        setStripeConfig({ ...stripeConfig, publishableKey: e.target.value })
                      }
                      placeholder="pk_live_..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(stripeConfig.publishableKey, "Stripe Public Key")
                      }
                      className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition cursor-pointer"
                      title="Copy key"
                    >
                      {copiedKey === "Stripe Public Key" ? (
                        <Check className="size-4 text-emerald-600" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Secret API Key
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type={showStripeSecret ? "text" : "password"}
                      value={stripeConfig.secretKey}
                      onChange={(e) =>
                        setStripeConfig({ ...stripeConfig, secretKey: e.target.value })
                      }
                      placeholder="sk_live_..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStripeSecret(!showStripeSecret)}
                      className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition cursor-pointer"
                      title={showStripeSecret ? "Hide key" : "Show key"}
                    >
                      {showStripeSecret ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Webhook Secret Key
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type={showStripeWebhookSecret ? "text" : "password"}
                      value={stripeConfig.webhookSecret}
                      onChange={(e) =>
                        setStripeConfig({ ...stripeConfig, webhookSecret: e.target.value })
                      }
                      placeholder="whsec_..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStripeWebhookSecret(!showStripeWebhookSecret)}
                      className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition cursor-pointer"
                      title={showStripeWebhookSecret ? "Hide" : "Show"}
                    >
                      {showStripeWebhookSecret ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Endpoint URL (Copy for Stripe Dashboard)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value="https://poolsupplywholesalers.com/api/stripe/webhook"
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 font-mono text-xs text-slate-700 select-all"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          "https://poolsupplywholesalers.com/api/stripe/webhook",
                          "Webhook URL",
                        )
                      }
                      className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition cursor-pointer"
                      title="Copy webhook URL"
                    >
                      {copiedKey === "Webhook URL" ? (
                        <Check className="size-4 text-emerald-600" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Transactional Email Service & Live Dispatch Tester */}
              <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm text-slate-900">
                    <Zap className="size-4 text-amber-500" />
                    <span>Transactional Email (SMTP / Nodemailer)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-xs font-black uppercase bg-emerald-100 text-emerald-800">
                    SSL 465 Active
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-500">
                      SMTP Host Server
                    </label>
                    <input
                      type="text"
                      value={smtpConfig.host}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-500">
                      Port & Security
                    </label>
                    <input
                      type="number"
                      value={smtpConfig.port}
                      onChange={(e) =>
                        setSmtpConfig({ ...smtpConfig, port: Number(e.target.value) || 465 })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-500">
                      Authenticated User
                    </label>
                    <input
                      type="text"
                      value={smtpConfig.user}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-500">
                      Sender Display Name
                    </label>
                    <input
                      type="text"
                      value={smtpConfig.fromName}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-black uppercase text-slate-500">
                      Admin Notification Alert Recipients
                    </label>
                    <input
                      type="text"
                      value={smtpConfig.adminAlertEmail}
                      onChange={(e) =>
                        setSmtpConfig({ ...smtpConfig, adminAlertEmail: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800"
                    />
                    <span className="text-xs text-slate-400">
                      Comma-separated emails that receive real-time order alerts.
                    </span>
                  </div>
                </div>

                {/* Live Test Email Tool */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 pt-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                    <Send className="size-3.5 text-cyan-600" />
                    <span>Send Verified Test Email</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={testEmailRecipient}
                      onChange={(e) => setTestEmailRecipient(e.target.value)}
                      placeholder="Enter recipient email..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleSendTestEmail}
                      disabled={isSendingTestEmail}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                    >
                      {isSendingTestEmail ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Send className="size-3.5" />
                      )}
                      <span>{isSendingTestEmail ? "Sending..." : "Test Dispatch"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Analytics & Tracking */}
              <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="size-4 text-cyan-600" />
                    <span>Analytics & Telemetry Identifiers</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Commercial audience insight tracking IDs.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-500">
                      Google Analytics 4 Measurement ID
                    </label>
                    <input
                      type="text"
                      value={analyticsConfig.ga4Id}
                      onChange={(e) =>
                        setAnalyticsConfig({ ...analyticsConfig, ga4Id: e.target.value })
                      }
                      placeholder="G-XXXXXXXXXX"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-500">
                      Google Tag Manager Container ID
                    </label>
                    <input
                      type="text"
                      value={analyticsConfig.gtmId}
                      onChange={(e) =>
                        setAnalyticsConfig({ ...analyticsConfig, gtmId: e.target.value })
                      }
                      placeholder="GTM-XXXXXXX"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-500">
                      Meta / Facebook Pixel ID
                    </label>
                    <input
                      type="text"
                      value={analyticsConfig.metaPixelId}
                      onChange={(e) =>
                        setAnalyticsConfig({ ...analyticsConfig, metaPixelId: e.target.value })
                      }
                      placeholder="e.g. 982341908234"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Webhook Alerts for Slack & Discord */}
              <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Radio className="size-4 text-cyan-600" />
                    <span>Real-time Alert Webhooks</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Stream new purchase notifications to external team chatrooms.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-500">
                      Slack Incoming Webhook URL
                    </label>
                    <input
                      type="text"
                      value={notificationsConfig.slackWebhookUrl}
                      onChange={(e) =>
                        setNotificationsConfig({
                          ...notificationsConfig,
                          slackWebhookUrl: e.target.value,
                        })
                      }
                      placeholder="https://hooks.slack.com/services/..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-500">
                      Discord Channel Webhook URL
                    </label>
                    <input
                      type="text"
                      value={notificationsConfig.discordWebhookUrl}
                      onChange={(e) =>
                        setNotificationsConfig({
                          ...notificationsConfig,
                          discordWebhookUrl: e.target.value,
                        })
                      }
                      placeholder="https://discord.com/api/webhooks/..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-800"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                    <div>
                      <div className="font-bold text-xs text-slate-800">
                        Dispatch Instant Order Webhooks
                      </div>
                      <div className="text-xs text-slate-400">
                        Trigger on each successful checkout completion
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationsConfig.orderAlerts}
                        onChange={(e) =>
                          setNotificationsConfig({
                            ...notificationsConfig,
                            orderAlerts: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
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
                    <p className="text-xs text-slate-400">
                      Authorize a new team member with specific role rights.
                    </p>
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
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. jiten.operations"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="e.g. Jiten S."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. jiten@poolsupplywholesalers.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                      Access Role
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="manager">Manager</option>
                      <option value="viewer">Viewer</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                      Initial Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
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

      {/* ── Edit User Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {userToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-5"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-blue-50 text-blue-600 grid place-items-center">
                    <Edit3 className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Edit Staff Account</h3>
                    <p className="text-xs text-slate-400">Updating @{userToEdit.username}</p>
                  </div>
                </div>

                <button
                  onClick={() => setUserToEdit(null)}
                  className="size-8 rounded-xl bg-slate-100 hover:bg-slate-200 grid place-items-center text-slate-500 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateUserSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                      Role
                    </label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="manager">Manager</option>
                      <option value="viewer">Viewer</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                      Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center justify-between">
                    <span>Reset Password</span>
                    <span className="text-xs text-slate-400 font-normal">
                      Leave blank to keep current
                    </span>
                  </label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Enter new password (optional)..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setUserToEdit(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingUser}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider shadow-md transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {isUpdatingUser ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="size-3.5" />
                        <span>Save Changes</span>
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
                  Are you sure you want to revoke access for{" "}
                  <strong className="text-slate-800">'{userToDelete.username}'</strong>? This action
                  is immediate.
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
                  <h3 className="text-base font-black text-slate-900">
                    Seed Default Wholesale Catalog
                  </h3>
                  <p className="text-xs text-slate-400">
                    Synchronize commercial pool catalog into MongoDB.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                This process will populate your live database with the complete commercial product
                database ({products.length} master SKU items). Existing product IDs will be safely
                updated without deleting customer order records.
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

      {/* ── Catalog Deduplication & Cleanup Modal ────────────────────── */}
      <AnimatePresence>
        {isDeduplicateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 max-w-lg w-full space-y-5"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-2xl bg-amber-50 text-amber-600 grid place-items-center shrink-0">
                    <Sparkles className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Catalog Deduplication & Cleanup
                    </h3>
                    <p className="text-xs text-slate-400">
                      Optimize MongoDB products and prune duplicate SKU records.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeduplicateModalOpen(false)}
                  className="size-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 grid place-items-center transition cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {duplicateAuditInfo && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Current in DB
                      </div>
                      <div className="text-lg font-black text-slate-800 mt-0.5">
                        {duplicateAuditInfo.total.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-center">
                      <div className="text-xs font-bold uppercase tracking-wider text-rose-500">
                        Duplicate Clones
                      </div>
                      <div className="text-lg font-black text-rose-600 mt-0.5">
                        -{duplicateAuditInfo.excessDuplicates.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                        Clean Inventory
                      </div>
                      <div className="text-lg font-black text-emerald-700 mt-0.5">
                        {duplicateAuditInfo.cleanTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 leading-relaxed space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-amber-800">
                      <AlertTriangle className="size-3.5 text-amber-600 shrink-0" />
                      <span>Why did the product count increase?</span>
                    </div>
                    <p className="text-xs text-amber-800/90">
                      When a wholesale catalog or backup sync runs, documents with differing ID
                      types can create new records alongside existing ones. Running clean
                      deduplication preserves the primary items (with verified images, review
                      ratings, and sale prices) and purges the duplicate clones.
                    </p>
                  </div>

                  {duplicateAuditInfo.sampleDuplicates &&
                    duplicateAuditInfo.sampleDuplicates.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Sample Duplicate SKUs Detected
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 rounded-xl bg-slate-50 border border-slate-100">
                          {duplicateAuditInfo.sampleDuplicates.map((s: any, idx: number) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-xs font-mono font-bold text-slate-700"
                            >
                              <span>{s.sku}</span>
                              <span className="text-rose-500 font-semibold">({s.count}x)</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDeduplicateModalOpen(false)}
                  disabled={isDeduplicating}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRunDeduplication}
                  disabled={isDeduplicating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-black uppercase tracking-wider shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {isDeduplicating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Deduplicating Database...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      <span>Execute Clean Deduplication</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
