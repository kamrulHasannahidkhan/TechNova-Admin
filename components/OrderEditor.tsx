"use client";
import { useState } from "react";

type Item = { productId?: string; name: string; price: number; quantity: number };

export default function OrderEditor({
  order,
  onSaved,
}: {
  order: { _id: string; items: Item[]; shippingCost?: number };
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [prices, setPrices] = useState<string[]>([]);
  const [delivery, setDelivery] = useState("");
  const [saving, setSaving] = useState(false);

  const openEditor = () => {
    setPrices(order.items.map((i) => String(i.price)));
    setDelivery(String(order.shippingCost ?? 0));
    setOpen(true);
  };

  const subtotal = order.items.reduce(
    (sum, item, i) => sum + (Number(prices[i]) || 0) * item.quantity,
    0
  );
  const shipping = Number(delivery) || 0;
  const total = subtotal + shipping;

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/orders/${order._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: order.items.map((item, i) => ({
          productId: item.productId,
          name: item.name,
          price: Number(prices[i]) || 0,
          quantity: item.quantity,
        })),
        shippingCost: shipping,
        subtotal,
        total,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      alert("Could not save changes. Please try again.");
      return;
    }
    setOpen(false);
    onSaved();
  };

  return (
    <>
      <button type="button" onClick={openEditor} className="admin-link-edit">
        Edit Price
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="admin-card w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold mb-1">Edit order prices</h3>
            <p className="text-xs text-[--admin-steel] mb-4">
              Changes apply to this order and its receipt only, not to the product.
            </p>

            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="text-sm min-w-0">
                    <p className="truncate">{item.name}</p>
                    <p className="text-xs text-[--admin-steel]">Quantity: {item.quantity}</p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    className="admin-input w-28 shrink-0"
                    value={prices[i] ?? ""}
                    onChange={(e) => {
                      const next = [...prices];
                      next[i] = e.target.value;
                      setPrices(next);
                    }}
                  />
                </div>
              ))}

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[--admin-line]">
                <span className="text-sm font-medium">Delivery charge</span>
                <input
                  type="number"
                  min={0}
                  className="admin-input w-28 shrink-0"
                  value={delivery}
                  onChange={(e) => setDelivery(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[--admin-line] text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-[--admin-steel]">Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>৳{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button type="button" disabled={saving} onClick={save} className="admin-btn-primary">
                {saving ? "Saving..." : "Save"}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="admin-btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
