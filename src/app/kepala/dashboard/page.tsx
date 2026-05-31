"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, CheckCircle2, AlertTriangle, Users, Package, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function KepalaDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard SPPG-JKT-001</h2>
        <p className="text-sm text-gray-500">Pemantauan operasional real-time - 29 Mei 2026</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Progress Produksi</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">100%</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Selesai tepat waktu
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Progress Distribusi</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">3/12</h3>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <Package className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Sedang berlangsung
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Kendala Dilaporkan</p>
                <h3 className="text-2xl font-bold text-red-600 mt-1">1</h3>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-red-600 mt-2 flex items-center gap-1 cursor-pointer hover:underline">
              Lihat Detail
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Kehadiran Tim</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">24/25</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              1 Orang Izin
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Realtime Updates */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-100 p-4">
              <CardTitle className="text-base text-gray-900">Status Pengiriman Sekolah</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 font-medium">Sekolah</th>
                      <th className="px-4 py-3 font-medium">Target (Porsi)</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">SDN 01 Pagi</td>
                      <td className="px-4 py-3 text-gray-600">200</td>
                      <td className="px-4 py-3">
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Terkirim</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500">09:30</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">SMPN 5 Sore</td>
                      <td className="px-4 py-3 text-gray-600">150</td>
                      <td className="px-4 py-3">
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">Menuju Lokasi</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500">-</td>
                    </tr>
                    <tr className="bg-red-50">
                      <td className="px-4 py-3 font-medium text-red-900">SMA Bangsa</td>
                      <td className="px-4 py-3 text-gray-600">300</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-red-700 border-red-200 bg-white">Kendala: Ban Bocor</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions & Alerts */}
        <div className="space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-100 p-4">
              <CardTitle className="text-base text-gray-900">Perlu Persetujuan</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">BBM Distribusi</h4>
                  <p className="text-xs text-gray-500 mt-1">Diajukan oleh: Budi (Aslap)</p>
                  <p className="text-sm font-semibold mt-1">Rp 150.000</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8 text-xs">Setujui</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs">Tolak</Button>
                </div>
              </div>
              <div className="text-center pt-2">
                <a href="#" className="text-sm text-blue-600 hover:underline">Lihat semua (3)</a>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm border-l-4 border-l-red-500">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" /> Alert Sistem
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <p className="text-sm text-gray-700">
                Stok <strong>Beras</strong> tersisa 10 kg. Berada di bawah batas minimum (50 kg). Harap segera lakukan pemesanan ke supplier.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
