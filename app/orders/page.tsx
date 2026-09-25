"use client";
import { useEffect, useState } from "react";
import { generateReceiptPDF } from "@/lib/receipt";

type OrderItem = { name: string; price: number; quantity: number };
type Order = {
  _id: string;
  status: "cart" | "ordered";
  orderStatus: "waiting" | "confirmed" | "processing" | "cancelled";
  items: OrderItem[];
  customer?: {
    fullName?: string;
    phone?: string;
    email?: string;
    address?: string;
    district?: string;
    notes?: string;
  };
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
  waiting: "bg-slate-100 text-slate-700 border-slate-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  processing: "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function OrdersPage() {
  const [tab, setTab] = useState<"cart" | "ordered">("ordered");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Order["orderStatus"]>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const load = async (status: "cart" | "ordered") => {
    setLoading(true);
    const res = await fetch(`/api/orders?status=${status}`);
    setOrders(await res.json());
    setLoading(false);
    setSelected(new Set());
  };

  useEffect(() => {
    load(tab);
    setFilter("all");
  }, [tab]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    load(tab);
  };

  const handleStatusChange = async (
    id: string,
    orderStatus: Order["orderStatus"]
  ) => {
    setUpdatingId(id);
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus }),
    });
    setUpdatingId(null);
    load(tab);
  };

  const filteredOrders =
    tab === "ordered" && filter !== "all"
      ? orders.filter((o) => (o.orderStatus || "waiting") === filter)
      : orders;

  const countByStatus = (key: Order["orderStatus"]) =>
    orders.filter((o) => (o.orderStatus || "waiting") === key).length;

  const allVisibleSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((o) => selected.has(o._id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredOrders.map((o) => o._id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selected.size === 0) return;
    if (
      !confirm(
        `Delete ${selected.size} selected record${
          selected.size > 1 ? "s" : ""
        }? This cannot be undone.`
      )
    )
      return;
    setDeleting(true);
    await Promise.all(
      Array.from(selected).map((id) =>
        fetch(`/api/orders/${id}`, { method: "DELETE" })
      )
    );
    setDeleting(false);
    load(tab);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Orders Management
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Track cart activity and order statuses efficiently.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100/80 p-0.5 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => setTab("ordered")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === "ordered"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Ordered ({orders.length})
          </button>
          <button
            onClick={() => setTab("cart")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === "cart"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Added to Cart
          </button>
        </div>
      </div>

      {/* Compact Filter Badges */}
      {tab === "ordered" && !loading && orders.length > 0 && (
        <div className="flex gap-1.5 mb-4 flex-wrap items-center">
          <button
            onClick={() => setFilter("all")}
            className={`text-[11px] font-semibold px-3 py-1 rounded-full border transition ${
              filter === "all"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            All ({orders.length})
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`text-[11px] font-semibold px-3 py-1 rounded-full border transition ${
                STATUS_STYLES[s.key]
              } ${
                filter === s.key
                  ? "ring-2 ring-blue-500 ring-offset-1 font-bold"
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              {s.label} ({countByStatus(s.key)})
            </button>
          ))}
        </div>
      )}

      {/* Loading & Empty States */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-500">Loading data...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-8 text-center">
          <p className="text-xs font-medium text-slate-500">
            {filter === "all"
              ? `No ${tab === "ordered" ? "orders" : "cart activity"} found.`
              : `No orders in "${
                  STATUS_OPTIONS.find((s) => s.key === filter)?.label
                }".`}
          </p>
        </div>
      ) : (
        <>
          {/* Action Bar */}
          <div className="flex items-center justify-between mb-3 px-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAll}
                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
              />
              Select all ({filteredOrders.length})
            </label>
            {selected.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={deleting}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : `Delete Selected (${selected.size})`}
              </button>
            )}
          </div>

          {/* Compact Orders List */}
          <div className="flex flex-col gap-2.5">
            {filteredOrders.map((o) => (
              <div
                key={o._id}
                className={`bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-3.5 sm:p-4 shadow-sm hover:shadow transition-all duration-150 flex gap-3 ${
                  selected.has(o._id) ? "ring-2 ring-blue-500/40 border-blue-400" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(o._id)}
                  onChange={() => toggleSelectOne(o._id)}
                  className="mt-1 w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  {/* Top Bar: Compact Customer Details & Price */}
                  <div className="flex justify-between items-center gap-2 mb-2 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {tab === "ordered" && o.customer?.fullName && (
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {o.customer.fullName}
                        </span>
                      )}
                      {tab === "ordered" && o.customer?.phone && (
                        <span className="text-xs text-slate-500 font-medium">
                          • {o.customer.phone}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        ({new Date(o.createdAt).toLocaleDateString()}{" "}
                        {new Date(o.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        )
                      </span>
                    </div>

                    <div className="flex items-center gap-3 ml-auto shrink-0">
                      {o.total !== undefined && (
                        <span className="text-sm sm:text-base font-extrabold text-slate-900">
                          ৳{o.total.toLocaleString()}
                        </span>
                      )}
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        {tab === "ordered" && o.orderStatus === "confirmed" && (
                          <button
                            onClick={() => generateReceiptPDF(o)}
                            className="text-blue-600 hover:text-blue-700 underline text-[11px]"
                          >
                            Receipt
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(o._id)}
                          className="text-rose-600 hover:text-rose-700 text-[11px]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Inline/Compact Items List */}
                  <div className="bg-slate-50/70 rounded-xl p-2 border border-slate-100 flex flex-wrap gap-2 text-xs">
                    {o.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-md border border-slate-200/60 shadow-2xs"
                      >
                        <span className="font-medium text-slate-800">
                          {item.name}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          ×{item.quantity}
                        </span>
                        <span className="font-semibold text-slate-600 text-[11px]">
                          (৳{(item.price * item.quantity).toLocaleString()})
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Address & Shipping (Compact Row) */}
                  {tab === "ordered" && o.customer?.address && (
                    <div className="mt-2 text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-0.5 items-center">
                      <p>
                        <strong className="text-slate-700">Addr:</strong>{" "}
                        {o.customer.address}, {o.customer.district}
                      </p>
                      {o.shippingOption && (
                        <p>
                          <strong className="text-slate-700">Shipping:</strong>{" "}
                          {o.shippingOption} (৳{o.shippingCost})
                        </p>
                      )}
                      {o.customer.notes && (
                        <p className="italic text-slate-400">
                          Note: {o.customer.notes}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Order Status & Actions */}
                  {tab === "ordered" && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-slate-400">
                          Status:
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                            STATUS_STYLES[o.orderStatus || "waiting"]
                          }`}
                        >
                          {
                            STATUS_OPTIONS.find(
                              (s) => s.key === (o.orderStatus || "waiting")
                            )?.label
                          }
                        </span>
                      </div>

                      <div className="flex gap-1 flex-wrap ml-auto">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s.key}
                            disabled={
                              updatingId === o._id || o.orderStatus === s.key
                            }
                            onClick={() => handleStatusChange(o._id, s.key)}
                            className="text-[11px] px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:bg-slate-100 transition font-medium"
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}