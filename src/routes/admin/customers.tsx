import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Mail, 
  Phone,
  ShoppingBag,
  DollarSign,
  Package,
  Calendar,
  Loader2,
  ChevronRight,
  User
} from "lucide-react";
import { getAdminCustomers } from "@/lib/api/customers.functions";

export const Route = createFileRoute("/admin/customers")({
  component: CustomersAdmin,
});

function CustomersAdmin() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchCustomers() {
      const res = await getAdminCustomers();
      if (res.success && res.customers) {
        setCustomers(res.customers);
      }
      setLoading(false);
    }
    fetchCustomers();
  }, []);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    (c.phone && c.phone.includes(search))
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="size-8 text-primary" />
            Customer Directory
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Track and manage registered store customers and their lifetime value.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-primary transition shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary mb-4" />
            <p className="text-sm font-medium text-slate-500">Loading customers...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <Users className="size-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No customers found</h3>
            <p className="text-sm text-slate-500">There are no customers matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="p-4 sm:px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">Customer Info</th>
                  <th className="p-4 sm:px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">Contact</th>
                  <th className="p-4 sm:px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap text-center">Orders</th>
                  <th className="p-4 sm:px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap text-center">Items</th>
                  <th className="p-4 sm:px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap text-right">Lifetime Value</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((customer, index) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      key={customer.id} 
                      className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Customer Info */}
                      <td className="p-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center shrink-0 border border-primary/10">
                            <span className="text-primary font-black text-sm uppercase">
                              {customer.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm whitespace-nowrap">{customer.name}</div>
                            <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="size-3" /> Joined {new Date(customer.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4 sm:px-6">
                        <div className="space-y-1.5">
                          {customer.email && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Mail className="size-3.5 text-slate-400" />
                              <a href={`mailto:${customer.email}`} className="hover:text-primary transition-colors">{customer.email}</a>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Phone className="size-3.5 text-slate-400" />
                              <a href={`tel:${customer.phone}`} className="hover:text-primary transition-colors">{customer.phone}</a>
                            </div>
                          )}
                          {!customer.email && !customer.phone && (
                            <span className="text-xs text-slate-400 italic">No contact provided</span>
                          )}
                        </div>
                      </td>

                      {/* Orders */}
                      <td className="p-4 sm:px-6 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold min-w-[3rem]">
                          <ShoppingBag className="size-3" /> {customer.totalOrders}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="p-4 sm:px-6 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold min-w-[3rem]">
                          <Package className="size-3" /> {customer.totalProductsPurchased}
                        </div>
                      </td>

                      {/* Lifetime Value */}
                      <td className="p-4 sm:px-6 text-right">
                        <div className="text-sm font-black text-emerald-600 flex items-center justify-end gap-1">
                          <DollarSign className="size-3.5" />
                          {customer.totalSpent.toFixed(2)}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
