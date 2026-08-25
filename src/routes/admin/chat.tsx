import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminChatSessionsDb,
  addChatMessageDb,
  resolveChatSessionDb,
  markAdminChatReadDb,
  deleteChatSessionDb,
  type ChatSession,
  type ChatMessage,
} from "@/lib/api/chat.functions";
import {
  Search,
  Send,
  CheckCircle2,
  MessageSquare,
  Clock,
  Loader2,
  MessageCircle,
  User,
  Bell,
  Sparkles,
  Phone,
  Mail,
  Zap,
  Tag,
  ShieldCheck,
  RefreshCw,
  Check,
  AlertCircle,
  Headphones,
  CheckCircle,
  Building,
  CheckCheck,
  CornerDownRight,
  Flame,
  Droplet,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/admin/chat")({
  loader: async () => {
    try {
      const res = await getAdminChatSessionsDb();
      return (res?.sessions || []) as ChatSession[];
    } catch {
      return [];
    }
  },
  component: AdminChat,
});

function timeAgo(dateString: string | Date) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const CHAT_SMART_PRESETS = [
  {
    label: "Equipment Advisory",
    text: "Hello! Thank you for contacting Pool Supply Wholesalers. How can I assist with your commercial pool equipment specs today?",
  },
  {
    label: "Order Status",
    text: "Your order has been routed to our nearest logistics warehouse hub. Tracking details and dispatch BOL will update within the business hour.",
  },
  {
    label: "Specification Sheets",
    text: "Would you like me to send you the official manufacturer CAD drawings, spec submittal sheet, and warranty certificate?",
  },
  {
    label: "Contractor Account",
    text: "Your wholesale trade account application has been received. Your dedicated account representative will follow up with Tier-1 trade pricing.",
  },
];

function AdminChat() {
  const initialSessions = Route.useLoaderData() as ChatSession[];
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "unread" | "resolved">("all");
  const [toast, setToast] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["adminChatSessions"],
    queryFn: () => getAdminChatSessionsDb(),
    initialData: { success: true, sessions: initialSessions },
    refetchInterval: 3500,
  });

  const sessions: ChatSession[] = data?.sessions ?? initialSessions;

  const activeCount = useMemo(() => sessions.filter((s) => s.status === "active").length, [sessions]);
  const unreadCount = useMemo(() => sessions.filter((s) => (s.unreadAdmin ?? 0) > 0).length, [sessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (statusFilter === "active" && s.status !== "active") return false;
      if (statusFilter === "resolved" && s.status !== "resolved") return false;
      if (statusFilter === "unread" && (s.unreadAdmin ?? 0) === 0) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const name = (s.userName || `Customer-${s.sessionId.substring(0, 4)}`).toLowerCase();
      const email = (s.userEmail || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [sessions, statusFilter, search]);

  const selectedSession = useMemo(() => {
    if (!selectedSessionId) return filteredSessions[0] || null;
    return sessions.find((s) => s.sessionId === selectedSessionId) ?? null;
  }, [selectedSessionId, filteredSessions, sessions]);

  useEffect(() => {
    if (!selectedSessionId && filteredSessions.length > 0) {
      setSelectedSessionId(filteredSessions[0].sessionId);
    }
  }, [filteredSessions, selectedSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedSession?.messages.length]);

  const markReadMutation = useMutation({
    mutationFn: (sessionId: string) => markAdminChatReadDb({ data: { sessionId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminChatSessions"] }),
  });

  useEffect(() => {
    if (selectedSessionId && (selectedSession?.unreadAdmin ?? 0) > 0) {
      markReadMutation.mutate(selectedSessionId);
    }
  }, [selectedSessionId, selectedSession?.unreadAdmin]);

  const sendReplyMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!selectedSessionId) return;
      const message: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "admin",
        text,
        timestamp: new Date().toISOString(),
      };
      await addChatMessageDb({ data: { sessionId: selectedSessionId, message } });
    },
    onSuccess: () => {
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["adminChatSessions"] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (sessionId: string) => resolveChatSessionDb({ data: { sessionId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminChatSessions"] });
      triggerToast("Chat marked as resolved.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (sessionId: string) => deleteChatSessionDb({ data: { sessionId } }),
    onSuccess: (_, deletedSessionId) => {
      queryClient.invalidateQueries({ queryKey: ["adminChatSessions"] });
      if (selectedSessionId === deletedSessionId) {
        setSelectedSessionId(null);
      }
      triggerToast("Chat session deleted.");
    },
  });

  const handleDeleteSession = (sessionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat session?")) return;
    deleteMutation.mutate(sessionId);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || sendReplyMutation.isPending) return;
    sendReplyMutation.mutate(replyText.trim());
  };

  return (
    <div className="space-y-6 max-w-[1360px] mx-auto w-full">
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-8 z-50 bg-[#061220] text-white px-5 py-3 rounded-2xl flex items-center gap-2.5 shadow-2xl text-xs font-bold border border-cyan-500/30 backdrop-blur-md"
          >
            <CheckCircle className="size-4 text-cyan-400" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── LUXURY EXECUTIVE COMMAND HEADER ─── */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden p-5 sm:p-7 border border-cyan-500/20 bg-gradient-to-br from-[#061220] via-[#091f38] to-[#040d1a] text-white shadow-xl">
        <div
          className="absolute top-0 right-1/3 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1 sm:space-y-1.5">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[10px] font-extrabold uppercase tracking-widest">
              <Headphones className="size-3 text-cyan-400" />
              Live Trade Support Operations
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Customer Live Chat{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-white">
                Console
              </span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl font-medium leading-relaxed">
              Real-time customer advisory channels, commercial equipment sizing queries, and live technician assistance.
            </p>
          </div>

          {/* Quick Metrics HUD */}
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 sm:gap-3 w-full lg:w-auto shrink-0">
            <div className="p-2.5 sm:p-3 sm:px-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center sm:text-left">
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">Total</div>
              <div className="text-base sm:text-lg font-black text-white mt-0.5">{sessions.length}</div>
            </div>

            <div className="p-2.5 sm:p-3 sm:px-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center sm:text-left">
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-400 truncate">Live</div>
              <div className="text-base sm:text-lg font-black text-emerald-300 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                {activeCount}
                {activeCount > 0 && <span className="size-1.5 sm:size-2 rounded-full bg-emerald-400 animate-ping" />}
              </div>
            </div>

            <div className="p-2.5 sm:p-3 sm:px-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center sm:text-left">
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-cyan-400 truncate">Unread</div>
              <div className="text-base sm:text-lg font-black text-cyan-300 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                {unreadCount}
                {unreadCount > 0 && <span className="size-1.5 sm:size-2 rounded-full bg-rose-500 animate-pulse" />}
              </div>
            </div>

            <button
              onClick={() => refetch()}
              className="col-span-3 sm:col-span-1 p-2.5 sm:p-3 sm:px-4 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition flex items-center justify-center gap-1.5 sm:gap-2 text-xs font-bold cursor-pointer"
              title="Sync Live Channels"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin text-cyan-300" : ""}`} />
              <span>Sync Feed</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── DUAL-PANE CHAT CONSOLE ─── */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 5 COLS: Session Search, Filter Bar & Card Feed */}
        <div className={`lg:col-span-5 space-y-3 sm:space-y-4 ${selectedSessionId ? "hidden lg:block" : "block"}`}>
          {/* Search & Filter Toolbar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-2xs space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search contractor or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 h-10 sm:h-11 border border-slate-200 bg-slate-50/75 rounded-xl sm:rounded-2xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl sm:rounded-2xl border border-slate-100 text-[11px] sm:text-xs font-bold overflow-x-auto scrollbar-none">
              <button
                onClick={() => setStatusFilter("all")}
                className={`flex-1 py-1.5 sm:py-2 px-2 rounded-lg sm:rounded-xl transition text-center cursor-pointer whitespace-nowrap ${
                  statusFilter === "all"
                    ? "bg-white text-slate-900 shadow-2xs font-black"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                All ({sessions.length})
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`flex-1 py-1.5 sm:py-2 px-2 rounded-lg sm:rounded-xl transition text-center cursor-pointer whitespace-nowrap ${
                  statusFilter === "active"
                    ? "bg-white text-slate-900 shadow-2xs font-black"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setStatusFilter("unread")}
                className={`flex-1 py-1.5 sm:py-2 px-2 rounded-lg sm:rounded-xl transition text-center cursor-pointer whitespace-nowrap ${
                  statusFilter === "unread"
                    ? "bg-white text-slate-900 shadow-2xs font-black"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setStatusFilter("resolved")}
                className={`flex-1 py-1.5 sm:py-2 px-2 rounded-lg sm:rounded-xl transition text-center cursor-pointer whitespace-nowrap ${
                  statusFilter === "resolved"
                    ? "bg-white text-slate-900 shadow-2xs font-black"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Resolved
              </button>
            </div>
          </div>

          {/* Session Cards Feed with Direct Delete Buttons */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session) => {
                const isSelected = selectedSession?.sessionId === session.sessionId;
                const lastMessage = session.messages[session.messages.length - 1];
                return (
                  <div
                    key={session.sessionId}
                    onClick={() => setSelectedSessionId(session.sessionId)}
                    className={`p-3.5 sm:p-4 rounded-2xl transition-all cursor-pointer flex items-start justify-between gap-3 border group active:bg-slate-100 ${
                      isSelected
                        ? "bg-gradient-to-r from-cyan-50/90 to-white border-cyan-500/40 shadow-sm"
                        : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-2xs"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3 overflow-hidden min-w-0">
                      <div className="relative shrink-0">
                        <div className="size-9 sm:size-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-black text-xs grid place-items-center shadow-2xs mt-0.5">
                          {session.userName?.charAt(0).toUpperCase() || "C"}
                        </div>
                        {session.status === "active" && (
                          <span className="absolute -bottom-0.5 -right-0.5 size-2.5 sm:size-3 rounded-full bg-emerald-500 border-2 border-white" />
                        )}
                      </div>

                      <div className="space-y-0.5 sm:space-y-1 overflow-hidden min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="font-black text-xs text-slate-900 truncate">
                            {session.userName || `Customer #${session.sessionId.substring(0, 5)}`}
                          </span>
                          {(session.unreadAdmin ?? 0) > 0 && (
                            <span className="size-4 rounded-full bg-rose-500 text-white font-black text-[9px] grid place-items-center shrink-0">
                              {session.unreadAdmin}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">
                          {lastMessage?.text || "Session initialized"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 sm:gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                        {lastMessage ? timeAgo(lastMessage.timestamp) : "Now"}
                      </span>

                      {/* Delete Session Button on Item */}
                      <button
                        onClick={(e) => handleDeleteSession(session.sessionId, e)}
                        className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Chat Session"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2 p-6 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl">
                <MessageSquare className="size-8 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs font-bold text-slate-700">No chat sessions found</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  New live chat sessions started by customers will appear here in real time.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 7 COLS: Active Live Messaging Console */}
        <div className={`lg:col-span-7 ${selectedSessionId ? "block" : "hidden lg:block"}`}>
          <AnimatePresence mode="wait">
            {selectedSession ? (
              <motion.div
                key={selectedSession.sessionId}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden flex flex-col h-[580px] sm:h-[670px]"
              >
                {/* Header Profile Bar */}
                <div className="p-3.5 sm:p-4 sm:px-6 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                    {/* Mobile Back Button */}
                    <button
                      onClick={() => setSelectedSessionId(null)}
                      className="lg:hidden p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 shrink-0"
                    >
                      ←
                    </button>

                    <div className="relative shrink-0">
                      <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-black text-xs sm:text-sm grid place-items-center shadow-md">
                        {selectedSession.userName?.charAt(0).toUpperCase() || "C"}
                      </div>
                      {selectedSession.status === "active" && (
                        <span className="absolute -bottom-0.5 -right-0.5 size-2.5 sm:size-3 rounded-full bg-emerald-500 border-2 border-white animate-ping" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5 truncate">
                        <span className="truncate">{selectedSession.userName || `Customer #${selectedSession.sessionId.substring(0, 5)}`}</span>
                        {selectedSession.status === "active" ? (
                          <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                            Active
                          </span>
                        ) : (
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                            Resolved
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-medium flex items-center gap-2 sm:gap-3 mt-0.5 truncate">
                        {selectedSession.userEmail ? (
                          <a
                            href={`mailto:${selectedSession.userEmail}`}
                            className="hover:text-cyan-600 text-cyan-700 font-bold flex items-center gap-1 text-[10px] sm:text-[11px] truncate"
                          >
                            <Mail className="size-3 shrink-0" />
                            <span className="truncate">{selectedSession.userEmail}</span>
                          </a>
                        ) : (
                          <span className="text-[10px] sm:text-[11px] text-slate-400">Guest Visitor</span>
                        )}
                        {selectedSession.userPhone && (
                          <a
                            href={`tel:${selectedSession.userPhone}`}
                            className="hover:text-cyan-600 text-slate-600 flex items-center gap-1 text-[10px] sm:text-[11px] truncate hidden xs:flex"
                          >
                            <Phone className="size-3 shrink-0" />
                            <span>{selectedSession.userPhone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {selectedSession.status === "active" && (
                      <button
                        onClick={() => resolveMutation.mutate(selectedSession.sessionId)}
                        disabled={resolveMutation.isPending}
                        className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                      >
                        <CheckCheck className="size-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Mark Resolved</span>
                        <span className="sm:hidden">Done</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteSession(selectedSession.sessionId)}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Delete Chat Session"
                    >
                      <Trash2 className="size-3.5 sm:size-4" />
                    </button>
                  </div>
                </div>

                {/* Live Message History Feed */}
                <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4 bg-slate-50/50">
                  {selectedSession.messages.map((msg) => {
                    const isAdmin = msg.sender === "admin";
                    return (
                      <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-medium space-y-1 shadow-2xs ${
                            isAdmin
                              ? "bg-gradient-to-br from-slate-900 via-[#0a1b2e] to-[#061220] text-white rounded-br-none border border-cyan-500/20"
                              : "bg-white text-slate-900 border border-slate-200/90 rounded-bl-none"
                          }`}
                        >
                          <div className="text-[10px] font-bold opacity-75">
                            {isAdmin ? "Support Representative" : selectedSession.userName || "Customer"}
                          </div>
                          <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                          <div
                            className={`text-[9px] font-bold text-right ${
                              isAdmin ? "text-cyan-300" : "text-slate-400"
                            }`}
                          >
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Smart Reply Chips */}
                <div className="p-2 sm:p-3 bg-slate-50/90 border-t border-slate-100 overflow-x-auto flex gap-1.5 sm:gap-2 scrollbar-none">
                  {CHAT_SMART_PRESETS.map((tmpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setReplyText(tmpl.text)}
                      className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50 text-[10px] sm:text-[11px] font-bold text-slate-700 hover:text-cyan-900 transition shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
                    >
                      <Sparkles className="size-3 text-cyan-600" />
                      <span>{tmpl.label}</span>
                    </button>
                  ))}
                </div>

                {/* Message Input & Dispatch Bar */}
                <form
                  onSubmit={handleSend}
                  className="p-2.5 sm:p-3.5 bg-white border-t border-slate-100 flex items-center gap-2 sm:gap-2.5"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type official reply to customer..."
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || sendReplyMutation.isPending}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-md disabled:opacity-40 transition active:scale-95 cursor-pointer shrink-0"
                  >
                    <Send className="size-3.5" />
                    <span className="hidden xs:inline">Send</span>
                  </button>
                </form>
              </motion.div>
            ) : (
              <div className="p-12 sm:p-20 text-center bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl text-slate-400 text-xs font-bold space-y-2">
                <MessageSquare className="size-10 mx-auto text-slate-300 stroke-1" />
                <p className="text-sm font-bold text-slate-700">No active chat selected</p>
                <p className="text-xs text-slate-400">
                  Select a live session from the channel feed to communicate with customers in real time.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
