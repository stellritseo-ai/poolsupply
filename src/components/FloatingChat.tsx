import { useState, useEffect, useRef } from "react";
import { useLocation } from "@tanstack/react-router";
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
  Headphones,
  CheckCheck,
  ShieldCheck,
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
  { icon: <Droplet className="w-3.5 h-3.5 text-cyan-500" />, label: "Pool Pumps", message: "I need assistance with commercial pool pumps." },
  { icon: <Flame className="w-3.5 h-3.5 text-orange-500" />, label: "Gas Heaters", message: "Can you help me choose the right pool heater?" },
  { icon: <Filter className="w-3.5 h-3.5 text-blue-500" />, label: "Filters", message: "I'm looking for high-rate pool filters." },
  { icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />, label: "Cleaners", message: "Tell me about commercial pool cleaners." },
  { icon: <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />, label: "Lighting", message: "I need LED pool lighting specifications." },
  { icon: <LifeBuoy className="w-3.5 h-3.5 text-rose-500" />, label: "Support", message: "I need general wholesale support." },
];

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Component ─────────────────────────────────────────────────────────────────
export function FloatingChat() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Hide on all /admin pages
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

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

  // Poll chat session from DB
  const { data: sessionData, isLoading } = useQuery({
    queryKey: ["chatSession", sessionId],
    queryFn: () => (sessionId ? getChatSessionDb({ data: { sessionId } }) : Promise.resolve(null)),
    enabled: !!sessionId && hasRegistered,
    refetchInterval: 3000,
  });

  const session: ChatSession | null = sessionData?.session ?? null;
  const messages = session?.messages ?? [];
  const isResolved = session?.status === "resolved";

  // Auto-scroll
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isOpen]);

  const handleStartNewSession = () => {
    const newId = crypto.randomUUID();
    setSessionId(newId);
    if (typeof window !== "undefined") {
      localStorage.setItem("pool_chat_session_id", newId);
    }
    queryClient.invalidateQueries({ queryKey: ["chatSession"] });
  };

  const sendMutation = useMutation({
    mutationFn: async ({ text, targetSessionId }: { text: string; targetSessionId?: string }) => {
      const activeId = targetSessionId || sessionId;
      const message: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "user",
        text,
        timestamp: new Date().toISOString(),
      };
      await addChatMessageDb({
        data: {
          sessionId: activeId,
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
    if (!msg) return;
    setInputText("");

    if (isResolved) {
      const newId = crypto.randomUUID();
      setSessionId(newId);
      if (typeof window !== "undefined") {
        localStorage.setItem("pool_chat_session_id", newId);
      }
      sendMutation.mutate({ text: msg, targetSessionId: newId });
      return;
    }

    sendMutation.mutate({ text: msg });
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
            className="mb-4 w-[390px] max-w-[calc(100vw-2rem)] rounded-3xl shadow-[0_24px_70px_-12px_rgba(0,0,0,0.35)] overflow-hidden border border-slate-200/90 bg-white flex flex-col"
            style={{ maxHeight: "min(630px, 84vh)" }}
          >
            {/* Executive Luxury Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#061220] via-[#091f38] to-[#040d1a] border-b border-cyan-500/20 text-white flex items-center justify-between shrink-0 shadow-sm relative overflow-hidden">
              <div
                className="absolute top-0 right-10 w-36 h-36 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)",
                  filter: "blur(20px)",
                }}
              />

              <div className="flex items-center gap-3 relative z-10">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center overflow-hidden p-1.5 shadow-inner">
                    <img src={logo} alt="PSW" className="w-full h-full object-contain brightness-0 invert" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-[#061220] animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-white text-sm tracking-tight">Pool Supply Support</h3>
                    <ShieldCheck className="size-3.5 text-cyan-400" />
                  </div>
                  <p className="text-cyan-200/80 text-[11px] font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="size-1.5 rounded-full bg-emerald-400 inline-block" />
                    <span>Online · Instant Technical Advisory</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:bg-white/15 hover:text-white transition-colors cursor-pointer relative z-10"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pre-chat Form or Chat Content */}
            {!hasRegistered ? (
              <div className="flex-1 overflow-y-auto px-6 py-7 bg-slate-50 flex flex-col gap-4">
                <div className="text-center mb-1">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200/60 text-cyan-700 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                    <Headphones className="w-6 h-6 text-cyan-600" />
                  </div>
                  <h4 className="font-black text-slate-900 text-base">Live Technical Support</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                    Connect directly with certified commercial pool equipment specialists.
                  </p>
                </div>

                <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Full Name <span className="text-rose-500">*</span>
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
                        placeholder="e.g. Michael Miller"
                        className="w-full h-10.5 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-500 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
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
                        placeholder="contractor@example.com"
                        className="w-full h-10.5 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-500 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">— OR —</div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
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
                        className="w-full h-10.5 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-500 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {formError && (
                    <p className="text-[11px] text-rose-500 font-bold mt-1 text-center">{formError}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full h-11 mt-2 rounded-xl text-white font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600"
                  >
                    <span>Start Live Chat</span>
                  </button>
                </form>
              </div>
            ) : (
              <>
                {/* Messages Stream Feed */}
                <div className="flex-1 overflow-y-auto px-4 py-5 bg-slate-50/70 flex flex-col gap-3">
                  {/* Loading skeleton */}
                  {isLoading && messages.length === 0 && (
                    <div className="flex justify-center py-6">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    </div>
                  )}

                  {/* Welcome banner when empty */}
                  {!isLoading && messages.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/80 text-slate-700 text-xs leading-relaxed space-y-1"
                    >
                      <div className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                        <Sparkles className="size-3.5 text-cyan-600" />
                        <span>Welcome to Wholesale Support!</span>
                      </div>
                      <p className="text-slate-600 font-medium text-[12px] leading-normal">
                        Ask about pumps, heaters, sand filters, salt chlorinators, or contractor volume discounts. How can we help?
                      </p>
                    </motion.div>
                  )}

                  {/* Actual Chat Bubbles */}
                  {messages.map((msg, i) => {
                    const isUser = msg.sender === "user";
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i < 6 ? i * 0.02 : 0 }}
                        className={`flex ${isUser ? "justify-end" : "justify-start"} items-end gap-2`}
                      >
                        {!isUser && (
                          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center shrink-0 mb-1 overflow-hidden p-1 shadow-2xs">
                            <img src={logo} alt="PSW" className="w-full h-full object-contain brightness-0 invert" />
                          </div>
                        )}

                        <div
                          className={`max-w-[78%] rounded-2xl px-3.5 py-2 shadow-2xs transition-all ${
                            isUser
                              ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-br-xs shadow-cyan-900/15"
                              : "bg-white text-slate-900 border border-slate-200/90 rounded-bl-xs"
                          }`}
                        >
                          {!isUser && (
                            <div className="text-[9px] font-black text-cyan-700 tracking-wider uppercase mb-0.5">
                              Support Representative
                            </div>
                          )}
                          <p className="text-[13px] leading-snug font-medium whitespace-pre-wrap">{msg.text}</p>
                          <div
                            className={`text-[9px] mt-0.5 font-bold flex items-center justify-end gap-1 ${
                              isUser ? "text-cyan-100/75" : "text-slate-400"
                            }`}
                          >
                            <span>{formatTime(msg.timestamp)}</span>
                            {isUser && <CheckCheck className="size-2.5 text-cyan-200/80" />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Resolved notice banner */}
                  {isResolved && (
                    <div className="flex flex-col items-center justify-center gap-2.5 text-xs text-slate-700 bg-white border border-slate-200/90 rounded-2xl p-4 text-center my-2 shadow-2xs">
                      <div className="flex items-center gap-1.5 font-extrabold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>This conversation has been resolved.</span>
                      </div>
                      <p className="text-[11px] text-slate-500 max-w-[260px] font-medium">
                        Need assistance with another product or order? Click below to start a new chat.
                      </p>
                      <button
                        onClick={handleStartNewSession}
                        className="mt-0.5 px-4 py-2 rounded-xl text-white font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Start New Conversation</span>
                      </button>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions (only before first message) */}
                {messages.length === 0 && !isResolved && (
                  <div className="px-4 pb-3 bg-slate-50/70 shrink-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Quick Inquiries</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {QUICK_ACTIONS.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(action.message)}
                          className="flex items-center gap-1.5 bg-white hover:bg-cyan-50/80 active:scale-95 transition-all px-2.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs text-[11px] font-bold text-slate-700 hover:text-cyan-900 cursor-pointer"
                        >
                          {action.icon}
                          <span className="truncate">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Bar */}
                <div className="px-4 pb-4 pt-3 bg-white border-t border-slate-100 shrink-0">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={isResolved ? "Type to start a new chat session…" : "Ask about pool supplies…"}
                      disabled={sendMutation.isPending}
                      className="flex-1 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-900 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all shadow-2xs"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!inputText.trim() || sendMutation.isPending}
                      className="w-10.5 h-10.5 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-md active:scale-95 disabled:opacity-40 transition-all cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 shadow-cyan-900/20"
                    >
                      {sendMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB Button ────────────────────────────────────────────────────────── */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen((o) => !o)}
        className="relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 ring-4 ring-cyan-500/20"
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
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
            {session.unreadUser}
          </span>
        )}
      </motion.button>
    </div>
  );
}
