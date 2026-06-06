import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  Trash2, 
  Download, 
  Mail, 
  CheckCircle, 
  Loader2, 
  AlertTriangle 
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
        // Only trigger the main error screen if it's the initial load
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
    // Initial fetch with full loading spinner
    loadSubscribers(true);

    // Poll for changes every 4 seconds in the background
    const interval = setInterval(() => {
      loadSubscribers(false);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  // Filter subscribers
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(sub => 
      sub.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subscribers, searchTerm]);

  // Handle subscriber delete (unsubscribe)
  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from the subscriber list?`)) {
      return;
    }

    try {
      const res = await deleteSubscriber({ data: { id } });
      if (res.success) {
        setSubscribers(subscribers.filter(sub => sub.id !== id));
        triggerToast(`${email} has been unsubscribed successfully.`);
      } else {
        triggerToast(res.error || "Failed to delete subscriber.");
      }
    } catch (err) {
      console.error(err);
      triggerToast("An error occurred. Please try again.");
    }
  };

  // Export subscribers to CSV
  const exportToCSV = () => {
    if (subscribers.length === 0) {
      triggerToast("No subscribers to export.");
      return;
    }

    const headers = ["Email", "Joined Date"];
    const rows = subscribers.map(sub => [
      sub.email,
      new Date(sub.createdAt).toISOString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `subscribers_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Subscribers list exported successfully!");
  };

  const formatDate = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg text-xs font-bold"
          >
            <CheckCircle className="size-4.5 text-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Newsletter Subscribers</h1>
        <p className="text-slate-500 text-sm mt-1">Manage public storefront email subscriptions and export directories for marketing campaigns.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/60 p-4 rounded-[2rem] shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search subscribers by email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 h-11 border border-slate-200 bg-slate-50 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white transition-all animate-fade-in"
          />
        </div>
        
        <button
          onClick={exportToCSV}
          disabled={isLoading || subscribers.length === 0}
          className="h-11 px-6 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Download className="size-4" />
          Export to CSV
        </button>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2 bg-white border border-slate-200/60 rounded-[2rem] shadow-sm">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="text-xs text-slate-400 font-semibold">Loading subscribers...</span>
        </div>
      ) : error ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-6 bg-white border border-slate-200/60 rounded-[2rem] shadow-sm text-center">
          <AlertTriangle className="size-12 text-rose-500 mb-2" />
          <h3 className="font-extrabold text-slate-900">Database Connection Error</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">{error}</p>
          <button 
            onClick={loadSubscribers}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-400 uppercase tracking-wider">
                  <th className="p-4 font-bold">Email Address</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Joined Date</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSubscribers.length > 0 ? (
                  filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4 flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Mail className="size-4" />
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{sub.email}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                          Active
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {formatDate(sub.createdAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleDelete(sub.id, sub.email)}
                            className="size-8 rounded-lg hover:bg-rose-50 text-rose-600 grid place-items-center transition cursor-pointer"
                            title="Unsubscribe / Remove"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-16 text-slate-400 font-semibold">
                      {searchTerm ? "No subscriber matching search criteria." : "No active newsletter subscribers."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {subscribers.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-[11px] text-slate-400 font-bold">
              <span>Showing {filteredSubscribers.length} of {subscribers.length} total entries</span>
              <span>Atlas Connected</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
