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
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
          Admin<span className="text-blue-600">.</span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation drawer"
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition active:scale-95"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Glassmorphism Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Branding Area */}
        <div className="px-6 py-5 border-b border-slate-200 flex flex-col gap-0.5">
          <Link href="/" className="text-xl font-bold tracking-tight text-slate-900 group">
            Admin<span className="text-blue-600 group-hover:text-blue-500 transition-colors">.</span>
          </Link>
          <p className="text-xs font-medium text-slate-500">TechNova Control Console</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
                className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-slate-900 text-white shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active ? "text-white" : "text-slate-400 group-hover:text-slate-900"
                    }`}
                  />
                  <span>{link.label}</span>
                </div>

                {active && <ChevronRight className="w-4 h-4 text-slate-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-200">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <p className="text-xs font-semibold text-slate-900">E-commerce Console</p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">v2.4.0 • Active Session</p>
          </div>
        </div>
      </aside>
    </>
  );
}