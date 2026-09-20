"use client";

import { useEffect, useState } from "react";
import { Trash2, Clock, CheckCircle2, RefreshCw, XCircle, ShoppingBag, MapPin, Phone, Mail } from "lucide-react";

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

const STATUS_OPTIONS: { key: Order["orderStatus"]; label: string; icon: React.ElementType }[] = [
  { key: "waiting", label: "Waiting", icon: Clock },
  { key: "confirmed", label: "Confirm", icon: CheckCircle2 },
  { key: "processing", label: "On Process", icon: RefreshCw },
  { key: "cancelled", label: "Cancel", icon: XCircle },
];

const STATUS_STYLES: Record<Order["orderStatus"], string> = {
  waiting: "bg-surface-subtle text-steel border-line",
  confirmed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  processing: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  cancelled: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

export default function OrdersPage() {
  const [tab, setTab] = useState<"cart" | "ordered">("ordered");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async (status: "cart" | "ordered") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?status=${status}`);
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(tab);
  }, [tab]);

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

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto font-sans">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">Orders</h1>
        <p className="text-xs sm:text-sm text-steel mt-1">Track cart activity and completed customer orders.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-line pb-3">
        <button
          onClick={() => setTab("ordered")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            tab === "ordered"
              ? "bg-signal text-white shadow-sm"
              : "bg-surface-subtle text-steel hover:text-ink hover:bg-surface-card border border-line"
          }`}
        >
          Ordered
        </button>
        <button
          onClick={() => setTab("cart")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            tab === "cart"
              ? "bg-signal text-white shadow-sm"
              : "bg-surface-subtle text-steel hover:text-ink hover:bg-surface-card border border-line"
          }`}
        >
          Added to Cart
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center text-steel text-sm flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading records...
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-surface-subtle border border-line rounded-2xl">
          <ShoppingBag className="w-8 h-8 text-steel mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium text-ink">No {tab === "ordered" ? "orders" : "cart activity"} found.</p>
          <p className="text-xs text-steel mt-1">Check back later when customers perform actions.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-paper border border-line rounded-2xl p-4 sm:p-6 shadow-sm hover:border-line/80 transition-all">
              {/* Header Info */}
              <div className="flex justify-between items-start flex-wrap gap-3 pb-4 border-b border-line">
                <div>
                  {tab === "ordered" && o.customer?.fullName && (
                    <p className="font-semibold text-ink text-base">{o.customer.fullName}</p>
                  )}
                  {tab === "ordered" && (o.customer?.phone || o.customer?.email) && (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-steel mt-1">
                      {o.customer?.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {o.customer.phone}
                        </span>
                      )}
                      {o.customer?.email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {o.customer.email}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-[11px] text-steel font-mono-spec mt-1.5">
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="text-right flex items-center sm:flex-col justify-between sm:justify-start w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-line">
                  {o.total !== undefined && (
                    <p className="font-extrabold text-ink text-base sm:text-lg">
                      ৳{o.total.toLocaleString()}
                    </p>
                  )}
                  <button
                    onClick={() => handleDelete(o._id)}
                    className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 transition font-medium mt-1 p-1 hover:bg-rose-500/10 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="py-3 space-y-1.5">
                {o.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-ink font-medium">
                      {item.name} <span className="text-steel font-normal">× {item.quantity}</span>
                    </span>
                    <span className="text-steel font-mono-spec">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping & Address */}
              {tab === "ordered" && o.customer?.address && (
                <div className="border-t border-line pt-3 mt-1 text-xs sm:text-sm text-steel space-y-1 bg-surface-subtle/50 p-3 rounded-xl">
                  <p className="flex items-start gap-1.5 text-ink">
                    <MapPin className="w-3.5 h-3.5 text-steel mt-0.5 shrink-0" />
                    <span>
                      {o.customer.address}, <span className="font-medium">{o.customer.district}</span>
                    </span>
                  </p>
                  {o.shippingOption && (
                    <p className="text-xs text-steel pl-5">
                      Shipping: <span className="font-medium text-ink">{o.shippingOption}</span> (৳{o.shippingCost})
                    </p>
                  )}
                  {o.customer.notes && (
                    <p className="text-xs italic text-steel pl-5 mt-1">
                      Note: "{o.customer.notes}"
                    </p>
                  )}
                </div>
              )}

              {/* Status & Actions */}
              {tab === "ordered" && (
                <div className="border-t border-line mt-3 pt-3 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-steel uppercase tracking-wider">Status:</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[o.orderStatus || "waiting"]}`}>
                      {STATUS_OPTIONS.find((s) => s.key === (o.orderStatus || "waiting"))?.label}
                    </span>
                  </div>

                  <div className="flex gap-1.5 flex-wrap w-full sm:w-auto">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s.key}
                        disabled={updatingId === o._id || o.orderStatus === s.key}
                        onClick={() => handleStatusChange(o._id, s.key)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-line bg-surface-card hover:bg-surface-subtle text-ink font-medium disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-95 flex-1 sm:flex-initial"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}