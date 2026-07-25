import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Mail,
  Search,
  Trash2,
  CheckCircle,
  RefreshCw,
  Clock,
  User,
  Phone,
  Send,
  Inbox,
  Filter,
  Check,
  AlertCircle,
  ExternalLink,
  Calendar,
  Sparkles,
  MessageSquare,
  Star,
  ShieldCheck,
  Zap,
  Tag,
  ArrowRight,
  Reply,
  MailCheck,
  MailWarning
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getContactMessagesDb,
  markContactMessageReadDb,
  deleteContactMessageDb,
  ContactMessage
} from "@/lib/api/emails.functions";

export const Route = createFileRoute("/admin/emails")({
  component: AdminWebEmailsPage,
});

const QUICK_REPLY_TEMPLATES = [
  "Thank you for contacting Poolsby! Our technical team is reviewing your inquiry.",
  "Your dealer account request has been received. An account manager will call you shortly.",
  "Thank you for reaching out regarding equipment specs! We have forwarded this to our engineers.",
  "Your order details have been verified and processed by our fulfillment warehouse."
];

function AdminWebEmailsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "read" | "starred">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch messages from DB
  const { data: messagesData, isLoading, refetch } = useQuery({
    queryKey: ["admin_contact_messages"],
    queryFn: async () => {
      const res = await getContactMessagesDb();
      if (res.success && Array.isArray(res.messages)) {
        return res.messages;
      }
      return [];
    },
    refetchInterval: 8000 // auto refresh every 8 seconds for new live emails!
  });

  const messages: ContactMessage[] = messagesData || [];

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filtered & Searched Messages
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      if (filterTab === "unread" && m.read) return false;
      if (filterTab === "read" && !m.read) return false;
      if (filterTab === "starred" && !starredIds.has(m.id)) return false;

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    });
  }, [messages, filterTab, searchTerm, starredIds]);

  // Currently selected message
  const activeMessage = useMemo(() => {
    if (!selectedId) return filteredMessages[0] || null;
    return messages.find((m) => m.id === selectedId) || null;
  }, [selectedId, filteredMessages, messages]);

  // Auto select first message when list loads
  useEffect(() => {
    if (!selectedId && filteredMessages.length > 0) {
      setSelectedId(filteredMessages[0].id);
    }
  }, [filteredMessages, selectedId]);

  // Mark message as read when selected
  useEffect(() => {
    if (activeMessage && !activeMessage.read) {
      markContactMessageReadDb({ data: { id: activeMessage.id } }).then(() => {
        queryClient.setQueryData<ContactMessage[]>(["admin_contact_messages"], (old) =>
          (old || []).map((m) => (m.id === activeMessage.id ? { ...m, read: true } : m))
        );
      });
    }
  }, [activeMessage, queryClient]);

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Web Email message?")) return;
    setIsDeleting(true);
    try {
      await deleteContactMessageDb({ data: { id } });
      queryClient.setQueryData<ContactMessage[]>(["admin_contact_messages"], (old) =>
        (old || []).filter((m) => m.id !== id)
      );
      if (selectedId === id) {
        setSelectedId(null);
      }
      triggerToast("Web Email deleted successfully.");
    } catch (err) {
      console.error(err);
      triggerToast("Error deleting message.");
    } finally {
      setIsDeleting(false);
    }
  };

  const unreadCount = useMemo(() => messages.filter((m) => !m.read).length, [messages]);

  return (
    <div className="space-y-7 w-full pb-12">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-2xl border border-slate-800 text-xs font-bold"
          >
            <CheckCircle className="size-4.5 text-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HERO COMMAND HEADER BANNER ─── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-[2.5rem] overflow-hidden p-8 sm:p-10 border border-indigo-500/20"
        style={{
          background: "linear-gradient(135deg, #091224 0%, #152445 45%, #1e3a8a 80%, #2563eb 100%)",
          boxShadow: "0 25px 70px -15px rgba(37, 99, 235, 0.35)"
        }}
      >
        <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)", filter: "blur(60px)" }} />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-300 text-[11px] font-extrabold uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="size-3.5 text-indigo-400 animate-pulse" />
              Live Visitor Communications Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none flex items-center gap-3">
              Web Email Workspace
              {unreadCount > 0 ? (
                <span className="text-xs font-black bg-rose-500 text-white px-3 py-1 rounded-full animate-pulse border border-rose-400">
                  {unreadCount} Unread
                </span>
              ) : (
                <span className="text-xs font-extrabold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/40">
                  All Caught Up
                </span>
              )}
            </h1>
            <p className="text-indigo-100/75 text-sm max-w-xl font-medium leading-relaxed">
              Real-time contact inquiries from website visitors. Inspect, triage, and reply directly from your dashboard.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="hidden sm:flex items-center gap-4 bg-white/10 border border-white/20 p-3 rounded-2xl backdrop-blur-md text-white text-xs font-bold">
              <div className="text-center px-3 border-r border-white/15">
                <div className="text-lg font-black text-indigo-300">{messages.length}</div>
                <div className="text-[10px] text-indigo-200/70 font-semibold uppercase">Total Emails</div>
              </div>
              <div className="text-center px-3">
                <div className="text-lg font-black text-emerald-400">&lt; 15m</div>
                <div className="text-[10px] text-indigo-200/70 font-semibold uppercase">Avg Response</div>
              </div>
            </div>

            <button
              onClick={() => refetch()}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-indigo-50 text-slate-900 font-bold text-xs transition flex items-center gap-2 shadow-xl cursor-pointer"
            >
              <RefreshCw className={`size-4 ${isLoading ? "animate-spin text-indigo-600" : "text-slate-600"}`} />
              Sync Inbox
            </button>
          </div>
        </div>
      </motion.div>

      {/* ─── MAIN MAILBOX WORKSPACE GRID ─── */}
      <div className="grid lg:grid-cols-12 gap-0 bg-white border border-slate-200/80 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[700px] w-full">
        {/* Left 3.5 Cols: Email List Pane */}
        <div className="lg:col-span-4 border-r border-slate-100 flex flex-col bg-slate-50/50">
          {/* List Search & Filter Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-200/80 space-y-3 bg-white">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center justify-between gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { id: "all", label: "All", count: messages.length },
                { id: "unread", label: "Unread", count: unreadCount },
                { id: "read", label: "Read", count: messages.length - unreadCount },
                { id: "starred", label: "Starred", count: starredIds.size },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id as any)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filterTab === tab.id
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label} <span className="opacity-60 text-[10px]">({tab.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Email List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[600px] scrollbar-thin">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg) => {
                const isSelected = activeMessage?.id === msg.id;
                const isStarred = starredIds.has(msg.id);
                const formattedDate = new Date(msg.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedId(msg.id)}
                    className={`p-4 sm:p-5 transition cursor-pointer relative group ${
                      isSelected
                        ? "bg-indigo-50/80 border-l-4 border-indigo-600"
                        : msg.read
                        ? "bg-white hover:bg-slate-50"
                        : "bg-indigo-50/20 hover:bg-indigo-50/40 font-bold"
                    }`}
                  >
                    {!msg.read && (
                      <span className="absolute top-5 right-4 size-2.5 rounded-full bg-rose-500 animate-pulse" />
                    )}

                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => toggleStar(msg.id, e)}
                          className="text-slate-300 hover:text-amber-400 transition"
                        >
                          <Star className={`size-3.5 ${isStarred ? "text-amber-400 fill-amber-400" : ""}`} />
                        </button>
                        <span className={`text-xs ${msg.read ? "font-semibold text-slate-800" : "font-black text-slate-900"}`}>
                          {msg.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 shrink-0">
                        {formattedDate}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-700 truncate mb-1 pl-5">
                      {msg.subject}
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed pl-5">
                      {msg.message}
                    </p>

                    <div className="mt-2.5 pl-5 flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {msg.email}
                      </span>
                      {msg.phone && (
                        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {msg.phone}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <Inbox className="size-12 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-600">No Web Emails Found</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Visitor contact form submissions will appear here automatically in real time.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right 8 Cols: Email Detail & Reply Workspace Pane */}
        <div className="lg:col-span-8 flex flex-col bg-white">
          {activeMessage ? (
            <div className="flex-1 flex flex-col justify-between p-6 sm:p-8">
              <div className="space-y-6">
                {/* Email Top Actions Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-5 gap-4">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-2xl bg-indigo-600 text-white grid place-items-center font-black text-lg shrink-0 shadow-md">
                      {activeMessage.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                          {activeMessage.subject || "General Inquiry"}
                        </span>
                        {starredIds.has(activeMessage.id) && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-200">
                            <Star className="size-3 fill-amber-400 text-amber-400" /> Starred
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                        {activeMessage.subject}
                      </h2>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                        <span className="font-bold text-slate-800">{activeMessage.name}</span>
                        <span className="text-slate-400">&lt;{activeMessage.email}&gt;</span>
                        {activeMessage.phone && (
                          <span className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                            <Phone className="size-3 text-indigo-600" /> {activeMessage.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDeleteMessage(activeMessage.id)}
                      disabled={isDeleting}
                      title="Delete Web Email"
                      className="p-2.5 rounded-xl bg-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Message Timestamp */}
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <Calendar className="size-3.5 text-slate-400" />
                  Received on {new Date(activeMessage.createdAt).toLocaleString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>

                {/* Message Body Card */}
                <div className="bg-slate-50 border border-slate-200/80 p-6 rounded-2xl text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {activeMessage.message}
                </div>
              </div>

              {/* Reply Builder Section Footer */}
              <div className="border-t border-slate-100 pt-6 mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <Reply className="size-4 text-indigo-600" /> Quick Response Builder
                  </h4>
                  <a
                    href={`mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(activeMessage.subject)}`}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition"
                  >
                    Open Mail App <ExternalLink className="size-3" />
                  </a>
                </div>

                {/* Template Response Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {QUICK_REPLY_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReplyText(tmpl)}
                      className="shrink-0 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-3 py-1.5 rounded-xl border border-slate-200 transition cursor-pointer"
                    >
                      + Template {idx + 1}
                    </button>
                  ))}
                </div>

                {/* Reply Compose Textarea */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                  <textarea
                    rows={3}
                    placeholder={`Type a custom response to ${activeMessage.name}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-white rounded-xl p-3 border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500 transition resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Direct reply to <strong className="text-slate-600">{activeMessage.email}</strong>
                    </span>
                    <a
                      href={`mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(activeMessage.subject)}&body=${encodeURIComponent(replyText)}`}
                      onClick={() => {
                        triggerToast(`Opened mail client to reply to ${activeMessage.name}`);
                        setReplyText("");
                      }}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
                    >
                      <Send className="size-3.5" /> Send Reply
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-3">
              <Mail className="size-14 text-slate-200" />
              <h3 className="text-base font-bold text-slate-600">Select a Web Email to view details</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Choose any inquiry message from the inbox on the left to read and respond directly to visitors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
