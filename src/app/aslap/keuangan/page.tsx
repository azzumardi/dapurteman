"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, Upload, Plus, Clock } from "lucide-react";

export default function KeuanganPage() {
  return (
    <div className="space-y-4 pb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Keuangan</h2>
        <p className="text-sm text-gray-500">Pengeluaran Operasional Harian</p>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-100 p-4 pb-3">
          <CardTitle className="text-base text-gray-900 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Catat Pengeluaran Baru
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Kategori</label>
            <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <option value="bbm">BBM Distribusi</option>
              <option value="gas">Gas Elpiji</option>
              <option value="kebersihan">Alat Kebersihan</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nominal (Rp)</label>
            <input type="number" placeholder="Contoh: 150000" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Keterangan</label>
            <input type="text" placeholder="Catatan pengeluaran..." className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Foto Struk / Bukti</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors">
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <p className="text-xs font-medium text-blue-600">Ketuk untuk upload foto</p>
            </div>
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700">Submit Pengeluaran</Button>
        </CardContent>
      </Card>

      <div className="space-y-3 mt-6">
        <h3 className="font-semibold text-gray-900">Riwayat Hari Ini</h3>
        
        <Card className="border-gray-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Receipt className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">BBM Distribusi</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> 08:15 WIB
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900 text-sm">Rp 150.000</p>
              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 mt-1">Pending Approval</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
