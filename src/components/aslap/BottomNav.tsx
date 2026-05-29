import Link from "next/link";
import { Home, ClipboardList, PackageSearch, PieChart, Truck, FileText, Users, DollarSign } from "lucide-react";

const navItems = [
  { href: "/aslap", label: "Home", icon: Home },
  { href: "/aslap/produksi", label: "Produksi", icon: ClipboardList },
  { href: "/aslap/stok", label: "Stok", icon: PackageSearch },
  { href: "/aslap/distribusi", label: "Kirim", icon: Truck },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600 active:text-blue-700 transition-colors"
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
