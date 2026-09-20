"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Package,
  ShieldCheck,
  FileText,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/departments", label: "Departments", icon: Layers },
  { href: "/products", label: "Products", icon: Package },
  { href: "/perks", label: "Trust Badges", icon: ShieldCheck },
  { href: "/content", label: "Site Content", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Sticky Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-paper/95 backdrop-blur-md border-b border-line px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-ink">
          Admin<span className="text-signal">.</span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation drawer"
          className="p-2 rounded-xl text-steel hover:text-ink hover:bg-surface-subtle transition active:scale-95"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Glassmorphism Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-paper border-r border-line flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Branding Area */}
        <div className="px-6 py-5 border-b border-line flex flex-col gap-0.5">
          <Link href="/" className="font-display text-xl font-bold tracking-tight text-ink group">
            Admin<span className="text-signal group-hover:text-cyan-glow transition-colors">.</span>
          </Link>
          <p className="text-xs font-medium text-steel">TechNova Control Console</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3.5 py-4 space-y-1.5 overflow-y-auto">
          {LINKS.map((link) => {
            const Icon = link.icon;
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-signal text-white shadow-sm font-semibold"
                    : "text-steel hover:text-ink hover:bg-surface-subtle"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active ? "text-white" : "text-steel group-hover:text-ink"
                    }`}
                  />
                  <span>{link.label}</span>
                </div>

                {active && <ChevronRight className="w-4 h-4 text-white/80" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-line">
          <div className="bg-surface-subtle rounded-xl p-3 border border-line">
            <p className="text-xs font-semibold text-ink">E-commerce Console</p>
            <p className="text-[11px] text-steel mt-0.5">v2.4.0 • Active Session</p>
          </div>
        </div>
      </aside>
    </>
  );
}