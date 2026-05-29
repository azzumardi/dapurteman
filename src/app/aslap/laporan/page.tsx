"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Send, Calendar, CheckCircle2 } from "lucide-react";

export default function LaporanPage() {
  return (
    <div className="space-y-4 pb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Pelaporan</h2>
        <p className="text-sm text-gray-500">Laporan Harian Otomatis</p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Laporan: 29 Mei 2026
        </h3>
        <p className="text-xs text-blue-700 mt-1">
          Data ditarik otomatis dari aktivitas harian Anda. Silakan review sebelum dikirim.
        </p>
      </div>

      <div className="space-y-3">
        {/* Ringkasan Produksi */}
        <Card className="border-gray-200">
          <CardHeader className="p-4 pb-2 bg-gray-50 border-b border-gray-100">
            <CardTitle className="text-sm font-semibold text-gray-900">Ringkasan Produksi</CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-sm space-y-2">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Target Porsi</span>
              <span className="font-medium">3.450</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Realisasi Porsi</span>
              <span className="font-medium text-green-600">3.450 (100%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Waktu Selesai</span>
              <span className="font-medium">09:15 WIB</span>
            </div>
          </CardContent>
        </Card>

        {/* Ringkasan Distribusi */}
        <Card className="border-gray-200">
          <CardHeader className="p-4 pb-2 bg-gray-50 border-b border-gray-100">
            <CardTitle className="text-sm font-semibold text-gray-900">Distribusi & Kendala</CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-sm space-y-2">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Total Tujuan</span>
              <span className="font-medium">12 Sekolah</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Kendala Dilaporkan</span>
              <span className="font-medium text-amber-600">1 (Keterlambatan)</span>
            </div>
          </CardContent>
        </Card>

        {/* Keuangan & Waste */}
        <Card className="border-gray-200">
          <CardHeader className="p-4 pb-2 bg-gray-50 border-b border-gray-100">
            <CardTitle className="text-sm font-semibold text-gray-900">Keuangan & Waste</CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-sm space-y-2">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Total Pengeluaran</span>
              <span className="font-medium">Rp 150.000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Food Waste Tercatat</span>
              <span className="font-medium">5 Kg (Organik)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-start gap-2 mb-4 bg-gray-50 p-3 rounded-md">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600">
            Dengan mengirimkan laporan ini, saya mengonfirmasi bahwa data yang tertera adalah akurat dan dapat dipertanggungjawabkan.
          </p>
        </div>
        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          <Send className="w-4 h-4 mr-2" /> Kirim ke Kepala SPPG
        </Button>
      </div>
    </div>
  );
}
