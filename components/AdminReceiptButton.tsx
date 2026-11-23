"use client";
import { useState } from "react";
import { generateAdminReceiptPDF } from "@/lib/adminReceipt";

type AdminOrder = Parameters<typeof generateAdminReceiptPDF>[0];

export default function AdminReceiptButton({ order }: { order: AdminOrder }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  const itemsSum = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = order.total ?? itemsSum + (order.shippingCost || 0);

  const download = () => {
    generateAdminReceiptPDF(order, note.trim());
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setNote("");
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
              This slip is for your own records. You can add a note to it.
            </p>

            <div className="flex justify-between text-sm mb-4">
              <span className="text-[--admin-steel]">Original price (item + delivery)</span>
              <span className="font-semibold">৳{total.toLocaleString()}</span>
            </div>

            <label className="block text-sm mb-1.5">Note</label>
            <textarea
              rows={3}
              autoFocus
              placeholder="Write a note (optional)"
              className="admin-input w-full resize-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

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
