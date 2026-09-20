"use client";
import { useEffect, useState } from "react";
import { generateReceiptPDF } from "@/lib/receipt";

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
  waiting: "bg-gray-100 text-gray-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
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
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Orders</h1>
      <p className="text-sm text-[--admin-steel] mb-6">Track cart activity and completed orders.</p>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("ordered")}
          className={tab === "ordered" ? "admin-btn-primary" : "admin-btn-secondary"}
        >
          Ordered
        </button>
        <button
          onClick={() => setTab("cart")}
          className={tab === "cart" ? "admin-btn-primary" : "admin-btn-secondary"}
        >
          Added to Cart
        </button>
      </div>

      {tab === "ordered" && !loading && orders.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${
              filter === "all" ? "bg-[--admin-ink] text-white" : "bg-[--admin-bg] text-[--admin-steel] hover:bg-gray-200"
            }`}
          >
            All ({orders.length})
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${
                filter === s.key ? STATUS_STYLES[s.key] + " ring-2 ring-offset-1 ring-[--admin-accent]" : STATUS_STYLES[s.key] + " opacity-60 hover:opacity-100"
              }`}
            >
              {s.label} ({countByStatus(s.key)})
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[--admin-steel]">Loading...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-sm text-[--admin-steel]">
          {filter === "all"
            ? `No ${tab === "ordered" ? "orders" : "cart activity"} yet.`
            : `No orders with status "${STATUS_OPTIONS.find((s) => s.key === filter)?.label}".`}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredOrders.map((o) => (
            <div key={o._id} className="admin-card p-5">
              <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                <div>
                  {tab === "ordered" && o.customer?.fullName && (
                    <p className="font-semibold">{o.customer.fullName}</p>
                  )}
                  {tab === "ordered" && o.customer?.phone && (
                    <p className="text-sm text-[--admin-steel]">{o.customer.phone} · {o.customer.email}</p>
                  )}
                  <p className="text-xs text-[--admin-steel] mt-1">
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  {o.total !== undefined && <p className="font-bold">৳{o.total.toLocaleString()}</p>}
                  <div className="flex gap-3">
                    {tab === "ordered" && o.orderStatus === "confirmed" && (
                      <button onClick={() => generateReceiptPDF(o)} className="admin-link-edit">Download Receipt</button>
                    )}
                    <button onClick={() => handleDelete(o._id)} className="admin-link-danger">Delete</button>
                  </div>
                </div>
              </div>

              <div className="border-t border-[--admin-line] pt-3 space-y-1">
                {o.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="text-[--admin-steel]">৳{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {tab === "ordered" && o.customer?.address && (
                <div className="border-t border-[--admin-line] mt-3 pt-3 text-sm text-[--admin-steel]">
                  <p>{o.customer.address}, {o.customer.district}</p>
                  {o.shippingOption && <p>Shipping: {o.shippingOption} (৳{o.shippingCost})</p>}
                  {o.customer.notes && <p className="mt-1 italic">Note: {o.customer.notes}</p>}
                </div>
              )}

              {tab === "ordered" && o.orderStatus === "confirmed" && (
                <div className="border-t border-[--admin-line] mt-3 pt-3 flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[o.orderStatus || "waiting"]}`}>
                    {STATUS_OPTIONS.find((s) => s.key === (o.orderStatus || "waiting"))?.label}
                  </span>
                  <div className="flex gap-1.5 ml-auto">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s.key}
                        disabled={updatingId === o._id || o.orderStatus === s.key}
                        onClick={() => handleStatusChange(o._id, s.key)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-[--admin-line] hover:bg-[--admin-bg] disabled:opacity-40 disabled:cursor-not-allowed transition"
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
