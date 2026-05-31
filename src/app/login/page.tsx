"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, ShieldCheck, Lock } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F3F6FD] relative flex items-center justify-center p-4 overflow-hidden">
      {/* Ornamen Latar Belakang Lingkaran Blur Premium */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-blue-200/40 blur-[80px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-amber-100/40 blur-[80px]" />

      <Card className="w-full max-w-md border border-edusync-border/50 bg-white/80 backdrop-blur-md rounded-[24px] shadow-[0_20px_50px_rgba(24,96,242,0.05)] relative z-10">
        <CardHeader className="text-center pb-2 pt-6">
          <div className="mx-auto bg-edusync-blue/10 p-3.5 rounded-full w-16 h-16 flex items-center justify-center mb-4 shadow-[0_8px_20px_rgba(24,96,242,0.1)]">
            <Activity className="w-8 h-8 text-edusync-blue" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-edusync-text">
            ASLAP <span className="text-edusync-blue">SaaS</span>
          </CardTitle>
          <CardDescription className="text-edusync-muted text-xs mt-1">
            Program Makan Bergizi Gratis — Kelola Dapur SPPG Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-edusync-text uppercase tracking-wider">
              Nomor Telepon / Email
            </label>
            <input 
              type="text" 
              placeholder="Masukkan akun Anda..." 
              className="flex h-11 w-full rounded-xl border border-edusync-border bg-white px-3.5 py-2 text-sm text-edusync-text placeholder:text-edusync-muted focus:outline-none focus:ring-2 focus:ring-edusync-blue/20 focus:border-edusync-blue transition-all"
              defaultValue="aslap@sppg.id"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-edusync-text uppercase tracking-wider">
                PIN / Password
              </label>
              <a href="#" className="text-xs text-edusync-blue font-semibold hover:underline">
                Lupa PIN?
              </a>
            </div>
            <div className="relative">
              <input 
                type="password" 
                placeholder="••••••" 
                className="flex h-11 w-full rounded-xl border border-edusync-border bg-white px-3.5 py-2 text-sm text-edusync-text placeholder:text-edusync-muted focus:outline-none focus:ring-2 focus:ring-edusync-blue/20 focus:border-edusync-blue transition-all"
                defaultValue="password"
              />
            </div>
          </div>

          <div className="pt-3 flex flex-col gap-3">
            <Link href="/aslap" className="w-full block active:scale-[0.98] transition-transform">
              <Button className="w-full h-12 rounded-xl bg-edusync-blue hover:bg-edusync-blue/90 text-white font-bold text-sm shadow-[0_4px_12px_rgba(24,96,242,0.2)]">
                <ShieldCheck className="w-4 h-4 mr-2" /> Masuk sebagai Aslap
              </Button>
            </Link>
            <Link href="/kepala/dashboard" className="w-full block active:scale-[0.98] transition-transform">
              <Button variant="outline" className="w-full h-12 rounded-xl border border-edusync-border bg-white text-edusync-text hover:bg-edusync-bg hover:text-edusync-blue font-bold text-sm transition-colors">
                <Lock className="w-4 h-4 mr-2" /> Masuk sebagai Kepala SPPG
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <div className="absolute bottom-6 text-center w-full text-[10px] text-edusync-muted font-medium tracking-wide uppercase">
        &copy; 2026 ASLAP SaaS Platform - Dapur Teman
      </div>
    </div>
  );
}
