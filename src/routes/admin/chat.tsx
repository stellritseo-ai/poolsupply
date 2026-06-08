import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
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

function AdminChat() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Notification states
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

  // Poll every 5 seconds
  const { data, isLoading } = useQuery({
    queryKey: ["adminChatSessions"],
    queryFn: () => getAdminChatSessionsDb(),
    refetchInterval: 5000,
  });

  const sessions: ChatSession[] = data?.sessions ?? [];
  const filteredSessions = sessions.filter((s) =>
    search === "" ||
    (s.userName || `Guest-${s.sessionId.substring(0, 4)}`).toLowerCase().includes(search.toLowerCase())
  );

  const selectedSession = sessions.find((s) => s.sessionId === selectedSessionId) ?? null;

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

  // Browser Notifications Logic on incoming messages
  const prevUserMessageCount = useRef<Record<string, number>>({});
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!sessions || sessions.length === 0) return;

    if (isInitialLoad.current) {
      sessions.forEach((s) => {
        const userMessages = s.messages.filter((m) => m.sender === "user");
        prevUserMessageCount.current[s.sessionId] = userMessages.length;
      });
      isInitialLoad.current = false;
      return;
    }

    let shouldNotify = false;
    let notifyMessage = "";
    let notifySessionId = "";

    sessions.forEach((s) => {
      const userMessages = s.messages.filter((m) => m.sender === "user");
      const currentCount = userMessages.length;
      const prevCount = prevUserMessageCount.current[s.sessionId];

      if ((prevCount === undefined && currentCount > 0) || (prevCount !== undefined && currentCount > prevCount)) {
        shouldNotify = true;
        const lastUserMsg = userMessages[userMessages.length - 1];
        notifyMessage = lastUserMsg ? lastUserMsg.text : "New message received";
        notifySessionId = s.sessionId;
      }

      prevUserMessageCount.current[s.sessionId] = currentCount;
    });

    if (shouldNotify && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      const activeSession = sessions.find((s) => s.sessionId === notifySessionId);
      const displayName = activeSession?.userName || `Guest-${notifySessionId.substring(0, 4).toUpperCase()}`;
      new Notification(`New Message from ${displayName}`, {
        body: notifyMessage,
      });
    }
  }, [sessions]);

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

  const totalUnread = sessions.reduce((acc, s) => acc + (s.unreadAdmin ?? 0), 0);

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">Live Chat</h1>
            {totalUnread > 0 && (
              <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalUnread} new
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">Manage customer conversations in real-time.</p>
        </div>

        {/* Browser Notification Controls */}
        {typeof window !== "undefined" && "Notification" in window && (
          <div className="flex items-center">
            {notificationPermission === "granted" ? (
              <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1.5 font-medium shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Browser Notifications Enabled
              </span>
            ) : notificationPermission === "denied" ? (
              <span 
                className="text-xs bg-rose-50 text-rose-700 px-3 py-1.5 rounded-xl border border-rose-100 flex items-center gap-1.5 font-medium shadow-sm cursor-help"
                title="Notifications are blocked in your browser settings. Please reset permissions in your browser's address bar to enable notifications."
              >
                ❌ Notifications Blocked
              </span>
            ) : (
              <button
                onClick={requestNotificationPermission}
                className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                🔔 Enable Browser Notifications
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Chat UI */}
      <div
        className="flex flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        style={{ minHeight: 0, height: "calc(100vh - 210px)" }}
      >
        {/* ── LEFT SIDEBAR ── */}
        <div className="w-[300px] shrink-0 border-r border-slate-200 flex flex-col bg-slate-50/60">
          {/* Search */}
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 p-6 text-center">
                <MessageSquare className="w-10 h-10 text-slate-200" />
                <p className="text-sm text-slate-400 font-medium">No chat sessions yet</p>
                <p className="text-xs text-slate-400">Messages from the storefront chat widget will appear here.</p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const lastMsg = session.messages[session.messages.length - 1];
                const isSelected = session.sessionId === selectedSessionId;
                const hasUnread = (session.unreadAdmin ?? 0) > 0;

                return (
                  <button
                    key={session.sessionId}
                    onClick={() => setSelectedSessionId(session.sessionId)}
                    className={`w-full p-4 text-left border-b border-slate-100 transition-all duration-150 flex flex-col gap-1 relative border-l-4 ${
                      isSelected
                        ? "bg-primary/5 border-l-primary"
                        : "hover:bg-white/80 border-l-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-semibold text-slate-800 text-sm truncate max-w-[150px]">
                          {session.userName || `Guest-${session.sessionId.substring(0, 4).toUpperCase()}`}
                        </span>
                      </div>
                      {session.status === "resolved" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : hasUnread ? (
                        <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {session.unreadAdmin}
                        </span>
                      ) : null}
                    </div>
                    <div className="pl-9">
                      <p className="text-xs text-slate-500 truncate">
                        {lastMsg?.sender === "admin" ? "You: " : ""}
                        {lastMsg?.text ?? "Started a chat"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(session.updatedAt)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT CHAT PANE ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {selectedSession ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">
                      {selectedSession.userName || `Guest-${selectedSession.sessionId.substring(0, 4).toUpperCase()}`}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Started {formatDate(selectedSession.createdAt)} at{" "}
                        {formatTime(selectedSession.createdAt)} ·{" "}
                        {selectedSession.messages.length} messages
                      </p>
                      {(selectedSession.userEmail || selectedSession.userPhone) && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span className="text-slate-300">|</span>
                          {selectedSession.userEmail && (
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium" title="Email Address">
                              ✉️ {selectedSession.userEmail}
                            </span>
                          )}
                          {selectedSession.userPhone && (
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium" title="Phone Number">
                              📞 {selectedSession.userPhone}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {selectedSession.status !== "resolved" ? (
                  <button
                    onClick={() => resolveMutation.mutate()}
                    disabled={resolveMutation.isPending}
                    className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:scale-95 transition-all px-3 py-1.5 rounded-lg border border-emerald-200 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Resolved
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolved
                  </span>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-[#f6f7fb] flex flex-col gap-3">
                {selectedSession.messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                    No messages yet.
                  </div>
                ) : (
                  selectedSession.messages.map((msg) => {
                    const isAdmin = msg.sender === "admin";
                    return (
                      <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                        {!isAdmin && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shrink-0 mr-2 mt-auto">
                            <User className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[65%] rounded-2xl px-4 py-2.5 shadow-sm ${
                            isAdmin
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-white text-slate-800 border border-slate-100 rounded-tl-sm"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${isAdmin ? "text-primary-foreground/60 text-right" : "text-slate-400"}`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                        {isAdmin && (
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center shrink-0 ml-2 mt-auto overflow-hidden">
                            <img src={logo} alt="PSW" className="w-4 h-4 object-contain" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              {selectedSession.status !== "resolved" ? (
                <div className="px-5 py-4 border-t border-slate-200 bg-white shrink-0">
                  <div className="flex gap-2 items-end">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your reply..."
                      rows={1}
                      className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none bg-slate-50 transition-all"
                      style={{ maxHeight: "120px" }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!replyText.trim() || sendReplyMutation.isPending}
                      className="bg-primary hover:bg-primary/90 active:scale-95 disabled:opacity-40 transition-all text-white w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                    >
                      {sendReplyMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 text-center">
                    Press <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-500">Enter</kbd> to send · <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-500">Shift+Enter</kbd> for new line
                  </p>
                </div>
              ) : (
                <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 shrink-0 flex items-center justify-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  This conversation has been resolved and is read-only.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-50/50">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-slate-300" />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-500">Select a conversation</p>
                <p className="text-sm text-slate-400">Choose a chat session from the left to view messages.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
