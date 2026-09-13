"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const CARDS = [
  { key: "departments", label: "Departments", href: "/departments" },
  { key: "products", label: "Products", href: "/products" },
  { key: "perks", label: "Trust Badges", href: "/perks" },
  { key: "content", label: "Site Content Blocks", href: "/content" },
];

export default function DashboardPage() {
  const [counts, setCounts] = useState<Record<string, number | null>>({
    departments: null, products: null, perks: null, content: null,
  });

  useEffect(() => {
    const load = async () => {
      const [d, p, pk, c] = await Promise.all([
        fetch("/api/departments").then((r) => r.json()).catch(() => []),
        fetch("/api/products").then((r) => r.json()).catch(() => []),
        fetch("/api/perks").then((r) => r.json()).catch(() => []),
        fetch("/api/content").then((r) => r.json()).catch(() => []),
      ]);
      setCounts({ departments: d.length, products: p.length, perks: pk.length, content: c.length });
    };
    load();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-sm text-[--admin-steel] mb-8">Overview of your storefront content.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {CARDS.map((c) => (
          <Link key={c.key} href={c.href} className="admin-card p-5 hover:shadow-md transition-shadow">
            <p className="admin-label mb-2">{c.label}</p>
            <p className="text-3xl font-bold">
              {counts[c.key] === null ? "…" : counts[c.key]}
            </p>
          </Link>
        ))}
      </div>

      <div className="admin-card p-6">
        <h2 className="font-semibold mb-3">Quick links</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/products" className="admin-btn-secondary">+ Add product</Link>
          <Link href="/departments" className="admin-btn-secondary">+ Add department</Link>
          <Link href="/content" className="admin-btn-secondary">Edit hero / footer</Link>
          <Link href="/perks" className="admin-btn-secondary">Manage trust badges</Link>
        </div>
      </div>
    </div>
  );
}
