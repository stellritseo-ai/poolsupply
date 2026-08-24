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
  MailWarning,
  Copy,
  Building,
  CheckCircle2,
  SlidersHorizontal,
  Bookmark,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getContactMessagesDb,
  markContactMessageReadDb,
  deleteContactMessageDb,
  ContactMessage,
} from "@/lib/api/emails.functions";

export const Route = createFileRoute("/admin/emails")({
  loader: async () => {
    try {
      const res = await getContactMessagesDb();
      return (res?.success && Array.isArray(res.messages) ? res.messages : []) as ContactMessage[];
    } catch {
      return [];
    }
  },
  component: AdminWebEmailsPage,
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

const SMART_REPLY_TEMPLATES = [
  {
    category: "Technical Specs",
    title: "Engineering Quote & Specs",
    text: "Thank you for reaching out to Pool Supply Wholesalers! Our technical engineers are reviewing your equipment requirements and will provide a formal commercial proposal and CAD specs shortly.",
  },
  {
    category: "Trade Account",
    title: "Contractor Account Approval",
    text: "Thank you for applying for a wholesale contractor account with Pool Supply Wholesalers. Your business documentation is currently being verified, and your dedicated wholesale account manager will contact you within 2 business hours.",
  },
  {
    category: "Freight Logistics",
    title: "Dispatch & Freight Update",
    text: "Your order details have been verified and assigned to our regional fulfillment logistics center. You will receive an automated dispatch notification with carrier freight tracking as soon as shipment departs the warehouse.",
  },
  {
    category: "Warranty & Support",
    title: "OEM Warranty & Compliance",
    text: "Thank you for inquiring about manufacturer warranty and compliance documentation. We have confirmed all models in your request carry full multi-year OEM commercial warranties. Please let us know if you need specific submittal documents.",
  },
];

function AdminWebEmailsPage() {
  const initialMessages = Route.useLoaderData() as ContactMessage[];
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "read" | "starred">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Live polling for contact emails
  const {
    data: messagesData = initialMessages,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin_contact_messages"],
    queryFn: async () => {
      const res = await getContactMessagesDb();
      if (res.success && Array.isArray(res.messages)) {
        return res.messages;
      }
      return [];
    },
    initialData: initialMessages,
    refetchInterval: 5000,
  });

  const messages: ContactMessage[] = messagesData || [];

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const unreadCount = useMemo(() => messages.filter((m) => !m.read).length, [messages]);

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

  const activeMessage = useMemo(() => {
    if (!selectedId) return filteredMessages[0] || null;
    return messages.find((m) => m.id === selectedId) || null;
  }, [selectedId, filteredMessages, messages]);

  useEffect(() => {
    if (!selectedId && filteredMessages.length > 0) {
      setSelectedId(filteredMessages[0].id);
    }
  }, [filteredMessages, selectedId]);

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
    if (!confirm("Are you sure you want to permanently delete this customer inquiry?")) return;
    setIsDeleting(true);
    try {
      await deleteContactMessageDb({ data: { id } });
      queryClient.setQueryData<ContactMessage[]>(["admin_contact_messages"], (old) =>
        (old || []).filter((m) => m.id !== id)
      );
      if (selectedId === id) {
        setSelectedId(null);
      }
      triggerToast("Customer inquiry deleted successfully.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to delete inquiry.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !activeMessage) return;
    const mailto = `mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(
      activeMessage.subject
    )}&body=${encodeURIComponent(replyText)}`;
    window.open(mailto, "_blank");
    setReplyText("");
    triggerToast("Native mail client launched with pre-filled response.");
  };

  const handleCopyText = () => {
    if (!activeMessage) return;
    navigator.clipboard.writeText(activeMessage.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    triggerToast("Customer message copied to clipboard.");
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

      {/* ─── ULTRA-PREMIUM EXECUTIVE COMMAND HEADER ─── */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-7 border border-cyan-500/20 bg-gradient-to-br from-[#061220] via-[#091f38] to-[#040d1a] text-white shadow-xl">
        {/* Glow ambient background element */}
        <div
          className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.16) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[10px] font-extrabold uppercase tracking-widest">
              <Mail className="size-3 text-cyan-400" />
              Live Contractor Inquiries Feed
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Customer Communications{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-white">
                Command Hub
              </span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl font-medium leading-relaxed">
              Centralized inbox for real-time contact form inquiries, trade account applications, and equipment quote submissions.
            </p>
          </div>

          {/* Quick Metrics HUD */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="p-3 px-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Inquiries</div>
              <div className="text-lg font-black text-white mt-0.5">{messages.length}</div>
            </div>

            <div className="p-3 px-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Unread Queue</div>
              <div className="text-lg font-black text-cyan-300 mt-0.5 flex items-center gap-1.5">
                {unreadCount}
                {unreadCount > 0 && <span className="size-2 rounded-full bg-rose-500 animate-pulse" />}
              </div>
            </div>

            <button
              onClick={() => refetch()}
              className="p-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition flex items-center gap-2 text-xs font-bold cursor-pointer"
              title="Sync Inquiries"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin text-cyan-300" : ""}`} />
              <span>Sync Feed</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── DUAL-PANE INBOX & DISPATCH CONSOLE ─── */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE (5 Cols): Search, Filter Toolbar & Email Stream */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-2xs space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by contractor, email, keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 h-11 border border-slate-200 bg-slate-50 rounded-2xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100 text-xs font-bold">
              <button
                onClick={() => setFilterTab("all")}
                className={`flex-1 py-2 rounded-xl transition text-center cursor-pointer ${filterTab === "all"
                    ? "bg-white text-slate-900 shadow-2xs font-black"
                    : "text-slate-500 hover:text-slate-900"
                  }`}
              >
                All ({messages.length})
              </button>
              <button
                onClick={() => setFilterTab("unread")}
                className={`flex-1 py-2 rounded-xl transition text-center cursor-pointer ${filterTab === "unread"
                    ? "bg-white text-slate-900 shadow-2xs font-black"
                    : "text-slate-500 hover:text-slate-900"
                  }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilterTab("starred")}
                className={`flex-1 py-2 rounded-xl transition text-center cursor-pointer ${filterTab === "starred"
                    ? "bg-white text-slate-900 shadow-2xs font-black"
                    : "text-slate-500 hover:text-slate-900"
                  }`}
              >
                Starred ({starredIds.size})
              </button>
            </div>
          </div>

          {/* Email Stream Feed */}
          <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-2xs divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg) => {
                const isSelected = activeMessage?.id === msg.id;
                const isStarred = starredIds.has(msg.id);
                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedId(msg.id)}
                    className={`p-4 transition cursor-pointer flex items-start justify-between gap-3 ${isSelected
                        ? "bg-cyan-50/60 border-l-4 border-l-cyan-600"
                        : "hover:bg-slate-50/80 border-l-4 border-l-transparent"
                      }`}
                  >
                    <div className="flex items-start gap-3 overflow-hidden">
                      <div className="size-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-black text-xs grid place-items-center shrink-0 shadow-2xs mt-0.5">
                        {msg.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-black truncate ${!msg.read ? "text-slate-900 font-black" : "text-slate-700"
                              }`}
                          >
                            {msg.name}
                          </span>
                          {!msg.read && (
                            <span className="size-2 rounded-full bg-cyan-500 shrink-0 animate-pulse" />
                          )}
                        </div>
                        <div className="text-xs font-extrabold text-slate-800 truncate">{msg.subject}</div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 font-medium">{msg.message}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                        {timeAgo(msg.createdAt)}
                      </span>
                      <button
                        onClick={(e) => toggleStar(msg.id, e)}
                        className={`p-1 rounded-md transition cursor-pointer ${isStarred ? "text-amber-500" : "text-slate-300 hover:text-slate-500"
                          }`}
                        title={isStarred ? "Unstar inquiry" : "Star inquiry"}
                      >
                        <Star className="size-3.5 fill-current" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2 p-6">
                <Inbox className="size-8 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs font-bold text-slate-700">No customer inquiries found</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  New submissions submitted through the /contact portal will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE (7 Cols): Master Reading Console & Smart Dispatcher */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {activeMessage ? (
              <motion.div
                key={activeMessage.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6"
              >
                {/* Header Profile Bar */}
                <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="size-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-black text-sm grid place-items-center shadow-md">
                      {activeMessage.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base text-slate-900">{activeMessage.name}</h3>
                        <span className="text-[10px] font-extrabold text-cyan-800 bg-cyan-50 border border-cyan-200/60 px-2 py-0.5 rounded-full">
                          Verified Contact
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium flex items-center gap-3 mt-1 flex-wrap">
                        <a
                          href={`mailto:${activeMessage.email}`}
                          className="hover:text-cyan-600 text-cyan-700 font-bold flex items-center gap-1"
                        >
                          <Mail className="size-3" />
                          <span>{activeMessage.email}</span>
                        </a>
                        {activeMessage.phone && (
                          <a
                            href={`tel:${activeMessage.phone}`}
                            className="hover:text-cyan-600 text-slate-600 flex items-center gap-1"
                          >
                            <Phone className="size-3 text-slate-400" />
                            <span>{activeMessage.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={handleCopyText}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition cursor-pointer"
                      title="Copy Message Text"
                    >
                      {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(activeMessage.id)}
                      disabled={isDeleting}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Delete Inquiry"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Subject & Timeline Header */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Inquiry Subject
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {activeMessage.subject}
                  </h2>
                  <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-slate-400" />
                    <span>
                      Received on{" "}
                      {new Date(activeMessage.createdAt).toLocaleString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Message Body Container */}
                <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-wrap selection:bg-cyan-500/20">
                  {activeMessage.message}
                </div>

                {/* Smart Response Chips */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="size-3 text-cyan-600" />
                      <span>One-Click Smart Response Presets</span>
                    </label>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {SMART_REPLY_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setReplyText(tmpl.text)}
                        className="p-3 text-left rounded-2xl bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-xs transition cursor-pointer group"
                      >
                        <div className="font-extrabold text-slate-900 group-hover:text-cyan-900 flex items-center justify-between">
                          <span>{tmpl.title}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{tmpl.category}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 font-medium">
                          {tmpl.text}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Response Composer */}
                <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Dispatch Response to Contractor
                  </label>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Compose customized response to ${activeMessage.email}...`}
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
                  />
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Recipient: <span className="font-bold text-slate-700">{activeMessage.email}</span>
                    </span>

                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-md disabled:opacity-40 cursor-pointer transition active:scale-95 shadow-cyan-900/30"
                    >
                      <Send className="size-3.5" />
                      <span>Dispatch Response via Mail Client</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="p-20 text-center bg-white border border-slate-200/90 rounded-3xl text-slate-400 text-xs font-bold space-y-2">
                <Inbox className="size-10 mx-auto text-slate-300 stroke-1" />
                <p className="text-sm font-bold text-slate-700">No message selected</p>
                <p className="text-xs text-slate-400">Select an inquiry from the left stream to inspect customer details.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
