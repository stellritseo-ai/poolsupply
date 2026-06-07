import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useOrders } from "@/lib/orders";
import { updateOrderStatusDb, deleteOrderDb, seedMockOrdersDb } from "@/lib/api/orders.functions";
import { formatUSD } from "@/components/site/cart-context";
import { 
  Search, 
  Eye, 
  Trash2, 
  ChevronRight, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersManager,
});

type OrderItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  qty: number;
};

type Order = {
  id: string;
  placedAt: string;
  email: string;
  name: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status?: "Pending" | "Shipped" | "Delivered" | "Cancelled";
  method: string;
};

const MOCK_ORDERS: Order[] = [
  {
    id: "AQ-748B",
    placedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    email: "james.t@gmail.com",
    name: "James Thompson",
    address: { line1: "123 Maple St", city: "Franklin", state: "TN", zip: "37064", country: "United States" },
    items: [{ id: "p-intelliflo", name: "Variable-Speed IntelliFlo Pump", brand: "Pentair", price: 1289, qty: 1 }],
    subtotal: 1289,
    shipping: 0,
    tax: 112.78,
    total: 1401.78,
    status: "Delivered",
    method: "standard"
  },
  {
    id: "AQ-923D",
    placedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    email: "d.miller@millerpools.com",
    name: "David Miller",
    address: { line1: "456 Oak Ave", city: "Los Angeles", state: "CA", zip: "90001", country: "United States" },
    items: [{ id: "p-raypak-400k", name: "Digital Pool Heater Pro 400K", brand: "Raypak", price: 2499, qty: 1 }],
    subtotal: 2499,
    shipping: 0,
    tax: 218.66,
    total: 2717.66,
    status: "Shipped",
    method: "standard"
  },
  {
    id: "AQ-551E",
    placedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    email: "s.jenkins@gmail.com",
    name: "Sarah Jenkins",
    address: { line1: "789 Pine Rd", city: "Austin", state: "TX", zip: "78701", country: "United States" },
    items: [{ id: "p-colorlogic", name: "ColorLogic LED Pool Light", brand: "Hayward", price: 349, qty: 2 }],
    subtotal: 698,
    shipping: 0,
    tax: 61.07,
    total: 759.07,
    status: "Pending",
    method: "standard"
  }
];

function OrdersManager() {
  const { orders: dbOrders, isLoading, refetch } = useOrders();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Seed on empty, auto-select first order
  useEffect(() => {
    if (!isLoading) {
      if (dbOrders.length === 0) {
        seedMockOrdersDb({ data: MOCK_ORDERS }).then(() => refetch());
      } else if (!selectedOrder) {
        setSelectedOrder(dbOrders[0]);
      } else {
        // Update selected order if data changes
        const updatedSelected = dbOrders.find(o => o.id === selectedOrder.id);
        if (updatedSelected) setSelectedOrder(updatedSelected);
      }
    }
  }, [dbOrders, isLoading]);

  // Update status in DB
  const updateStatus = async (id: string, nextStatus: Order["status"]) => {
    // Optimistic UI update
    if (selectedOrder?.id === id) {
      setSelectedOrder({ ...selectedOrder, status: nextStatus });
    }
    
    await updateOrderStatusDb({ data: { id, status: nextStatus! } });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  // Delete/Cancel order
  const deleteOrder = async (id: string) => {
    const updated = dbOrders.filter(o => o.id !== id);
    if (selectedOrder?.id === id) {
      setSelectedOrder(updated.length > 0 ? updated[0] : null);
    }

    await deleteOrderDb({ data: { id } });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return dbOrders.filter(o => {
      const matchSearch = o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [dbOrders, searchTerm, statusFilter]);

  // Status Styling Helper
  const getStatusStyle = (status: Order["status"]) => {
    switch (status) {
      case "Pending": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Shipped": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Delivered": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Cancelled": return "bg-slate-100 text-slate-600 border-slate-300";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "Pending": return Clock;
      case "Shipped": return Truck;
      case "Delivered": return CheckCircle;
      case "Cancelled": return XCircle;
      default: return AlertCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Logs</h1>
        <p className="text-slate-500 text-sm mt-1">Review shipments, client invoicing details, and status updates.</p>
      </div>

      {/* Toolbar */}
      <div className="grid sm:grid-cols-[1fr_200px] gap-4 bg-white border border-slate-200/60 p-4 rounded-[2rem] shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID, customer, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 h-11 border border-slate-200 bg-slate-50 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white transition-all"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold focus:outline-none focus:border-primary focus:bg-white cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6 items-start">
        {/* Left Side: Orders List */}
        <div className="bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-400 uppercase tracking-wider">
                  <th className="p-4 font-bold">Order ID</th>
                  <th className="p-4 font-bold">Customer</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold text-right">Total</th>
                  <th className="p-4 font-bold text-center">Status</th>
                  <th className="p-4 font-bold text-center">Select</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((o) => {
                    const StatusIcon = getStatusIcon(o.status);
                    return (
                      <tr 
                        key={o.id} 
                        className={`transition-colors cursor-pointer group ${
                          selectedOrder?.id === o.id ? "bg-primary/[0.03] border-l-[3px] border-l-primary" : "hover:bg-slate-50/50 border-l-[3px] border-l-transparent"
                        }`}
                        onClick={() => setSelectedOrder(o)}
                      >
                        <td className="p-4 font-bold text-slate-900 font-mono group-hover:text-primary transition-colors">{o.id}</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{o.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{o.email}</div>
                        </td>
                        <td className="p-4 text-slate-500">
                          {new Date(o.placedAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right font-bold text-slate-900">
                          {formatUSD(o.total)}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(o.status)}`}>
                            <StatusIcon className="size-3" />
                            {o.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button className="size-8 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-800 grid place-items-center mx-auto transition">
                            <ChevronRight className="size-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold">
                      No orders matching search or status filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Order Detail Panel */}
        <aside className="lg:sticky lg:top-28">
          <AnimatePresence mode="wait">
            {selectedOrder ? (
              <motion.div
                key={selectedOrder.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Order Invoice</span>
                    <h3 className="font-extrabold text-base text-slate-900 font-mono mt-0.5">{selectedOrder.id}</h3>
                  </div>
                  <button
                    onClick={() => deleteOrder(selectedOrder.id)}
                    className="size-9 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 grid place-items-center text-slate-400 transition"
                    title="Remove Order Record"
                  >
                    <Trash2 className="size-4.5" />
                  </button>
                </div>

                {/* Status Trigger */}
                <div className="space-y-2.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Shipment Status</span>
                  <div className="grid grid-cols-2 gap-2">
                    {["Pending", "Shipped", "Delivered", "Cancelled"].map((status) => {
                      const active = selectedOrder.status === status;
                      return (
                        <button
                          key={status}
                          onClick={() => updateStatus(selectedOrder.id, status as any)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all active:scale-[0.98] ${
                            active
                              ? "bg-slate-900 border-slate-900 text-white shadow-[0_4px_12px_rgba(15,23,42,0.15)]"
                              : "bg-surface border-slate-200/60 hover:bg-slate-100/70 text-slate-600"
                          }`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Contact and Address */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="flex gap-3">
                    <div className="size-9 rounded-xl bg-slate-100 text-slate-500 grid place-items-center shrink-0">
                      <Calendar className="size-4.5" />
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Order Placed</span>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">
                        {selectedOrder.placedAt ? new Date(selectedOrder.placedAt).toLocaleString() : "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="size-9 rounded-xl bg-slate-100 text-slate-500 grid place-items-center shrink-0">
                      <Mail className="size-4.5" />
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Customer Email</span>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedOrder.email || "No email"}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="size-9 rounded-xl bg-slate-100 text-slate-500 grid place-items-center shrink-0">
                      <MapPin className="size-4.5" />
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Shipping Address</span>
                      <p className="text-xs font-bold text-slate-800 mt-0.5 leading-relaxed">
                        {selectedOrder.name || "Unknown Customer"}<br />
                        {selectedOrder.address?.line1 || "No street address"}<br />
                        {selectedOrder.address?.line2 && <>{selectedOrder.address.line2}<br /></>}
                        {selectedOrder.address?.city && <>{selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.zip}</>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Ordered Equipment</span>
                  <ul className="divide-y divide-slate-100 bg-slate-50/50 border border-slate-150/60 rounded-2xl p-2.5 space-y-2 max-h-48 overflow-y-auto">
                    {selectedOrder.items?.map((item) => (
                      <li key={item.id} className="flex justify-between items-center text-xs py-1.5 first:pt-0 last:pb-0">
                        <div className="pr-4">
                          <div className="font-bold text-slate-900 truncate max-w-[200px]">{item.name}</div>
                          <div className="text-[10px] text-slate-400">{item.brand} (Qty: {item.qty})</div>
                        </div>
                        <span className="font-bold text-slate-900 shrink-0">{formatUSD(item.price * item.qty)}</span>
                      </li>
                    )) || <div className="text-slate-400 text-center py-2">No items listed</div>}
                  </ul>
                </div>

                {/* Totals */}
                <div className="space-y-2 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-slate-800">{formatUSD(selectedOrder.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-slate-800">{selectedOrder.shipping === 0 ? "Free" : formatUSD(selectedOrder.shipping || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Tax</span>
                    <span className="text-slate-800">{formatUSD(selectedOrder.tax || 0)}</span>
                  </div>
                  <div className="h-px bg-slate-100 my-1" />
                  <div className="flex justify-between text-sm font-black text-slate-900">
                    <span>Total Invoice</span>
                    <span>{formatUSD(selectedOrder.total || 0)}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-surface border border-dashed border-slate-200 rounded-[2rem] p-12 text-center text-slate-400 font-semibold text-xs shadow-sm">
                Select an order from the list to manage and update status.
              </div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}
