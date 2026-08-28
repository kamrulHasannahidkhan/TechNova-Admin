"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/content", label: "Site Content" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-[#14151a] text-white flex flex-col">
      <div className="px-6 py-5 border-b border-white/10">
        <span className="font-bold text-lg tracking-tight">Admin<span className="text-[#2d5bff]">.</span></span>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {LINKS.map((link) => {
          const active = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                active ? "bg-[#2d5bff] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-white/10 text-xs text-white/40">
        Ecommerce Admin
      </div>
    </aside>
  );
}
