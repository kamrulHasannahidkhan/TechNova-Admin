"use client";
import { useState } from "react";
import { generateAdminReceiptPDF } from "@/lib/adminReceipt";

type AdminOrder = Parameters<typeof generateAdminReceiptPDF>[0];

export default function AdminReceiptButton({ order }: { order: AdminOrder }) {
  const [open, setOpen] = useState(false);
  const [deduct, setDeduct] = useState("");

  const itemsSum = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = order.total ?? itemsSum + (order.shippingCost || 0);
  const off = Math.min(Math.max(Number(deduct) || 0, 0), total);

  const download = () => {
    generateAdminReceiptPDF(order, off);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setDeduct("");
          setOpen(true);
        }}
        className="text-[11px] font-medium text-blue-600 hover:text-blue-700 underline underline-offset-2"
      >
        Admin Receipt
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="admin-card w-full max-w-sm p-5">
            <h3 className="font-semibold mb-1">Admin receipt</h3>
            <p className="text-xs text-[--admin-steel] mb-4">
              Enter how much to deduct from the original price. This slip is for your own records.
            </p>

            <div className="flex justify-between text-sm mb-3">
              <span className="text-[--admin-steel]">Original price</span>
              <span className="font-semibold">৳{total.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-sm">How much to deduct</span>
              <input
                type="number"
                min={0}
                autoFocus
                placeholder="0"
                className="admin-input w-28"
                value={deduct}
                onChange={(e) => setDeduct(e.target.value)}
              />
            </div>

            <div className="flex justify-between text-sm font-bold pt-3 border-t border-[--admin-line]">
              <span>Discounted price</span>
              <span>৳{(total - off).toLocaleString()}</span>
            </div>

            <div className="flex gap-2 mt-5">
              <button type="button" onClick={download} className="admin-btn-primary">
                Download
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
