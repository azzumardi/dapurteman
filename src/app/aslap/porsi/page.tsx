"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, CheckCircle2 } from "lucide-react";

const schools = [
  { id: 1, name: "SDN 01 Pagi", target: 200, packed: 150 },
  { id: 2, name: "SMPN 5 Sore", target: 150, packed: 0 },
];

export default function PorsiPage() {
  const [checklist, setChecklist] = useState({
    nasi: false,
    sayur: false,
    lauk: false,
    buah: false,
    susu: false,
  });

  const isAllChecked = Object.values(checklist).every(Boolean);

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Pemorsian</h2>
        <p className="text-sm text-gray-500">Checklist & Packing per Sekolah</p>
      </div>

      <div className="space-y-4">
        {schools.map((school) => (
          <Card key={school.id} className="border-gray-200">
            <CardHeader className="p-4 pb-2 bg-gray-50 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base text-gray-900">{school.name}</CardTitle>
                <Badge variant={school.packed === school.target ? "default" : "secondary"}>
                  {school.packed} / {school.target} porsi
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {school.packed < school.target ? (
                <>
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                    <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                      <Package className="w-4 h-4" /> Checklist Kotak Makan (Batch 1)
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.keys(checklist).map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${school.id}-${item}`}
                            checked={checklist[item as keyof typeof checklist]}
                            onCheckedChange={(checked) => 
                              setChecklist({ ...checklist, [item]: !!checked })
                            }
                          />
                          <label
                            htmlFor={`${school.id}-${item}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize text-gray-700"
                          >
                            {item}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="Jumlah box siap..." 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <Button disabled={!isAllChecked} className="bg-blue-600 hover:bg-blue-700">
                      Simpan
                    </Button>
                  </div>
                  {!isAllChecked && (
                    <p className="text-xs text-amber-600 text-center">Centang semua komponen porsi sebelum menyimpan.</p>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-green-600">
                  <CheckCircle2 className="w-10 h-10 mb-2" />
                  <p className="font-medium">Selesai di-packing!</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
