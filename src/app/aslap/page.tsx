import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, CheckCircle2, AlertCircle, WifiOff } from "lucide-react";
import Link from "next/link";

export default function AslapDashboard() {
  return (
    <div className="space-y-6 pb-6">
      {/* Offline Banner Mock */}
      <div className="bg-[#FFC23C]/10 border border-[#FFC23C]/30 p-4 rounded-xl flex items-start gap-3 shadow-[0_8px_30px_rgba(255,194,60,0.05)]">
        <WifiOff className="w-5 h-5 text-amber-600 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-amber-800">Mode Offline Aktif</h3>
          <p className="text-xs text-amber-700/80 mt-1 font-medium">
            Perubahan disinkronisasi saat koneksi kembali.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-black tracking-tight text-edusync-text">Halo, Budi!</h2>
        <p className="text-edusync-muted text-sm font-medium mt-1">Operasional hari ini: 29 Mei 2026</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-[#FFC23C]/10 border-[#FFC23C]/20 shadow-[0_8px_30px_rgba(255,194,60,0.05)]">
          <CardContent className="p-5 flex flex-col items-center text-center">
            <Activity className="w-8 h-8 text-amber-500 mb-2" />
            <p className="text-2xl font-black text-edusync-text">3.450</p>
            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mt-1">Target Porsi</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1860F2]/10 border-[#1860F2]/20 shadow-[0_8px_30px_rgba(24,96,242,0.05)]">
          <CardContent className="p-5 flex flex-col items-center text-center">
            <CheckCircle2 className="w-8 h-8 text-edusync-blue mb-2" />
            <p className="text-2xl font-black text-edusync-text">12</p>
            <p className="text-[10px] text-edusync-blue font-bold uppercase tracking-wider mt-1">Sekolah Tujuan</p>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-lg text-edusync-text">Tugas Saat Ini</h3>
          <span className="px-2.5 py-1 bg-edusync-border/50 text-edusync-muted text-[10px] font-bold rounded-full">3 TERSISA</span>
        </div>

        <Link href="/aslap/produksi" className="block active:scale-[0.98] transition-transform">
          <Card className="hover:border-edusync-blue/30 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-edusync-border/40 overflow-hidden cursor-pointer">
            <div className="flex items-stretch">
              <div className="w-1.5 bg-edusync-blue" />
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-sm text-edusync-text">Monitor Produksi Nasi</h4>
                  <span className="px-2 py-0.5 bg-edusync-blue/10 text-edusync-blue font-bold text-[9px] rounded-full uppercase tracking-wider">
                    Berjalan
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-edusync-muted font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Selesai: 09:30</span>
                </div>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/aslap/stok" className="block active:scale-[0.98] transition-transform">
          <Card className="hover:border-edusync-gold/30 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-edusync-border/40 overflow-hidden cursor-pointer">
            <div className="flex items-stretch">
              <div className="w-1.5 bg-edusync-gold" />
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-sm text-edusync-text">Terima Bahan Sayur</h4>
                  <span className="px-2 py-0.5 bg-edusync-gold/20 text-amber-700 font-bold text-[9px] rounded-full uppercase tracking-wider">
                    Menunggu
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-edusync-muted font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-edusync-gold" />
                  <span>Tiba 10 mnt lagi</span>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </div>
      
      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <Link href="/aslap/keuangan" className="bg-white border border-edusync-border/50 p-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs text-edusync-text shadow-sm hover:border-edusync-blue/30 hover:text-edusync-blue active:scale-95 transition-all">
          Catat BBM
        </Link>
        <Link href="/aslap/tim" className="bg-white border border-edusync-border/50 p-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs text-edusync-text shadow-sm hover:border-edusync-blue/30 hover:text-edusync-blue active:scale-95 transition-all">
          Absen Tim
        </Link>
      </div>
    </div>
  );
}
