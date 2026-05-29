"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Star, ClipboardCheck, Clock } from "lucide-react";

const teamMembers = [
  { id: 1, name: "Siti Aminah", role: "Tim Packaging", status: "Hadir", shift: "06:00 - 14:00" },
  { id: 2, name: "Joko", role: "Tim Distribusi", status: "Hadir", shift: "08:00 - 16:00" },
  { id: 3, name: "Wati", role: "Pencuci Alat", status: "Izin", shift: "-" },
];

export default function TimPage() {
  return (
    <div className="space-y-4 pb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Monitoring Tim</h2>
        <p className="text-sm text-gray-500">Evaluasi Kinerja & Absensi</p>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-100 p-4 pb-3">
          <CardTitle className="text-base text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" /> Evaluasi Harian
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Pilih Anggota Tim</label>
            <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="1">Siti Aminah (Packaging)</option>
              <option value="2">Joko (Distribusi)</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Penilaian Kinerja</label>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Kecepatan Kerja</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={`speed-${star}`} className={`w-5 h-5 ${star <= 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Kebersihan (SOP)</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={`clean-${star}`} className={`w-5 h-5 ${star <= 5 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium text-gray-700">Catatan Supervisi</label>
            <textarea 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground" 
              placeholder="Berikan catatan tambahan jika ada..."
            />
          </div>

          <Button className="w-full">Simpan Evaluasi</Button>
        </CardContent>
      </Card>

      <div className="space-y-3 mt-6">
        <h3 className="font-semibold text-gray-900">Status Kehadiran Hari Ini</h3>
        
        {teamMembers.map((member) => (
          <Card key={member.id} className="border-gray-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{member.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{member.role}</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <Badge variant={member.status === 'Hadir' ? 'default' : 'secondary'} className={member.status === 'Hadir' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-0' : ''}>
                  {member.status}
                </Badge>
                {member.shift !== '-' && (
                  <span className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {member.shift}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
