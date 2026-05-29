import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, CheckCircle2, AlertCircle, WifiOff } from "lucide-react";
import Link from "next/link";

export default function AslapDashboard() {
  return (
    <div className="space-y-6 pb-6">
      {/* Offline Banner Mock */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md flex items-start gap-3">
        <WifiOff className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-yellow-800">Mode Offline Aktif</h3>
          <p className="text-xs text-yellow-700 mt-1">
            Perubahan akan disinkronisasi ketika koneksi internet kembali.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Halo, Budi!</h2>
        <p className="text-gray-500">Ringkasan operasional hari ini: 29 Mei 2026</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Activity className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">3.450</p>
            <p className="text-xs text-gray-500 font-medium">Target Porsi</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-gray-500 font-medium">Sekolah Tujuan</p>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg text-gray-900">Tugas Saat Ini</h3>
          <Badge variant="outline" className="text-xs">3 tersisa</Badge>
        </div>

        <Link href="/aslap/produksi" className="block">
          <Card className="hover:border-blue-500 transition-colors shadow-sm cursor-pointer">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">Monitor Produksi Nasi</CardTitle>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">Berjalan</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Clock className="w-4 h-4" />
                <span>Estimasi selesai: 09:30</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/aslap/stok" className="block">
          <Card className="hover:border-blue-500 transition-colors shadow-sm cursor-pointer">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">Terima Bahan Sayur</CardTitle>
                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Menunggu</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Supplier tiba 10 menit lagi</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <Link href="/aslap/keuangan" className="bg-gray-100 p-3 rounded-lg flex items-center justify-center gap-2 font-medium text-sm text-gray-700 hover:bg-gray-200">
          Catat BBM
        </Link>
        <Link href="/aslap/tim" className="bg-gray-100 p-3 rounded-lg flex items-center justify-center gap-2 font-medium text-sm text-gray-700 hover:bg-gray-200">
          Absen Tim
        </Link>
      </div>
    </div>
  );
}
