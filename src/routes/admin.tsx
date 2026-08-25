import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MessageSquare,
  MessageCircle,
  ArrowLeft,
  Menu,
  X,
  User,
  Users,
  Mail,
  Bell,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Search,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Activity,
  Globe,
  RotateCcw,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";
import { AdminLogin } from "@/components/admin/AdminLogin";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/lib/api/notifications.functions";

function timeAgo(date: Date | string) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Control Panel — Admin Dashboard | Pool Supply Wholesalers" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Notifications & Profile State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("aquapro_admin_token");
    if (token) {
      setIsAuthenticated(true);

      // Fetch notifications
      getNotifications().then((res) => {
        if (res.success && res.notifications) {
          setNotifications(res.notifications);
        }
      });
    }
    setTimeout(() => setIsCheckingAuth(false), 50);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await markNotificationAsRead({ data: { id } });
  };

  const handleMarkAllRead = async () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    await markAllNotificationsAsRead();
  };

  const handleDeleteNotification = async (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    await deleteNotification({ data: { id } });
  };

  const handleLogout = () => {
    localStorage.removeItem("aquapro_admin_token");
    setIsAuthenticated(false);
  };

  const menuItems = [
    { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
    { label: "Products Catalog", to: "/admin/products", icon: Package },
    { label: "Customer Orders", to: "/admin/orders", icon: ShoppingBag },
    { label: "Returns & RMA", to: "/admin/returns", icon: RotateCcw },
    { label: "Quotes & Bids", to: "/admin/quotes", icon: FileText },
    { label: "Trade Customers", to: "/admin/customers", icon: User },
    { label: "Web Email Inbox", to: "/admin/emails", icon: Mail },
    { label: "Customer Reviews", to: "/admin/reviews", icon: MessageSquare },
    { label: "Live Support Chat", to: "/admin/chat", icon: MessageCircle },
    { label: "Newsletter Leads", to: "/admin/subscribers", icon: Users },
    { label: "System Settings", to: "/admin/settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/admin/";
    }
    return location.pathname.startsWith(path);
  };

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-[#061220]" />;
  }

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans selection:bg-cyan-500/20">
      {/* ─── ULTRA-LUXURY DESKTOP SIDEBAR ─── */}
      <aside className="hidden lg:flex flex-col w-[270px] bg-gradient-to-b from-[#061220] via-[#08182c] to-[#040d1a] text-white shrink-0 border-r border-cyan-500/15 shadow-2xl z-40 sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-cyan-500/10">
          <Link to="/admin" className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="Pool Supply Wholesalers"
              className="h-8 w-auto object-contain brightness-0 invert opacity-95"
            />
          </Link>
          <span className="text-[10px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-400/30">
            Console
          </span>
        </div>

        <div className="px-5 pt-4 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          Management
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3.5 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${active
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-900/30"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <Icon className={`size-4 ${active ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer & User Profile */}
        <div className="p-4 mt-auto space-y-3 border-t border-cyan-500/10">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative size-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 text-white font-black text-xs grid place-items-center shadow-md shrink-0">
                SA
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 border-2 border-[#061220]" />
              </div>
              <div className="text-left overflow-hidden">
                <div className="text-xs font-black text-white truncate flex items-center gap-1">
                  Master Admin
                  <ShieldCheck className="size-3.5 text-cyan-300 shrink-0" />
                </div>
                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Superuser</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/30 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200 border border-white/10"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return to Storefront</span>
          </Link>
        </div>
      </aside>

      {/* ─── MOBILE DRAWER ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-[270px] bg-gradient-to-b from-[#061220] via-[#08182c] to-[#040d1a] text-white flex flex-col lg:hidden border-r border-cyan-500/15 shadow-2xl"
            >
              <div className="h-20 px-6 flex items-center justify-between border-b border-cyan-500/10">
                <img src={logo} alt="Logo" className="h-7 w-auto brightness-0 invert opacity-95" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="size-8 rounded-xl bg-white/10 hover:bg-white/20 grid place-items-center text-white transition"
                >
                  <X className="size-4" />
                </button>
              </div>

              <nav className="flex-1 px-3.5 py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${active
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-cyan-500/10">
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all border border-white/10"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Back to Storefront</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col overflow-x-hidden relative">
        {/* TOP NAVBAR */}
        <header className="h-16 sm:h-20 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-3.5 sm:px-6 md:px-8 flex items-center justify-between gap-3 sm:gap-4 shrink-0 z-30 sticky top-0 shadow-2xs">
          {/* Left: Mobile Toggle & System Health */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden size-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 grid place-items-center transition cursor-pointer shrink-0"
            >
              <Menu className="size-5" />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[10px] sm:text-[11px] font-bold truncate">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="hidden xs:inline">Production DB Active · 99.98% Uptime</span>
              <span className="xs:hidden">DB Active</span>
            </div>
          </div>

          {/* Right Action Icons & Direct Store Link */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-2xs"
            >
              <span>Live Website</span>
              <ExternalLink className="size-3 text-slate-400" />
            </Link>

            {/* Notifications Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notifications"
                className="relative size-9 sm:size-10 rounded-xl bg-slate-100 hover:bg-slate-200 grid place-items-center text-slate-700 transition cursor-pointer"
              >
                <Bell className="size-4 sm:size-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-4.5 sm:size-5 rounded-full bg-rose-500 text-white font-black text-[9px] sm:text-[10px] grid place-items-center shadow-md">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer Popover */}
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="fixed sm:absolute top-16 sm:top-auto right-3 sm:right-0 mt-1 sm:mt-3 w-[calc(100vw-24px)] xs:w-80 sm:w-96 max-w-sm bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl p-4 z-50 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Bell className="size-4 text-cyan-600" />
                        <span className="font-extrabold text-sm text-slate-900">Notifications</span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-bold text-cyan-700 hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 divide-y divide-slate-50">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-xl text-xs transition flex items-start justify-between gap-2 ${n.read ? "bg-white" : "bg-cyan-50/60"
                              }`}
                          >
                            <div>
                              <div className="font-extrabold text-slate-900">{n.title}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{n.message}</div>
                              <div className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</div>
                            </div>
                            {!n.read && (
                              <button
                                onClick={() => handleMarkAsRead(n.id)}
                                className="text-[10px] font-bold text-cyan-700 hover:underline shrink-0"
                              >
                                Read
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-xs text-slate-400">No new notifications</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main Content Router View */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
