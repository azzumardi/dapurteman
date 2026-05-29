"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-gray-200 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">ASLAP <span className="text-blue-600">SaaS</span></CardTitle>
          <CardDescription>Masuk untuk mengelola operasional SPPG</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nomor Telepon / Email</label>
            <input 
              type="text" 
              placeholder="08123456789" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue="aslap@sppg.id"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">PIN / Password</label>
              <a href="#" className="text-xs text-blue-600 hover:underline">Lupa PIN?</a>
            </div>
            <input 
              type="password" 
              placeholder="••••••" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue="password"
            />
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link href="/aslap" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Masuk sebagai Aslap</Button>
            </Link>
            <Link href="/kepala/dashboard" className="w-full">
              <Button variant="outline" className="w-full">Masuk sebagai Kepala SPPG</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <div className="absolute bottom-4 text-center w-full text-xs text-gray-400">
        &copy; 2026 ASLAP SaaS Platform - Program Makan Bergizi Gratis
      </div>
    </div>
  );
}
