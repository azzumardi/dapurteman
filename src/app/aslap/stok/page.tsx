"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Camera, Check, PackageSearch, X } from "lucide-react";

export default function StokPage() {
  return (
    <div className="space-y-4 pb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">QC & Manajemen Stok</h2>
        <p className="text-sm text-gray-500">Penerimaan & Verifikasi Bahan Baku</p>
      </div>

      {/* Alert Stok Menipis */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-red-800">Alert Stok Menipis!</h3>
          <p className="text-xs text-red-700 mt-1">
            Stok Beras (Sisa: 10kg, Threshold: 50kg)
          </p>
          <Button size="sm" variant="outline" className="mt-2 text-xs bg-white text-red-700 border-red-200">
            Pesan Ulang
          </Button>
        </div>
      </div>

      {/* Penerimaan Hari Ini */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Penerimaan Hari Ini</h3>
          <Badge variant="outline">2 PO</Badge>
        </div>

        {/* PO Card 1 */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="p-4 pb-2 border-b border-gray-100 bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base text-gray-900">Sayur Mayur Segar</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Supplier: CV Petani Jaya (PO-260529-01)</p>
              </div>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">Menunggu QC</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm">Wortel (Target: 50 kg)</span>
                </div>
                <div className="flex gap-2 mb-3">
                  <input type="number" placeholder="Aktual (kg)" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 text-gray-500">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                    <Check className="w-4 h-4 mr-1" /> Terima
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1">
                    <X className="w-4 h-4 mr-1" /> Tolak
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Catat Waste */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Pencatatan Food Waste</h3>
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Kategori Waste</label>
              <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="organik">Sisa Bahan Organik (Kupas)</option>
                <option value="makanan">Sisa Makanan Matang</option>
                <option value="anorganik">Sampah Kemasan</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Berat (Kg)</label>
              <input type="number" placeholder="0.0" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <Button className="w-full">Simpan Catatan Waste</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
