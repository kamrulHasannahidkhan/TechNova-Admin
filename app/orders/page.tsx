"use client";
import { useEffect, useState } from "react";

type OrderItem = { name: string; price: number; quantity: number };
type Order = {
  _id: string;
  status: "cart" | "ordered";
  items: OrderItem[];
  customer?: { fullName?: string; phone?: string; email?: string; address?: string; district?: string; notes?: string };
  shippingOption?: string;
  shippingCost?: number;
  subtotal?: number;
  total?: number;
  createdAt: string;
};

export default function OrdersPage() {
  const [tab, setTab] = useState<"cart" | "ordered">("ordered");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (status: "cart" | "ordered") => {
    setLoading(true);
    const res = await fetch(`/api/orders?status=${status}`);
    setOrders(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(tab); }, [tab]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    load(tab);
  };

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

      {loading ? (
        <p className="text-sm text-[--admin-steel]">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-[--admin-steel]">No {tab === "ordered" ? "orders" : "cart activity"} yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <div key={o._id} className="admin-card p-5">
              <div className="flex justify-between items-start mb-3">
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
                <div className="text-right">
                  {o.total !== undefined && <p className="font-bold">৳{o.total.toLocaleString()}</p>}
                  <button onClick={() => handleDelete(o._id)} className="admin-link-danger mt-1">Delete</button>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
