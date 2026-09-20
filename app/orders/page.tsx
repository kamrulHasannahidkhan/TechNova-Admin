"use client";

import { useEffect, useState } from "react";
import { generateReceiptPDF } from "@/lib/receipt";
import {
  Trash2,
  Clock,
  RefreshCw,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  Filter,
  Download,
  User,
  PackageCheck,
  FileText,
} from "lucide-react";

type OrderItem = { name: string; price: number; quantity: number };
type Order = {
  _id: string;
  status: "cart" | "ordered";
  orderStatus: "waiting" | "confirmed" | "processing" | "cancelled";
  items: OrderItem[];
  customer?: { fullName?: string; phone?: string; email?: string; address?: string; district?: string; notes?: string };
  shippingOption?: string;
  shippingCost?: number;
  subtotal?: number;
  total?: number;
  createdAt: string;
};

const STATUS_OPTIONS: { key: Order["orderStatus"]; label: string }[] = [
  { key: "waiting", label: "Waiting" },
  { key: "confirmed", label: "Confirm" },
  { key: "processing", label: "On Process" },
  { key: "cancelled", label: "Cancel" },
];

const STATUS_STYLES: Record<Order["orderStatus"], string> = {
  waiting: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function OrdersPage() {
  const [tab, setTab] = useState<"cart" | "ordered">("ordered");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Order["orderStatus"]>("all");

  const load = async (status: "cart" | "ordered") => {
    setLoading(true);
    const res = await fetch(`/api/orders?status=${status}`);
    setOrders(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(tab); setFilter("all"); }, [tab]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    load(tab);
  };

  const handleStatusChange = async (id: string, orderStatus: Order["orderStatus"]) => {
    setUpdatingId(id);
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus }),
    });
    setUpdatingId(null);
    load(tab);
  };

  const filteredOrders = tab === "ordered" && filter !== "all"
    ? orders.filter((o) => (o.orderStatus || "waiting") === filter)
    : orders;

  const countByStatus = (key: Order["orderStatus"]) =>
    orders.filter((o) => (o.orderStatus || "waiting") === key).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto font-sans">
      {/* Top Header & Compact Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Orders Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track cart activity, manage fulfillment, and generate invoices.</p>
        </div>

        {/* Compact Switcher */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setTab("ordered")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === "ordered"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Ordered ({tab === "ordered" ? orders.length : "..."})
          </button>
          <button
            onClick={() => setTab("cart")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === "cart"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Cart Activity
          </button>
        </div>
      </div>

      {/* Low-Profile Status Filter Bar */}
      {tab === "ordered" && !loading && orders.length > 0 && (
        <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1 text-xs">
          <span className="font-semibold text-slate-400 flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
              filter === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
            }`}
          >
            All ({orders.length})
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`px-2.5 py-1 rounded-lg border font-medium transition-all shrink-0 ${
                filter === s.key
                  ? STATUS_STYLES[s.key] + " ring-1 ring-slate-900/10 font-semibold"
                  : STATUS_STYLES[s.key] + " opacity-65 hover:opacity-100"
              }`}
            >
              {s.label} ({countByStatus(s.key)})
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-slate-400" /> Loading orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-12 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
          <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">
            {filter === "all"
              ? `No ${tab === "ordered" ? "orders" : "cart activity"} found.`
              : `No orders marked as "${STATUS_OPTIONS.find((s) => s.key === filter)?.label}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((o) => (
            <div
              key={o._id}
              className="bg-white border border-slate-200/90 rounded-xl p-3.5 lg:p-4 shadow-sm hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              {/* Left Column: Customer & Delivery Info */}
              <div className="lg:w-1/3 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900 text-sm">
                    {o.customer?.fullName || "Guest Customer"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5">
                    <Clock className="w-3 h-3" /> {new Date(o.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {tab === "ordered" && o.customer && (
                  <div className="text-xs text-slate-500 space-y-0.5">
                    {(o.customer.phone || o.customer.email) && (
                      <div className="flex items-center gap-3 text-[11px] text-slate-600">
                        {o.customer.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {o.customer.phone}
                          </span>
                        )}
                        {o.customer.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" /> {o.customer.email}
                          </span>
                        )}
                      </div>
                    )}
                    {o.customer.address && (
                      <p className="flex items-start gap-1 text-[11px] text-slate-600 pt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">
                          {o.customer.address}, <strong className="font-medium text-slate-800">{o.customer.district}</strong>
                        </span>
                      </p>
                    )}
                    {o.customer.notes && (
                      <p className="text-[11px] italic text-amber-700 bg-amber-50/50 px-2 py-0.5 rounded border border-amber-200/50 w-fit">
                        Note: "{o.customer.notes}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Middle Column: Items Summary */}
              <div className="lg:w-1/3 bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
                <div className="max-h-20 overflow-y-auto space-y-1 pr-1">
                  {o.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-slate-800 font-medium truncate pr-2">
                        {item.name} <span className="text-slate-400 font-normal">×{item.quantity}</span>
                      </span>
                      <span className="text-slate-500 font-mono text-[11px] shrink-0">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                {o.shippingOption && (
                  <div className="mt-1 pt-1 border-t border-slate-200/60 flex justify-between text-[11px] text-slate-500">
                    <span>Shipping: {o.shippingOption}</span>
                    <span className="font-mono">৳{o.shippingCost}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Pricing, Status Badges & Actions */}
              <div className="lg:w-1/3 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="text-left sm:text-right lg:text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Amount</p>
                    <p className="font-mono font-bold text-slate-900 text-base">
                      ৳{o.total !== undefined ? o.total.toLocaleString() : "0"}
                    </p>
                  </div>

                  {tab === "ordered" && (
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        STATUS_STYLES[o.orderStatus || "waiting"]
                      }`}
                    >
                      {STATUS_OPTIONS.find((s) => s.key === (o.orderStatus || "waiting"))?.label}
                    </span>
                  )}
                </div>

                {/* Status Switcher & Action Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto justify-end">
                  {tab === "ordered" && (
                    <div className="flex gap-1">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s.key}
                          disabled={updatingId === o._id || o.orderStatus === s.key}
                          onClick={() => handleStatusChange(o._id, s.key)}
                          className={`text-[11px] px-2 py-1 rounded border transition font-medium ${
                            o.orderStatus === s.key
                              ? "bg-slate-900 text-white border-slate-900 font-bold cursor-default"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                          } disabled:opacity-50`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-1 border-l border-slate-200 ml-1 pl-1">
                    {tab === "ordered" && o.orderStatus === "confirmed" && (
                      <button
                        onClick={() => generateReceiptPDF(o)}
                        title="Download Receipt PDF"
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(o._id)}
                      title="Delete Record"
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}