"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, ChefHat, Play, CheckCircle2 } from "lucide-react";

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
        <h2 className="text-xl font-bold text-gray-900">Manajemen Produksi</h2>
        <p className="text-sm text-gray-500">Target Hari Ini: 3.450 porsi</p>
      </div>

      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <ChefHat className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Masak Nasi</h3>
              <p className="text-xs text-blue-700">Sedang berlangsung</p>
            </div>
          </div>
          <Badge className="bg-blue-600">60%</Badge>
        </CardContent>
      </Card>

      <div className="space-y-3 mt-6">
        <h3 className="font-semibold text-gray-900">Timeline Stasiun</h3>
        
        {stations.map((station) => (
          <Card key={station.id} className={station.status === 'in-progress' ? 'border-blue-500 shadow-md' : 'border-gray-200'}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex-shrink-0">
                {station.status === 'completed' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : station.status === 'in-progress' ? (
                  <Play className="w-6 h-6 text-blue-500" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                )}
              </div>
              
              <div className="flex-1">
                <h4 className={`font-medium ${station.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                  {station.name}
                </h4>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>Jadwal: {station.time}</span>
                </div>
              </div>

              {station.status === 'in-progress' && (
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                  Selesaikan
                </Button>
              )}
              {station.status === 'pending' && (
                <Button size="sm" variant="outline" className="text-xs">
                  Mulai
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200 mt-4">
        <h3 className="font-semibold text-gray-900 mb-3">Input Jumlah Porsi per Batch</h3>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Batch Terakhir (Nasi)</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Contoh: 150" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                <Button>Simpan</Button>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Total tercatat: 1.200 / 3.450 porsi
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
