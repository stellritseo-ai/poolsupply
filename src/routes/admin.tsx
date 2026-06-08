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
  Bell,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";
import { AdminLogin } from "@/components/admin/AdminLogin";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
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
      { title: "Control Panel — Admin Dashboard" },
      { name: "robots", content: "noindex, nofollow" }
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Notifications State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("aquapro_admin_token");
    if (token) {
      setIsAuthenticated(true);

      // Fetch notifications
      getNotifications().then(res => {
        if (res.success && res.notifications) {
          setNotifications(res.notifications);
        }
      });
    }
    // Small timeout ensures no hydration mismatch flash
    setTimeout(() => setIsCheckingAuth(false), 50);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    await markNotificationAsRead({ data: { id } });
  };

  const handleMarkAllRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    await markAllNotificationsAsRead();
  };

  const handleDeleteNotification = async (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    await deleteNotification({ data: { id } });
  };

  const handleLogout = () => {
    localStorage.removeItem("aquapro_admin_token");
    setIsAuthenticated(false);
  };

  const menuItems = [
    { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
    { label: "Products", to: "/admin/products", icon: Package },
    { label: "Orders", to: "/admin/orders", icon: ShoppingBag },
    { label: "Customers", to: "/admin/customers", icon: User },
    { label: "Reviews", to: "/admin/reviews", icon: MessageSquare },
    { label: "Live Chat", to: "/admin/chat", icon: MessageCircle },
    { label: "Subscribers", to: "/admin/subscribers", icon: Users },
    { label: "System Settings", to: "/admin/settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/admin/";
    }
    return location.pathname.startsWith(path);
  };

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-[#fafafa]" />;
  }

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-slate-900 flex font-sans selection:bg-primary/20">

      {/* PREMIUM DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-gradient-ocean text-white/80 shrink-0 border-r border-white/10 shadow-2xl z-40">
        <div className="h-16 px-6 flex items-center gap-3 border-b border-white/10">
          <Link to="/" className="flex items-center group">
            {/* Using CSS filter to make the logo white for the bright sidebar */}
            <img src={logo} alt="Pool Supply Wholesalers" className="h-7 w-auto object-contain brightness-0 invert opacity-100 transition-opacity" />
          </Link>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] bg-white/20 text-white px-1.5 py-0.5 rounded-[4px]">
            Admin
          </span>
        </div>

        <div className="px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70">
          Menu
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${active
                  ? "bg-white/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Icon className={`size-4 ${active ? 'text-white' : 'text-white/70'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 border border-transparent hover:border-white/10"
          >
            <ArrowLeft className="size-4" />
            Back to Storefront
          </Link>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-[#0A0A0B]/80 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-gradient-ocean text-white/80 flex flex-col lg:hidden border-r border-white/10 shadow-2xl"
            >
              <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2">
                  <img src={logo} alt="Logo" className="h-6 w-auto brightness-0 invert opacity-100" />
                </div>
                <button onClick={() => setMobileOpen(false)} className="size-8 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-white/80 hover:text-white transition">
                  <X className="size-4" />
                </button>
              </div>

              <div className="px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70">
                Menu
              </div>

              <nav className="flex-1 px-3 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${active
                        ? "bg-white/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      <Icon className={`size-4 ${active ? 'text-white' : 'text-white/70'}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4">
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 border border-transparent hover:border-white/10"
                >
                  <ArrowLeft className="size-4" />
                  Back to Storefront
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-x-hidden relative">

        {/* PREMIUM HEADER */}
        <header className="h-16 bg-[#F7F7F8]/80 backdrop-blur-xl border-b border-black/[0.04] px-6 md:px-8 flex items-center justify-between lg:justify-end gap-4 shrink-0 z-30 sticky top-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden size-9 grid place-items-center rounded-lg bg-white border border-black/[0.08] shadow-sm text-slate-600 hover:bg-slate-50 transition active:scale-95"
          >
            <Menu className="size-4" />
          </button>

          <div className="flex items-center gap-3 md:gap-5">
            {/* Refined Notification Widget */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative size-9 grid place-items-center rounded-full transition-all duration-200 active:scale-95 ${notificationsOpen
                  ? 'bg-primary/10 text-primary'
                  : 'bg-transparent hover:bg-black/5 text-slate-500 hover:text-slate-800'
                  }`}
              >
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#E03131] shadow-[0_0_0_2px_#F7F7F8]" />
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-black/[0.08] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden z-50 flex flex-col origin-top-right"
                    >
                      <div className="p-4 border-b border-black/[0.04] flex items-center justify-between bg-white">
                        <div className="font-semibold text-slate-900 text-[13px] flex items-center gap-2">
                          Notifications
                          {unreadCount > 0 && (
                            <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-[4px]">{unreadCount}</span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-[60vh] overflow-y-auto overscroll-contain bg-[#FAFAFA]">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-[13px] text-slate-500 font-medium">
                            Inbox zero. You're all caught up!
                          </div>
                        ) : (
                          <div className="divide-y divide-black/[0.04]">
                            {notifications.map(n => (
                              <div key={n.id} className={`p-4 transition-colors relative group ${!n.read ? 'bg-white' : 'hover:bg-white'}`}>
                                {!n.read && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-primary rounded-r-full group-hover:h-8 transition-all duration-300" />}
                                {!n.read && <span className="absolute right-4 top-4 size-2 rounded-full bg-primary" />}

                                <div className="flex gap-3">
                                  <div className="flex-1 min-w-0 pr-4">
                                    <p className={`text-[13px] leading-snug mb-1 ${!n.read ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'}`}>
                                      {n.title}
                                    </p>
                                    <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                      <span className="text-[11px] font-medium text-slate-400">{timeAgo(n.createdAt)}</span>

                                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!n.read && (
                                          <button onClick={() => handleMarkAsRead(n.id)} className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors">
                                            Mark read
                                          </button>
                                        )}
                                        <button onClick={() => handleDeleteNotification(n.id)} className="text-[11px] font-semibold text-[#E03131] hover:text-rose-700 transition-colors">
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="w-[1px] h-4 bg-black/10 mx-1" />

            {/* Premium Profile Widget */}
            <div className="flex items-center gap-2.5 group cursor-pointer" onClick={handleLogout}>
              <div className="size-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-900 text-white font-semibold text-[11px] grid place-items-center shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                A
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-[13px] font-semibold text-slate-900 leading-none mb-0.5 group-hover:text-primary transition-colors">Super Admin</div>
                <div className="text-[10px] font-medium text-slate-500 leading-none">Sign out</div>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="flex-1 flex flex-col"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
