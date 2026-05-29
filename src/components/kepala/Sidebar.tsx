import Link from "next/link";
import { LayoutDashboard, FileBarChart, Users, Settings, PieChart, Activity } from "lucide-react";

const menuItems = [
  { href: "/kepala/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kepala/laporan", label: "Laporan", icon: FileBarChart },
  { href: "/kepala/tim", label: "Manajemen Tim", icon: Users },
  { href: "/kepala/keuangan", label: "Keuangan", icon: PieChart },
  { href: "/kepala/pengaturan", label: "Pengaturan", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col hidden md:flex">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          ASLAP <span className="text-blue-600">SaaS</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">Kepala SPPG Portal</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
            K
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900">Kepala SPPG</p>
            <p className="text-xs text-gray-500">SPPG-JKT-001</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
