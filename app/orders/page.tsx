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
  waiting:
    "bg-gray-100 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300 border-gray-200 dark:border-gray-700",
  confirmed:
    "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
  processing:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
  cancelled:
    "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/50",
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
    <div className="p-4 sm:p-8 max-w-6xl mx-auto transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Orders
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Track cart activity and completed orders.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 dark:bg-[#0a192f] p-1 rounded-2xl border border-gray-200/80 dark:border-gray-800 self-start sm:self-auto">
          <button
            onClick={() => setTab("ordered")}
            className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
              tab === "ordered"
                ? "bg-white dark:bg-[#112240] text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Ordered
          </button>
          <button
            onClick={() => setTab("cart")}
            className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
              tab === "cart"
                ? "bg-white dark:bg-[#112240] text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Added to Cart
          </button>
        </div>
      </div>

      {/* Filter Badges */}
      {tab === "ordered" && !loading && orders.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap items-center">
          <button
            onClick={() => setFilter("all")}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 border ${
              filter === "all"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20"
                : "bg-white dark:bg-[#112240] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#0a192f]"
            }`}
          >
            All ({orders.length})
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-200 ${
                STATUS_STYLES[s.key]
              } ${
                filter === s.key
                  ? "ring-2 ring-blue-600 dark:ring-blue-500 ring-offset-2 dark:ring-offset-[#0a192f] font-bold scale-[1.02]"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              {s.label} ({countByStatus(s.key)})
            </button>
          ))}
        </div>
      )}

      {/* Loading & Empty States */}
      {loading ? (
        <div className="bg-white dark:bg-[#112240] border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center shadow-xl shadow-gray-200/50 dark:shadow-2xl">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
            Fetching order history...
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-[#112240] border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center shadow-xl shadow-gray-200/50 dark:shadow-2xl">
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
            {filter === "all"
              ? `No ${tab === "ordered" ? "orders" : "cart activity"} yet.`
              : `No orders with status "${
                  STATUS_OPTIONS.find((s) => s.key === filter)?.label
                }".`}
          </p>
        </div>
      ) : (
        <>
          {/* Action Bar */}
          <div className="flex items-center justify-between mb-4 px-2">
            <label className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-600/30 accent-blue-600"
              />
              Select all ({filteredOrders.length})
            </label>
            {selected.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={deleting}
                className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <span>{deleting ? "Deleting..." : `Delete Selected (${selected.size})`}</span>
              </button>
            )}
          </div>

          {/* Orders List */}
          <div className="flex flex-col gap-4">
            {filteredOrders.map((o) => (
              <div
                key={o._id}
                className={`bg-white dark:bg-[#112240] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 sm:p-6 shadow-xl shadow-gray-200/50 dark:shadow-2xl transition-all duration-200 flex gap-4 ${
                  selected.has(o._id) ? "ring-2 ring-blue-600/50 border-transparent" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(o._id)}
                  onChange={() => toggleSelectOne(o._id)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-600/30 accent-blue-600 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  {/* Top Bar: Customer Info & Total/Actions */}
                  <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
                    <div>
                      {tab === "ordered" && o.customer?.fullName && (
                        <p className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                          {o.customer.fullName}
                        </p>
                      )}
                      {tab === "ordered" && o.customer?.phone && (
                        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                          {o.customer.phone} {o.customer.email ? `· ${o.customer.email}` : ""}
                        </p>
                      )}
                      <p className="text-[11px] sm:text-xs font-semibold text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(o.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1.5">
                      {o.total !== undefined && (
                        <p className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-gray-100">
                          ৳{o.total.toLocaleString()}
                        </p>
                      )}
                      <div className="flex gap-3 text-xs font-semibold">
                        {tab === "ordered" && o.orderStatus === "confirmed" && (
                          <button
                            onClick={() => generateReceiptPDF(o)}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Download Receipt
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(o._id)}
                          className="text-red-600 dark:text-red-400 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="border-t border-gray-100 dark:border-gray-800/80 pt-3 space-y-2">
                    {o.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs sm:text-sm">
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {item.name}{" "}
                          <span className="text-gray-400 dark:text-gray-500 font-normal">
                            × {item.quantity}
                          </span>
                        </span>
                        <span className="font-semibold text-gray-500 dark:text-gray-400">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Address & Shipping Details */}
                  {tab === "ordered" && o.customer?.address && (
                    <div className="border-t border-gray-100 dark:border-gray-800/80 mt-3 pt-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-y-0.5">
                      <p>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Address:</span>{" "}
                        {o.customer.address}, {o.customer.district}
                      </p>
                      {o.shippingOption && (
                        <p>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Shipping:</span>{" "}
                          {o.shippingOption} (৳{o.shippingCost})
                        </p>
                      )}
                      {o.customer.notes && (
                        <p className="italic text-gray-400 dark:text-gray-500 pt-0.5">
                          Note: {o.customer.notes}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Order Status Control */}
                  {tab === "ordered" && (
                    <div className="border-t border-gray-100 dark:border-gray-800/80 mt-4 pt-3 flex items-center justify-between gap-3 flex-wrap">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                          STATUS_STYLES[o.orderStatus || "waiting"]
                        }`}
                      >
                        {
                          STATUS_OPTIONS.find(
                            (s) => s.key === (o.orderStatus || "waiting")
                          )?.label
                        }
                      </span>

                      <div className="flex gap-1.5 flex-wrap ml-auto">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s.key}
                            disabled={
                              updatingId === o._id || o.orderStatus === s.key
                            }
                            onClick={() => handleStatusChange(o._id, s.key)}
                            className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-gray-50/50 dark:bg-[#0a192f] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#112240] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition duration-200 font-medium"
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