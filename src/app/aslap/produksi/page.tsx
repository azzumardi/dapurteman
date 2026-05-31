"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChefHat, Play, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const stations = [
  { id: 1, name: "Persiapan Bahan", status: "completed", time: "05:00 - 06:30" },
  { id: 2, name: "Masak Nasi", status: "in-progress", time: "06:30 - 08:30" },
  { id: 3, name: "Masak Lauk", status: "pending", time: "07:00 - 09:00" },
  { id: 4, name: "Masak Sayur", status: "pending", time: "08:00 - 09:30" },
];

export default function ProduksiPage() {
  const [activeStation, setActiveStation] = useState<number>(2);

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h2 className="text-xl font-black tracking-tight text-edusync-text">Manajemen Produksi</h2>
        <p className="text-sm font-medium text-edusync-muted">Target Hari Ini: 3.450 porsi</p>
      </div>

      <Card className="bg-[#1860F2]/10 border border-[#1860F2]/30 shadow-[0_8px_30px_rgba(24,96,242,0.05)] rounded-[20px]">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="bg-edusync-blue p-2.5 rounded-full shadow-sm text-white">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-edusync-blue">Masak Nasi</h3>
              <p className="text-xs font-semibold text-edusync-blue/80 uppercase tracking-wider mt-0.5">Sedang berlangsung</p>
            </div>
          </div>
          <span className="text-xl font-black text-edusync-blue">60%</span>
        </CardContent>
      </Card>

      <div className="space-y-3 mt-6">
        <h3 className="font-bold text-gray-900 px-1">Timeline Stasiun</h3>
        
        {stations.map((station) => (
          <Card key={station.id} className={cn(
            "transition-all border-edusync-border/40 shadow-[0_8px_30px_rgba(0,0,0,0.02)]",
            station.status === 'in-progress' ? 'border-edusync-blue ring-1 ring-edusync-blue/20 bg-white' : 'bg-white/80'
          )}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex-shrink-0">
                {station.status === 'completed' ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 drop-shadow-sm" />
                ) : station.status === 'in-progress' ? (
                  <div className="w-7 h-7 rounded-full bg-edusync-blue/10 flex items-center justify-center">
                    <Play className="w-4 h-4 text-edusync-blue ml-0.5" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full border-2 border-edusync-border" />
                )}
              </div>
              
              <div className="flex-1">
                <h4 className={cn(
                  "font-bold text-sm",
                  station.status === 'completed' ? 'text-edusync-muted line-through opacity-80' : 'text-edusync-text'
                )}>
                  {station.name}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-edusync-muted font-medium mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Jadwal: {station.time}</span>
                </div>
              </div>

              {station.status === 'in-progress' && (
                <Button size="sm" className="h-9 rounded-xl bg-edusync-blue hover:bg-edusync-blue/90 text-white shadow-sm font-bold active:scale-95 transition-all text-xs">
                  Selesaikan
                </Button>
              )}
              {station.status === 'pending' && (
                <Button size="sm" variant="outline" className="h-9 rounded-xl border-edusync-border font-bold text-edusync-text hover:bg-edusync-bg active:scale-95 transition-all text-xs">
                  Mulai
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-6 mt-2">
        <h3 className="font-bold text-gray-900 mb-3 px-1">Input Jumlah Porsi per Batch</h3>
        <Card className="border border-edusync-border/40 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-edusync-text uppercase tracking-wider">Batch Terakhir (Nasi)</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Contoh: 150" className="flex h-11 w-full rounded-xl border border-edusync-border bg-white px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-edusync-blue/20 focus:border-edusync-blue transition-all" />
                <Button className="h-11 rounded-xl bg-edusync-blue hover:bg-edusync-blue/90 text-white font-bold active:scale-95 transition-all">Simpan</Button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-medium px-1">
              <span className="text-edusync-muted">Total tercatat:</span>
              <span className="text-edusync-text font-bold">1.200 / 3.450 porsi</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
