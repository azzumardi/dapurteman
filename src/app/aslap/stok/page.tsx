"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Camera, Check, PackageSearch, X } from "lucide-react";

export default function StokPage() {
  return (
    <div className="space-y-4 pb-6">
      <div>
        <h2 className="text-xl font-black tracking-tight text-edusync-text">QC & Stok</h2>
        <p className="text-sm font-medium text-edusync-muted">Penerimaan & Verifikasi Bahan Baku</p>
      </div>

      {/* Alert Stok Menipis */}
      <div className="bg-red-50 border border-red-100 p-4 rounded-[20px] flex items-start gap-3.5 shadow-[0_8px_30px_rgba(239,68,68,0.08)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 relative z-10" />
        <div className="relative z-10 flex-1">
          <h3 className="text-sm font-bold text-red-700">Alert Stok Menipis!</h3>
          <p className="text-xs text-red-600/80 mt-1 font-medium leading-relaxed">
            Stok Beras (Sisa: 10kg, Threshold: 50kg)
          </p>
          <Button size="sm" className="mt-3 text-xs bg-white text-red-600 border border-red-200 hover:bg-red-50 shadow-sm rounded-xl h-8 px-4 font-bold active:scale-95 transition-all">
            Pesan Ulang
          </Button>
        </div>
      </div>

      {/* Penerimaan Hari Ini */}
      <div className="space-y-4 mt-6">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-gray-900">Penerimaan Hari Ini</h3>
          <span className="px-2.5 py-1 bg-edusync-border/50 text-edusync-muted text-[10px] font-bold rounded-full">2 PO</span>
        </div>

        {/* PO Card 1 */}
        <Card className="border-edusync-border/40 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden rounded-[20px]">
          <CardHeader className="p-4 pb-3 border-b border-edusync-border/30 bg-edusync-bg/50">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-sm font-bold text-edusync-text">Sayur Mayur Segar</CardTitle>
                <p className="text-[10px] font-semibold text-edusync-muted mt-1 tracking-wide">CV Petani Jaya (PO-260529-01)</p>
              </div>
              <Badge className="bg-edusync-blue/10 text-edusync-blue hover:bg-edusync-blue/20 border-0 font-bold px-2 py-0.5 shadow-none rounded-full">Menunggu QC</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-sm text-edusync-text">Wortel (Target: 50 kg)</span>
              </div>
              <div className="flex gap-2.5 mb-4">
                <input type="number" placeholder="Aktual (kg)" className="flex h-11 w-full rounded-xl border border-edusync-border bg-white px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-edusync-blue/20 focus:border-edusync-blue transition-all" />
                <Button variant="outline" size="icon" className="h-11 w-11 shrink-0 text-edusync-muted border-edusync-border rounded-xl hover:bg-edusync-bg active:scale-95 transition-all">
                  <Camera className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex gap-2.5">
                <Button size="sm" className="flex-1 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-[0_4px_12px_rgba(16,185,129,0.2)] active:scale-95 transition-all text-xs">
                  <Check className="w-4 h-4 mr-1.5" /> Terima
                </Button>
                <Button size="sm" variant="destructive" className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-[0_4px_12px_rgba(239,68,68,0.2)] active:scale-95 transition-all text-xs">
                  <X className="w-4 h-4 mr-1.5" /> Tolak
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Catat Waste */}
      <div className="mt-8 pt-6 border-t border-edusync-border/40">
        <h3 className="font-bold text-gray-900 mb-4 px-1">Pencatatan Food Waste</h3>
        <Card className="border-edusync-border/40 shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-[20px]">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-edusync-text uppercase tracking-wider">Kategori Waste</label>
              <select className="flex h-11 w-full items-center justify-between rounded-xl border border-edusync-border bg-white px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-edusync-blue/20 focus:border-edusync-blue transition-all">
                <option value="organik">Sisa Bahan Organik (Kupas)</option>
                <option value="makanan">Sisa Makanan Matang</option>
                <option value="anorganik">Sampah Kemasan</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-edusync-text uppercase tracking-wider">Berat (Kg)</label>
              <input type="number" placeholder="0.0" className="flex h-11 w-full rounded-xl border border-edusync-border bg-white px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-edusync-blue/20 focus:border-edusync-blue transition-all" />
            </div>
            <Button className="w-full h-11 rounded-xl bg-edusync-blue hover:bg-edusync-blue/90 text-white font-bold shadow-[0_4px_12px_rgba(24,96,242,0.2)] active:scale-95 transition-all mt-2">
              Simpan Catatan Waste
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
