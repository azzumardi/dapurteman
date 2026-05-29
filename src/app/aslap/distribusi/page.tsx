"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, QrCode, Truck, CheckCircle2, AlertTriangle } from "lucide-react";

const routes = [
  { id: 1, school: "SDN 01 Pagi", status: "delivered", time: "09:30", distance: "2.1 km" },
  { id: 2, school: "SMPN 5 Sore", status: "in-transit", time: "10:15 (Est)", distance: "3.5 km" },
  { id: 3, school: "SMA Bangsa", status: "pending", time: "11:00 (Est)", distance: "5.0 km" },
];

export default function DistribusiPage() {
  return (
    <div className="space-y-4 pb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Distribusi</h2>
        <p className="text-sm text-gray-500">Tracking Rute & Konfirmasi</p>
      </div>

      <Card className="bg-blue-600 text-white border-none shadow-md">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Status Pengiriman</p>
            <h3 className="font-bold text-lg mt-1">1 dari 3 Selesai</h3>
          </div>
          <div className="bg-blue-500 p-3 rounded-full">
            <Truck className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 mt-2">Rute Hari Ini</h3>

        {routes.map((route) => (
          <Card key={route.id} className={route.status === 'in-transit' ? 'border-blue-500 shadow-md' : 'border-gray-200'}>
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base text-gray-900">{route.school}</CardTitle>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {route.distance}
                  </p>
                </div>
                {route.status === 'delivered' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Terkirim</Badge>}
                {route.status === 'in-transit' && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">Menuju Lokasi</Badge>}
                {route.status === 'pending' && <Badge variant="outline" className="text-gray-500">Menunggu</Badge>}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              {route.status === 'delivered' ? (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Terkonfirmasi pukul {route.time} oleh Bpk. Kepala Sekolah
                </div>
              ) : route.status === 'in-transit' ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Estimasi Tiba:</span>
                    <span className="font-medium text-blue-700">{route.time}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <QrCode className="w-4 h-4 mr-2" /> Scan QR
                    </Button>
                    <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                      <AlertTriangle className="w-4 h-4 mr-2" /> Lapor Kendala
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Estimasi berangkat setelah pengiriman sebelumnya selesai.
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
