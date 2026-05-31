"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, PackageSearch, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/aslap", label: "Home", icon: Home },
  { href: "/aslap/produksi", label: "Produksi", icon: ClipboardList },
  { href: "/aslap/stok", label: "Stok", icon: PackageSearch },
  { href: "/aslap/distribusi", label: "Kirim", icon: Truck },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <nav className="bg-white/90 backdrop-blur-md border border-edusync-border/60 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.06)] px-4 py-2">
        <div className="flex justify-around items-center h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center w-full h-full relative"
              >
                <div 
                  className={cn(
                    "flex flex-col items-center justify-center p-1 px-3 rounded-full transition-all duration-200 active:scale-90",
                    isActive ? "text-edusync-blue bg-edusync-blue/10" : "text-edusync-muted hover:text-edusync-blue"
                  )}
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-bold tracking-wider uppercase">{item.label}</span>
                </div>
                {/* Indikator Titik Aktif */}
                {isActive && (
                  <span className="absolute bottom-[-4px] w-1 h-1 rounded-full bg-edusync-blue animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
