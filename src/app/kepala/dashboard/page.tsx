"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Mic, ArrowUpRight, Bell, ChevronDown, CheckCircle2, MoreHorizontal, User, Activity, Package, AlertTriangle, Users, Clock, Truck } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, BarChart, Bar, CartesianGrid, YAxis } from 'recharts';

// ASLAP Dummy data for charts
const distribusiData = [
  { name: 'Terkirim', value: 8, color: '#1860F2' },
  { name: 'Di Jalan', value: 3, color: '#FFC23C' },
  { name: 'Kendala', value: 1, color: '#EF4444' },
];

const anggaranData = [
  { name: 'Sen', anggaran: 500, pengeluaran: 450 },
  { name: 'Sel', anggaran: 500, pengeluaran: 480 },
  { name: 'Rab', anggaran: 500, pengeluaran: 520 },
  { name: 'Kam', anggaran: 500, pengeluaran: 400 },
  { name: 'Jum', anggaran: 500, pengeluaran: 490 },
];

const produksiData = [
  { name: 'Sen', target: 400, realisasi: 400 },
  { name: 'Sel', target: 400, realisasi: 395 },
  { name: 'Rab', target: 400, realisasi: 400 },
  { name: 'Kam', target: 400, realisasi: 390 },
  { name: 'Jum', target: 400, realisasi: 400 },
];

function StatCard({ title, value, subtitle, variant = "gold", icon }: { title: string, value: string, subtitle?: string, variant?: "gold" | "blue" | "red", icon?: React.ReactNode }) {
  const isBlue = variant === "blue";
  const isRed = variant === "red";
  
  let bgClass = "bg-edusync-gold text-edusync-text";
  if (isBlue) bgClass = "bg-edusync-blue text-white";
  if (isRed) bgClass = "bg-red-500 text-white";

  return (
    <div className={`p-6 rounded-[20px] flex justify-between items-start transition-transform hover:scale-[1.02] duration-200 ${bgClass}`}>
      <div className="flex flex-col gap-1">
        <span className={`text-2xl font-bold tracking-tight ${isBlue || isRed ? "text-white" : "text-edusync-text"}`}>
          {value}
        </span>
        <span className={`text-xs font-bold uppercase tracking-wider ${isBlue || isRed ? "text-white/80" : "text-edusync-text/70"}`}>
          {title}
        </span>
        {subtitle && (
          <span className={`text-[10px] mt-1 ${isBlue || isRed ? "text-white/70" : "text-edusync-muted"}`}>
            {subtitle}
          </span>
        )}
      </div>
      <div className={`p-2 rounded-full ${isBlue || isRed ? "bg-white/20 text-white" : "bg-white/40 text-edusync-text"}`}>
        {icon || <ArrowUpRight className="h-5 w-5" />}
      </div>
    </div>
  );
}

function SearchBar() {
  return (
    <div className="flex items-center gap-3 w-full max-w-md">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-edusync-muted" />
        <input 
          type="text" 
          placeholder="Cari ID Produksi, Sekolah..." 
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-edusync-border/60 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-edusync-blue/30 focus:border-edusync-blue transition-all"
        />
      </div>
      <button className="h-11 w-11 flex items-center justify-center rounded-xl bg-edusync-gold text-edusync-text hover:bg-edusync-gold/90 active:scale-95 transition-all">
        <Mic className="h-4 w-4" />
      </button>
    </div>
  );
}

function EventCard({ status, time, title, subtitle, isUrgent = false }: { status: string, time: string, title: string, subtitle: string, isUrgent?: boolean }) {
  const accentColor = isUrgent ? "bg-red-500" : "bg-edusync-gold";
  const badgeColor = isUrgent ? "bg-red-100 text-red-700" : "bg-edusync-gold/20 text-edusync-text";

  return (
    <div className="flex items-stretch bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] border border-edusync-border/40 overflow-hidden hover:border-edusync-blue/30 transition-all cursor-pointer">
      <div className={`w-1.5 ${accentColor}`} />
      <div className="flex-1 p-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className={`px-2 py-0.5 font-bold text-[10px] rounded ${badgeColor}`}>
            {status}
          </span>
          <span className="text-[10px] text-edusync-muted font-medium">
            {time}
          </span>
        </div>
        <h4 className="text-xs font-bold text-edusync-text leading-snug">
          {title}
        </h4>
        <span className="text-[10px] text-edusync-muted">
          {subtitle}
        </span>
      </div>
    </div>
  );
}

export default function KepalaDashboard() {
  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        
        {/* Header Area */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-edusync-text tracking-tight">Dashboard SPPG-JKT-001</h1>
            <p className="text-sm text-edusync-muted mt-1">Pemantauan Operasional Real-time</p>
          </div>
          <SearchBar />
        </div>

        {/* Top Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Proses Produksi" 
            value="100%" 
            subtitle="Selesai tepat waktu"
            icon={<Activity className="w-5 h-5" />} 
          />
          <StatCard 
            title="Progress Distribusi" 
            value="3/12" 
            subtitle="Sekolah Sedang Proses"
            icon={<Package className="w-5 h-5" />} 
          />
          <StatCard 
            title="Kendala Aktif" 
            value="1" 
            subtitle="Bantuan Diperlukan"
            variant="red"
            icon={<AlertTriangle className="w-5 h-5" />} 
          />
          <StatCard 
            title="Kehadiran Tim" 
            value="24/25" 
            subtitle="1 Izin Sakit"
            variant="blue"
            icon={<Users className="w-5 h-5" />} 
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donut Chart */}
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold">Status Pengiriman</CardTitle>
              <span className="text-xs font-medium text-edusync-muted bg-edusync-bg px-2 py-1 rounded-md">Porsi</span>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full relative min-w-0">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={distribusiData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {distribusiData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-edusync-muted">Total Rute</span>
                  <span className="text-2xl font-bold text-edusync-text">12</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {distribusiData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: d.color }} />
                    <span className="text-xs font-medium">{d.name} <span className="font-bold ml-1">{d.value}</span></span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Area Chart */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold">Operasional Harian</CardTitle>
              <span className="text-xs font-medium text-edusync-muted bg-edusync-bg px-2 py-1 rounded-md">Anggaran vs Realisasi (Ribuan)</span>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#1860F2]" /> <span className="text-edusync-muted font-medium">Anggaran (Rp)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#FFC23C]" /> <span className="text-edusync-muted font-medium">Pengeluaran (Rp)</span>
                </div>
              </div>
              <div className="h-[220px] w-full min-w-0">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={anggaranData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAnggaran" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1860F2" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#1860F2" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFC23C" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#FFC23C" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E9F2" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6E7A8A'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6E7A8A'}} tickFormatter={(value) => `${value}k`} />
                    <Tooltip />
                    <Area type="monotone" dataKey="anggaran" stroke="#1860F2" strokeWidth={2} fillOpacity={1} fill="url(#colorAnggaran)" />
                    <Area type="monotone" dataKey="pengeluaran" stroke="#FFC23C" strokeWidth={2} fillOpacity={1} fill="url(#colorPengeluaran)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold">Produksi Porsi</CardTitle>
              <span className="text-xs font-medium text-edusync-muted bg-edusync-bg px-2 py-1 rounded-md">Mingguan</span>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#1860F2]" /> <span className="text-edusync-muted font-medium">Target</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#FFC23C]" /> <span className="text-edusync-muted font-medium">Realisasi</span>
                </div>
              </div>
              <div className="h-[200px] w-full min-w-0">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={produksiData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E9F2" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6E7A8A'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6E7A8A'}} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="target" fill="#1860F2" radius={[6, 6, 0, 0]} barSize={16} />
                    <Bar dataKey="realisasi" fill="#FFC23C" radius={[6, 6, 0, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold">Pengiriman Rute Terkini</CardTitle>
              <MoreHorizontal className="h-4 w-4 text-edusync-muted" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="bg-[#1860F2] text-white p-2 rounded-xl mt-1">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-edusync-text">SDN 01 Pagi (Terkirim)</h4>
                  <p className="text-xs font-medium text-edusync-muted leading-tight mt-1">200 Porsi telah diterima pihak sekolah pukul 09:30 AM.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-[#FFC23C] text-edusync-text p-2 rounded-xl mt-1">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-edusync-text">SMPN 5 Sore (Menuju Lokasi)</h4>
                  <p className="text-xs font-medium text-edusync-muted leading-tight mt-1">Estimasi tiba dalam 15 menit. (150 Porsi)</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-red-500 text-white p-2 rounded-xl mt-1">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-edusync-text">SMA Bangsa (Kendala)</h4>
                  <p className="text-xs font-medium text-edusync-muted leading-tight mt-1">Laporan ban bocor dari driver Aslap. Delay pengiriman.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full xl:w-[340px] shrink-0 flex flex-col gap-6">
        
        {/* Profile Header */}
        <div className="flex items-center justify-end gap-6 h-11">
          <div className="relative">
            <Bell className="w-5 h-5 text-edusync-muted" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-edusync-text leading-none">Budi Hartanto</p>
              <p className="text-xs font-medium text-edusync-muted mt-1">Kepala SPPG</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-edusync-bg border border-edusync-border flex items-center justify-center overflow-hidden">
               <User className="w-5 h-5 text-edusync-muted" />
            </div>
            <ChevronDown className="w-4 h-4 text-edusync-muted" />
          </div>
        </div>

        {/* Calendar Mini */}
        <div className="bg-white rounded-[20px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-edusync-border/40">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-edusync-text">Mei 2026</h3>
             <div className="flex gap-2">
               <button className="text-edusync-muted">&lt;</button>
               <button className="text-edusync-muted">&gt;</button>
             </div>
           </div>
           <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 font-medium text-edusync-muted">
             <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
           </div>
           <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium">
             <div className="py-1 text-edusync-muted/30">26</div><div className="py-1 text-edusync-muted/30">27</div>
             <div className="py-1 text-edusync-muted/30">28</div><div className="py-1 text-edusync-muted/30">29</div><div className="py-1 text-edusync-muted/30">30</div>
             <div className="py-1">1</div><div className="py-1">2</div>
             <div className="py-1">3</div><div className="py-1">4</div><div className="py-1">5</div><div className="py-1">6</div><div className="py-1">7</div>
             <div className="py-1">8</div><div className="py-1">9</div>
             <div className="py-1">10</div><div className="py-1">11</div><div className="py-1">12</div><div className="py-1">13</div><div className="py-1">14</div>
             <div className="py-1">15</div><div className="py-1">16</div>
             <div className="py-1">17</div><div className="py-1">18</div><div className="py-1">19</div><div className="py-1">20</div><div className="py-1">21</div>
             <div className="py-1">22</div><div className="py-1">23</div>
             <div className="py-1">24</div><div className="py-1">25</div><div className="py-1">26</div><div className="py-1">27</div><div className="py-1">28</div>
             <div className="py-1 bg-edusync-blue text-white rounded-full font-bold shadow-sm">29</div><div className="py-1">30</div>
           </div>
        </div>

        {/* Action Items */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-edusync-text">Perlu Persetujuan</h3>
              <MoreHorizontal className="h-4 w-4 text-edusync-muted" />
            </div>
            <div className="space-y-3">
              <EventCard 
                status="Pending" time="10:00 AM" 
                title="BBM Distribusi Rute C" subtitle="Rp 150.000 diajukan oleh Agung" 
              />
              <EventCard 
                status="Pending" time="09:15 AM" 
                title="Bahan Baku Tambahan" subtitle="Rp 50.000 diajukan oleh Siti" 
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Alert Sistem
              </h3>
            </div>
            <div className="space-y-3">
              <EventCard 
                isUrgent={true}
                status="Kritis" time="08:30 AM" 
                title="Stok Beras Menipis" subtitle="Tersisa 10kg, di bawah batas minimum (50kg)." 
              />
              <EventCard 
                isUrgent={true}
                status="Peringatan" time="09:40 AM" 
                title="Keterlambatan Armada" subtitle="Rute SMA Bangsa mengalami delay 30 menit." 
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
