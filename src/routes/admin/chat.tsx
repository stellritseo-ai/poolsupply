import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminChatSessionsDb,
  addChatMessageDb,
  resolveChatSessionDb,
  markAdminChatReadDb,
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
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/admin/chat")({
  component: AdminChat,
});

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString([], { month: "short", day: "numeric" });
}

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const CHAT_QUICK_TEMPLATES = [
  "Hello! How can I assist you with your pool equipment today?",
  "Thank you for contacting Poolsby support! One moment while I check your details.",
  "Your order status has been updated and is preparing for warehouse dispatch.",
  "Would you like me to send you the technical spec sheet for this model?"
];

function AdminChat() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "resolved" | "unread">("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Notification permissions
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );

  const requestNotificationPermission = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().then((permission) => {
        setNotificationPermission(permission);
      });
    }
  };

  // Poll live sessions every 5 seconds
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["adminChatSessions"],
    queryFn: () => getAdminChatSessionsDb(),
    refetchInterval: 5000,
  });

  const sessions: ChatSession[] = data?.sessions ?? [];

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (statusFilter === "active" && s.status !== "active") return false;
      if (statusFilter === "resolved" && s.status !== "resolved") return false;
      if (statusFilter === "unread" && (s.unreadAdmin ?? 0) === 0) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const name = (s.userName || `Guest-${s.sessionId.substring(0, 4)}`).toLowerCase();
      const email = (s.userEmail || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [sessions, statusFilter, search]);

  const selectedSession = useMemo(() => {
    if (!selectedSessionId) return filteredSessions[0] || null;
    return sessions.find((s) => s.sessionId === selectedSessionId) ?? null;
  }, [selectedSessionId, filteredSessions, sessions]);

  // Auto select first session
  useEffect(() => {
    if (!selectedSessionId && filteredSessions.length > 0) {
      setSelectedSessionId(filteredSessions[0].sessionId);
    }
  }, [filteredSessions, selectedSessionId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedSession?.messages.length]);

  // Mark read when selecting
  const markReadMutation = useMutation({
    mutationFn: (sessionId: string) => markAdminChatReadDb({ data: { sessionId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminChatSessions"] }),
  });

  useEffect(() => {
    if (selectedSessionId && (selectedSession?.unreadAdmin ?? 0) > 0) {
      markReadMutation.mutate(selectedSessionId);
    }
  }, [selectedSessionId, selectedSession?.unreadAdmin]);

  // Send Reply Mutation
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

  // Resolve Session Mutation
  const resolveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSessionId) return;
      await resolveChatSessionDb({ data: { sessionId: selectedSessionId } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminChatSessions"] }),
  });

  const handleSend = () => {
    if (!replyText.trim() || !selectedSessionId) return;
    sendReplyMutation.mutate(replyText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const totalUnread = useMemo(() => sessions.reduce((acc, s) => acc + (s.unreadAdmin ?? 0), 0), [sessions]);
  const activeCount = useMemo(() => sessions.filter(s => s.status === "active").length, [sessions]);

  return (
    <div className="space-y-6 w-full pb-12">
      {/* ─── HERO COMMAND HEADER ─── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-[2.5rem] overflow-hidden p-8 sm:p-10 border border-cyan-500/20"
        style={{
          background: "linear-gradient(135deg, #001024 0%, #00244d 45%, #004d99 80%, #0066cc 100%)",
          boxShadow: "0 25px 70px -15px rgba(0, 102, 204, 0.35)"
        }}
      >
        <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(89,210,243,0.25) 0%, transparent 70%)", filter: "blur(60px)" }} />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-cyan-300 text-[11px] font-extrabold uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="size-3.5 text-cyan-400 animate-pulse" />
              Live Real-Time Messaging Hub
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none flex items-center gap-3">
              Customer Live Chat
              {activeCount > 0 ? (
                <span className="text-xs font-black bg-emerald-500 text-white px-3 py-1 rounded-full animate-pulse border border-emerald-400">
                  {activeCount} Active
                </span>
              ) : (
                <span className="text-xs font-bold bg-white/10 text-white/80 px-3 py-1 rounded-full border border-white/20">
                  All Quiet
                </span>
              )}
            </h1>
            <p className="text-cyan-100/75 text-sm max-w-xl font-medium leading-relaxed">
              Instant customer conversations from the storefront widget. Engage, resolve inquiries, and support customers live.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {typeof window !== "undefined" && "Notification" in window && (
              <div>
                {notificationPermission === "granted" ? (
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-4 py-2.5 rounded-2xl border border-emerald-400/40 flex items-center gap-2 font-bold shadow-lg backdrop-blur-md">
                    <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                    Notifications Active
                  </span>
                ) : (
                  <button
                    onClick={requestNotificationPermission}
                    className="text-xs bg-white text-slate-900 hover:bg-cyan-50 px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl cursor-pointer"
                  >
                    <Bell className="size-4 text-cyan-600" /> Enable Alerts
                  </button>
                )}
              </div>
            )}

            <button
              onClick={() => refetch()}
              className="p-3 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition backdrop-blur-md cursor-pointer"
              title="Sync Chat Sessions"
            >
              <RefreshCw className={`size-4 ${isLoading ? "animate-spin text-cyan-300" : ""}`} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ─── MAIN CHAT WORKSPACE CONTAINER ─── */}
      <div
        className="grid lg:grid-cols-12 gap-0 bg-white border border-slate-200/80 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[700px] w-full"
      >
        {/* Left 4 Cols: Conversations Sidebar */}
        <div className="lg:col-span-4 border-r border-slate-100 flex flex-col bg-slate-50/50">
          {/* Search & Filter Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-200/80 space-y-3 bg-white">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations by name..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:border-cyan-500 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center justify-between gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { id: "all", label: "All", count: sessions.length },
                { id: "active", label: "Active", count: activeCount },
                { id: "unread", label: "Unread", count: totalUnread },
                { id: "resolved", label: "Resolved", count: sessions.length - activeCount },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === tab.id
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label} <span className="opacity-60 text-[10px]">({tab.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[600px] scrollbar-thin">
            {isLoading ? (
              <div className="flex items-center justify-center p-12 text-slate-400">
                <Loader2 className="size-6 animate-spin text-cyan-600" />
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <MessageSquare className="size-12 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-600">No Chat Sessions Found</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Visitor live chat conversations from the storefront widget will appear here live.
                </p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const lastMsg = session.messages[session.messages.length - 1];
                const isSelected = session.sessionId === selectedSessionId;
                const hasUnread = (session.unreadAdmin ?? 0) > 0;
                const displayName = session.userName || `Guest-${session.sessionId.substring(0, 4).toUpperCase()}`;

                return (
                  <div
                    key={session.sessionId}
                    onClick={() => setSelectedSessionId(session.sessionId)}
                    className={`p-4 sm:p-5 transition cursor-pointer relative ${
                      isSelected
                        ? "bg-cyan-50/80 border-l-4 border-cyan-600"
                        : hasUnread
                        ? "bg-emerald-50/30 hover:bg-emerald-50/60 font-bold"
                        : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    {hasUnread && (
                      <span className="absolute top-5 right-4 size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}

                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="size-9 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white font-black text-xs grid place-items-center shrink-0 shadow-sm">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={`text-xs ${hasUnread ? "font-black text-slate-900" : "font-bold text-slate-800"}`}>
                            {displayName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {timeAgo(session.updatedAt)}
                          </div>
                        </div>
                      </div>

                      {session.status === "resolved" ? (
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Resolved
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                          Active
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 truncate pl-11">
                      {lastMsg?.sender === "admin" ? <strong className="text-cyan-700">You: </strong> : ""}
                      {lastMsg?.text ?? "Started a conversation"}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 8 Cols: Live Chat Conversation & Reply Workspace */}
        <div className="lg:col-span-8 flex flex-col bg-white">
          {selectedSession ? (
            <div className="flex-1 flex flex-col justify-between">
              {/* Active Conversation Top Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-white shadow-xs shrink-0">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white font-black text-base grid place-items-center shadow-md shrink-0">
                    {(selectedSession.userName || `G`).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      {selectedSession.userName || `Guest-${selectedSession.sessionId.substring(0, 4).toUpperCase()}`}
                      {selectedSession.status === "active" ? (
                        <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">Archived</span>
                      )}
                    </h3>

                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-slate-600">
                        <Clock className="size-3 text-slate-400" />
                        Started {formatDate(selectedSession.createdAt)} at {formatTime(selectedSession.createdAt)}
                      </span>
                      {selectedSession.userEmail && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">
                          ✉️ {selectedSession.userEmail}
                        </span>
                      )}
                      {selectedSession.userPhone && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">
                          📞 {selectedSession.userPhone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  {selectedSession.status !== "resolved" ? (
                    <button
                      onClick={() => resolveMutation.mutate()}
                      disabled={resolveMutation.isPending}
                      className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1.5 border border-emerald-200 transition cursor-pointer"
                    >
                      <CheckCircle2 className="size-3.5" /> Mark Resolved
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-xs flex items-center gap-1.5 border border-emerald-200">
                      <CheckCircle2 className="size-3.5" /> Resolved
                    </span>
                  )}
                </div>
              </div>

              {/* Chat Messages Log Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/60 flex flex-col gap-4 max-h-[480px]">
                {selectedSession.messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs font-bold">
                    No messages in conversation.
                  </div>
                ) : (
                  selectedSession.messages.map((msg) => {
                    const isAdmin = msg.sender === "admin";
                    return (
                      <div key={msg.id} className={`flex items-end gap-2.5 ${isAdmin ? "justify-end" : "justify-start"}`}>
                        {!isAdmin && (
                          <div className="size-8 rounded-xl bg-slate-900 text-white font-black text-xs grid place-items-center shrink-0 shadow-xs">
                            {(selectedSession.userName || "G").charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div
                          className={`max-w-[70%] rounded-2xl p-4 shadow-sm text-xs leading-relaxed ${
                            isAdmin
                              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-xs font-medium"
                              : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs font-medium"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <div className={`text-[10px] mt-1.5 font-bold ${isAdmin ? "text-cyan-100 text-right" : "text-slate-400"}`}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="size-8 rounded-xl bg-indigo-600 text-white p-1.5 shrink-0 grid place-items-center shadow-xs">
                            <img src={logo} alt="Poolsby" className="w-full h-full object-contain brightness-0 invert" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply & Input Area Footer */}
              {selectedSession.status !== "resolved" ? (
                <div className="p-5 border-t border-slate-100 bg-white space-y-3 shrink-0">
                  {/* Quick Response Template Chips */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {CHAT_QUICK_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setReplyText(tmpl)}
                        className="shrink-0 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 px-3 py-1 rounded-xl border border-slate-200 transition cursor-pointer"
                      >
                        + Template {idx + 1}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your reply message..."
                      rows={2}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-semibold focus:outline-none focus:border-cyan-500 focus:bg-white transition resize-none"
                    />

                    <button
                      onClick={handleSend}
                      disabled={!replyText.trim() || sendReplyMutation.isPending}
                      className="px-6 py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg disabled:opacity-40 shrink-0"
                    >
                      {sendReplyMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <>
                          <span>Send</span>
                          <Send className="size-4" />
                        </>
                      )}
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium text-center">
                    Press <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-500">Enter</kbd> to send message · <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-500">Shift+Enter</kbd> for line break
                  </div>
                </div>
              ) : (
                <div className="p-5 border-t border-slate-100 bg-slate-50 text-center text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" /> This conversation has been marked resolved.
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-3">
              <MessageSquare className="size-14 text-slate-200" />
              <h3 className="text-base font-bold text-slate-600">Select a conversation to reply</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Choose any active or past chat session from the list on the left to read and send replies live.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
