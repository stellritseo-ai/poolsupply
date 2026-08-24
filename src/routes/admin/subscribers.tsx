import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Trash2,
  Download,
  Mail,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Users,
  Calendar,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSubscribers, deleteSubscriber } from "@/lib/api/subscribers.functions";

export const Route = createFileRoute("/admin/subscribers")({
  component: SubscribersList,
});

type Subscriber = {
  id: string;
  email: string;
  createdAt: string | Date;
};

function SubscribersList() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const loadSubscribers = async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) {
      setIsLoading(true);
    }
    setError("");
    try {
      const res = await getSubscribers();
      if (res.success && res.subscribers) {
        setSubscribers(res.subscribers);
      } else {
        if (showLoadingSpinner || subscribers.length === 0) {
          setError(res.error || "Failed to load subscribers.");
        }
      }
    } catch (err) {
      console.error(err);
      if (showLoadingSpinner || subscribers.length === 0) {
        setError("An unexpected error occurred while fetching subscribers.");
      }
    } finally {
      if (showLoadingSpinner) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadSubscribers(true);
    const interval = setInterval(() => {
      loadSubscribers(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => sub.email.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [subscribers, searchTerm]);

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from the subscriber list?`)) {
      return;
    }

    try {
      const res = await deleteSubscriber({ data: { id } });
      if (res.success) {
        setSubscribers(subscribers.filter((sub) => sub.id !== id));
        triggerToast(`${email} has been unsubscribed successfully.`);
      } else {
        triggerToast(res.error || "Failed to delete subscriber.");
      }
    } catch (err) {
      console.error(err);
      triggerToast("An error occurred. Please try again.");
    }
  };

  const exportToCSV = () => {
    if (subscribers.length === 0) {
      triggerToast("No subscribers to export.");
      return;
    }

    const headers = ["Email", "Joined Date"];
    const rows = subscribers.map((sub) => [sub.email, new Date(sub.createdAt).toISOString()]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))].join(
      "\n"
    );

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `wholesale_subscribers_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Subscribers list exported to CSV!");
  };

  return (
    <div className="space-y-6 max-w-[1360px] mx-auto w-full">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-2xl text-xs font-bold border border-slate-800"
          >
            <CheckCircle className="size-4 text-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="size-7 text-cyan-600" />
            <span>Newsletter & Trade Leads</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
            Manage wholesale newsletter subscribers, contractor email marketing leads, and CSV export records.
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-md cursor-pointer transition"
        >
          <Download className="size-4" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Toolbar Search */}
      <div className="bg-white border border-slate-200/90 p-3 rounded-2xl shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search subscribers by email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 h-10.5 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-cyan-600 mb-3" />
            <p className="text-xs font-bold text-slate-400">Loading newsletter leads...</p>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 border border-slate-100 text-slate-300">
              <Mail className="size-8" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">No subscribers found</h3>
            <p className="text-xs text-slate-400">There are no subscribers matching your search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="p-4 sm:px-6">Email Address</th>
                  <th className="p-4 sm:px-6">Subscription Date</th>
                  <th className="p-4 sm:px-6 text-center">Lead Status</th>
                  <th className="p-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-cyan-50 text-cyan-700 grid place-items-center font-black">
                          <Mail className="size-4" />
                        </div>
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{sub.email}</span>
                      </div>
                    </td>

                    <td className="p-4 sm:px-6 text-slate-500 font-medium">
                      {new Date(sub.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="p-4 sm:px-6 text-center">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-1 rounded-full text-[10px] font-extrabold">
                        <CheckCircle className="size-3 text-emerald-600" />
                        Active Subscriber
                      </span>
                    </td>

                    <td className="p-4 sm:px-6 text-right">
                      <button
                        onClick={() => handleDelete(sub.id, sub.email)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Unsubscribe Lead"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
