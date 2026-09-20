import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Admin Panel | TechNova",
  description: "Ecommerce admin management panel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen font-sans">
        <Sidebar />
        <main className="md:ml-64 min-h-screen pt-14 md:pt-0 transition-all duration-300">
          {children}
        </main>
      </body>
    </html>
  );
}