"use client";
import { useEffect, useState } from "react";

const EVENTS = ["Visit", "ViewContent", "AddToCart", "InitiateCheckout", "Purchase"];
const LABELS: Record<string, string> = {
  Visit: "Visits",
  ViewContent: "Product views",
  AddToCart: "Add to cart",
  InitiateCheckout: "Checkout started",
  Purchase: "Orders",
};

type Row = { _id: { event: string; source: string }; count: number };
type Ev = {
  _id: string;
  event: string;
  source: string;
  page?: string;
  label?: string;
  value?: number;
  visitorId?: string;
  createdAt: string;
};

export default function EventsPage() {
  const [matrix, setMatrix] = useState<Row[]>([]);
  const [recent, setRecent] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setMatrix(data.matrix);
        setRecent(data.recent);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  const clearAll = async () => {
    if (!confirm("Delete all tracked events?")) return;
    await fetch("/api/events", { method: "DELETE" });
    load();
  };

  const sources = Array.from(new Set(matrix.map((m) => m._id.source))).sort();
  const count = (source: string, event: string) =>
    matrix.find((m) => m._id.source === source && m._id.event === event)?.count || 0;
  const total = (event: string) =>
    matrix.filter((m) => m._id.event === event).reduce((sum, m) => sum + m.count, 0);
  const isFacebook = (s: string) => /facebook|fb|instagram|meta/i.test(s);

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
        <h1 className="text-2xl font-bold">Pixel Events</h1>
        <button onClick={clearAll} className="admin-link-danger">Clear all</button>
      </div>
      <p className="text-sm text-[--admin-steel] mb-6">
        Events your website recorded in the last 30 days. Updates every 5 seconds. Meta&apos;s own report is in Events Manager.
      </p>

      {loading ? (
        <p className="text-sm text-[--admin-steel]">Loading...</p>
      ) : (
        <>
          <h2 className="font-semibold text-sm mb-2">By source</h2>
          <div className="admin-card overflow-x-auto mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b border-[--admin-line] bg-[--admin-bg]">
                  <th className="py-3 px-4 admin-label font-normal">Source</th>
                  {EVENTS.map((e) => (
                    <th key={e} className="admin-label font-normal px-3">{LABELS[e]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sources.length === 0 && (
                  <tr>
                    <td colSpan={EVENTS.length + 1} className="py-6 px-4 text-[--admin-steel]">
                      No events yet. Open your website and click around.
                    </td>
                  </tr>
                )}
                {sources.map((s) => (
                  <tr
                    key={s}
                    className={`border-b border-[--admin-line] ${isFacebook(s) ? "bg-blue-50 font-medium" : ""}`}
                  >
                    <td className="py-3 px-4">{s}</td>
                    {EVENTS.map((e) => (
                      <td key={e} className="px-3">{count(s, e)}</td>
                    ))}
                  </tr>
                ))}
                {sources.length > 0 && (
                  <tr className="font-bold">
                    <td className="py-3 px-4">All sources</td>
                    {EVENTS.map((e) => (
                      <td key={e} className="px-3">{total(e)}</td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <h2 className="font-semibold text-sm mb-2">Latest events</h2>
          <div className="admin-card overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b border-[--admin-line] bg-[--admin-bg]">
                  <th className="py-3 px-4 admin-label font-normal">Time</th>
                  <th className="admin-label font-normal px-3">Event</th>
                  <th className="admin-label font-normal px-3">Source</th>
                  <th className="admin-label font-normal px-3">Product / Page</th>
                  <th className="admin-label font-normal px-3">Value</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((e) => (
                  <tr key={e._id} className="border-b border-[--admin-line] last:border-0">
                    <td className="py-2.5 px-4 text-[--admin-steel] whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 font-medium">{LABELS[e.event] || e.event}</td>
                    <td className="px-3">{e.source}</td>
                    <td className="px-3 max-w-[260px] truncate">{e.label || e.page}</td>
                    <td className="px-3">{e.value ? `৳${e.value.toLocaleString()}` : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
