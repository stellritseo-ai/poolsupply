import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageCircle,
  X,
  Droplet,
  Flame,
  Filter,
  Sparkles,
  Lightbulb,
  LifeBuoy,
  PhoneCall,
  Send,
  CheckCircle2,
  Loader2,
  User,
  Mail,
  Phone,
} from "lucide-react";
import {
  getChatSessionDb,
  addChatMessageDb,
  type ChatSession,
  type ChatMessage,
} from "@/lib/api/chat.functions";
import logo from "@/assets/logo.png";

// ── Quick action shortcuts ────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: <Droplet className="w-4 h-4 text-cyan-500" />, label: "Pumps", message: "I need help with pool pumps." },
  { icon: <Flame className="w-4 h-4 text-orange-500" />, label: "Heaters", message: "Can you help me find a pool heater?" },
  { icon: <Filter className="w-4 h-4 text-blue-500" />, label: "Filters", message: "I'm looking for pool filters." },
  { icon: <Sparkles className="w-4 h-4 text-amber-500" />, label: "Cleaners", message: "Tell me about pool cleaners." },
  { icon: <Lightbulb className="w-4 h-4 text-yellow-500" />, label: "Lighting", message: "I need pool lighting options." },
  { icon: <LifeBuoy className="w-4 h-4 text-rose-500" />, label: "Support", message: "I need general support." },
];

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Component ─────────────────────────────────────────────────────────────────
export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Registration form states
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [formError, setFormError] = useState("");
  const [hasRegistered, setHasRegistered] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("pool_chat_session_id");
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("pool_chat_session_id", id);
      }
      setSessionId(id);

      const storedName = localStorage.getItem("pool_chat_user_name");
      const storedEmail = localStorage.getItem("pool_chat_user_email");
      const storedPhone = localStorage.getItem("pool_chat_user_phone");
      const registered = localStorage.getItem("pool_chat_registered") === "true";

      if (storedName) setRegName(storedName);
      if (storedEmail) setRegEmail(storedEmail);
      if (storedPhone) setRegPhone(storedPhone);
      setHasRegistered(registered);
    }
  }, []);

  // Poll every 4 s while the widget is open, or 15 s when closed (for background notification updates)
  const { data, isLoading } = useQuery({
    queryKey: ["chatSession", sessionId],
    queryFn: () => getChatSessionDb({ data: { sessionId } }),
    refetchInterval: isOpen ? 4000 : 15000,
    enabled: !!sessionId,
  });

  const chatData = data as { success: boolean; session: ChatSession | null } | undefined;
  const session = chatData?.session ?? null;
  const messages: ChatMessage[] = session?.messages ?? [];
  const isResolved = session?.status === "resolved";

  // If session already has a name, sync it to hasRegistered and localStorage
  useEffect(() => {
    if (session?.userName) {
      setHasRegistered(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("pool_chat_registered", "true");
        localStorage.setItem("pool_chat_user_name", session.userName);
        if (session.userEmail) localStorage.setItem("pool_chat_user_email", session.userEmail);
        if (session.userPhone) localStorage.setItem("pool_chat_user_phone", session.userPhone);
      }
    }
  }, [session?.userName]);

  // Request notification permission when opening the chat widget
  useEffect(() => {
    if (isOpen && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, [isOpen]);

  // Browser notifications for new admin messages
  const prevAdminMsgCount = useRef(0);
  const isInitialChatLoad = useRef(true);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const adminMessages = messages.filter((m) => m.sender === "admin");
    const currentCount = adminMessages.length;

    if (isInitialChatLoad.current) {
      prevAdminMsgCount.current = currentCount;
      isInitialChatLoad.current = false;
      return;
    }

    if (currentCount > prevAdminMsgCount.current) {
      // Trigger notification
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        const lastAdminMsg = adminMessages[adminMessages.length - 1];
        new Notification("Pool Supply Support", {
          body: lastAdminMsg ? lastAdminMsg.text : "You have a new reply from support.",
          icon: "/favicon.ico",
        });
      }
    }
    
    prevAdminMsgCount.current = currentCount;
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isOpen]);

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      const message: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "user",
        text,
        timestamp: new Date().toISOString(),
      };
      await addChatMessageDb({
        data: {
          sessionId,
          message,
          userName: regName ? regName.trim() : undefined,
          userEmail: regEmail ? regEmail.trim() : undefined,
          userPhone: regPhone ? regPhone.trim() : undefined,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatSession", sessionId] });
    },
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setFormError("Name is required.");
      return;
    }
    if (!regEmail.trim() && !regPhone.trim()) {
      setFormError("Please provide either an email address or phone number.");
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("pool_chat_user_name", regName.trim());
      localStorage.setItem("pool_chat_user_email", regEmail.trim());
      localStorage.setItem("pool_chat_user_phone", regPhone.trim());
      localStorage.setItem("pool_chat_registered", "true");
    }
    setHasRegistered(true);
  };

  const handleSend = (text?: string) => {
    const msg = (text ?? inputText).trim();
    if (!msg || isResolved) return;
    setInputText("");
    sendMutation.mutate(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* ── Chat Window ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="mb-4 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-[0_24px_64px_-12px_rgba(0,0,0,0.32)] overflow-hidden border border-slate-200/80 bg-white flex flex-col"
            style={{ maxHeight: "min(620px, 82vh)" }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between shrink-0"
              style={{ background: "linear-gradient(135deg, #22306e 0%, #3d4fa3 100%)" }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/15 ring-2 ring-white/20 flex items-center justify-center overflow-hidden">
                    <img src={logo} alt="PSW" className="w-6 h-6 object-contain brightness-0 invert" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#22306e]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-[15px] leading-tight">Pool Supply Support</h3>
                  <p className="text-white/60 text-[11px]">
                    {!hasRegistered ? "We reply in minutes" : (isLoading ? "Loading…" : session ? `${messages.length} messages` : "We reply in minutes")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:bg-white/15 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pre-chat Form or Chat Content */}
            {!hasRegistered ? (
              <div className="flex-1 overflow-y-auto px-5 py-6 bg-[#f5f6fa] flex flex-col gap-4">
                <div className="text-center mb-2">
                  <div className="w-12 h-12 rounded-full bg-[#22306e]/10 text-[#22306e] flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-[#22306e]" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-[15px]">Welcome to Live Support!</h4>
                  <p className="text-xs text-slate-500 mt-1">Please introduce yourself to start chatting with us.</p>
                </div>

                <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => {
                          setRegName(e.target.value);
                          setFormError("");
                        }}
                        placeholder="John Doe"
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#22306e]/20 focus:border-[#22306e]/50 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => {
                          setRegEmail(e.target.value);
                          setFormError("");
                        }}
                        placeholder="john@example.com"
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#22306e]/20 focus:border-[#22306e]/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">— OR —</div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => {
                          setRegPhone(e.target.value);
                          setFormError("");
                        }}
                        placeholder="+1 (555) 000-0000"
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#22306e]/20 focus:border-[#22306e]/50 transition-all"
                      />
                    </div>
                  </div>

                  {formError && (
                    <p className="text-[11px] text-rose-500 font-bold mt-1 text-center">{formError}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full h-10 mt-3 rounded-xl text-white font-bold text-xs active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
                    style={{ background: "linear-gradient(135deg, #22306e 0%, #3d4fa3 100%)" }}
                  >
                    Start Chatting
                  </button>
                </form>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-5 bg-[#f5f6fa] flex flex-col gap-3">
                  {/* Loading skeleton */}
                  {isLoading && messages.length === 0 && (
                    <div className="flex justify-center py-6">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    </div>
                  )}

                  {/* Welcome message when no messages yet */}
                  {!isLoading && messages.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm border border-slate-100 text-slate-700 text-sm leading-relaxed"
                    >
                      👋 Hi there! I'm your Pool Supply Wholesalers support assistant. Ask about pumps, heaters, filters, cleaners, lighting, or anything else. How can I help?
                    </motion.div>
                  )}

                  {/* Actual messages */}
                  {messages.map((msg, i) => {
                    const isUser = msg.sender === "user";
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i < 5 ? i * 0.025 : 0 }}
                        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        {!isUser && (
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center shrink-0 mr-2 mt-auto overflow-hidden">
                            <img src={logo} alt="Support" className="w-4 h-4 object-contain" />
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                            isUser
                              ? "text-white rounded-tr-sm"
                              : "bg-white text-slate-800 border border-slate-100 rounded-tl-sm"
                          }`}
                          style={isUser ? { background: "linear-gradient(135deg, #22306e, #3d4fa3)" } : undefined}
                        >
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${isUser ? "text-white/55 text-right" : "text-slate-400"}`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                        {isUser && (
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 ml-2 mt-auto">
                            <User className="w-3.5 h-3.5 text-slate-600" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}

                  {/* Resolved notice */}
                  {isResolved && (
                    <div className="flex items-center justify-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl py-2 px-3">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      This session has been resolved by our team.
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions (only before first user message) */}
                {messages.length === 0 && !isResolved && (
                  <div className="px-4 pb-3 bg-[#f5f6fa] shrink-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Quick Actions</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {QUICK_ACTIONS.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(action.message)}
                          className="flex items-center gap-1.5 bg-white hover:bg-slate-50 active:scale-95 transition-all px-2.5 py-2 rounded-xl border border-slate-100 shadow-sm text-xs font-medium text-slate-700"
                        >
                          {action.icon}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sales CTA (only before first message) */}
                {messages.length === 0 && !isResolved && (
                  <div className="px-4 pb-3 bg-[#f5f6fa] shrink-0">
                    <a
                      href="tel:+1800000000"
                      className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 active:scale-[0.98] transition-all py-2.5 rounded-xl border border-slate-200 shadow-sm text-sm font-semibold text-[#22306e]"
                    >
                      <PhoneCall className="w-4 h-4 text-blue-500" />
                      Contact Sales Team
                    </a>
                  </div>
                )}

                {/* Input */}
                {!isResolved ? (
                  <div className="px-4 pb-4 pt-2 bg-white border-t border-slate-100 shrink-0">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about pool supplies…"
                        disabled={sendMutation.isPending}
                        className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#22306e]/20 focus:border-[#22306e]/50 transition-all"
                      />
                      <button
                        onClick={() => handleSend()}
                        disabled={!inputText.trim() || sendMutation.isPending}
                        className="w-11 h-11 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm active:scale-95 disabled:opacity-40 transition-all"
                        style={{ background: "linear-gradient(135deg, #22306e, #3d4fa3)" }}
                      >
                        {sendMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB ──────────────────────────────────────────────────────────────── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen((o) => !o)}
        className="relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white"
        style={{ background: "linear-gradient(135deg, #22306e 0%, #3d4fa3 100%)" }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="x" initial={{ rotate: -90, scale: 0.5 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: 90, scale: 0.5 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span key="msg" initial={{ rotate: 90, scale: 0.5 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: -90, scale: 0.5 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
        {/* Unread indicator */}
        {session && (session.unreadUser ?? 0) > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            {session.unreadUser}
          </span>
        )}
      </motion.button>
    </div>
  );
}
