# Panduan Implementasi UI Mobile-First Aslap & Halaman Login (Edusync Style)

Dokumen ini berisi panduan teknis langkah-demi-langkah (step-by-step) untuk mempercantik dan menyelaraskan halaman **Mobile Aslap** serta **Halaman Login** agar sesuai dengan standar estetika premium **Edusync Design System** yang sudah diterapkan pada dashboard desktop Kepala SPPG.

Panduan ini dirancang sangat detail, lengkap dengan pola tata letak, pilihan warna, serta cuplikan kode (*code snippets*) agar dapat dieksekusi dengan mudah oleh **Junior Programmer** atau **Model AI** lainnya secara presisi.

---

## 🎨 Token Desain & Aturan Visual Mobile

Pada tampilan mobile-first (ponsel pintar), kenyamanan mata, kemudahan jempol menjangkau tombol (*thumb zone*), dan kontras informasi sangat krusial. Kita mempertahankan estetika **Modern Soft-UI** dengan penyesuaian khusus mobile:

1. **Kelengkungan & Padding Elemen**:
   - Kartu Utama (*Cards*): Gunakan `rounded-[20px]` (`1.25rem` / `--radius-xl`) dengan padding `p-5` agar informasi tidak terlihat sesak.
   - Tombol, Input, & Select: Gunakan `rounded-xl` (`0.75rem` / `--radius-md`) dengan tinggi `h-11` atau `h-12` agar mudah ditekan di layar sentuh.
   - Badge / Pil Status: Gunakan `rounded-full` dengan font tebal (`font-bold`) berukuran kecil (`text-[10px]` atau `text-xs`).

2. **Skema Warna & Penekanan Kontras**:
   - Latar belakang aplikasi mobile disamakan dengan desktop: `#F3F6FD` (abu-abu kebiruan lembut) untuk meredam kelelahan mata.
   - Kartu konten berwarna putih pekat (`bg-white`) dengan garis tepi halus (`border-edusync-border/40`) dan bayangan menyebar super lembut `shadow-[0_8px_30px_rgba(0,0,0,0.02)]`.
   - Warna aksi utama: `#1860F2` (Biru Royal) untuk tombol utama, tautan, dan penanda aktif.
   - Warna aksen/perhatian: `#FFC23C` (Emas Hangat) untuk status menunggu, info penting, atau penunjuk grafis.

3. **Mikro-Interaksi Sentuh**:
   - Semua tombol wajib memiliki transisi skala saat ditekan agar terasa hidup: `active:scale-95 transition-all`.
   - Kartu daftar (*list items*) yang dapat diklik wajib memiliki transisi perubahan warna border saat disentuh/hover: `hover:border-edusync-blue/30 duration-200`.

---

## 🛠️ Langkah Demi Langkah Implementasi

### Langkah 1: Merombak Halaman Login (`src/app/login/page.tsx`)

Ubah halaman login standar menjadi halaman bernuansa premium menggunakan efek kaca (*glassmorphism*) dan pemosisian kartu tengah yang dinamis.

#### 📄 File Target: [src/app/login/page.tsx](file:///Users/ardi/Developments/GITHUB/dapurteman/src/app/login/page.tsx)
Modifikasi komponen dengan struktur visual berikut:
- **Latar Belakang**: Gunakan kombinasi warna lembut `#F3F6FD` ditambah dengan ornamen lingkaran gradasi buram di sudut layar (`bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent`).
- **Kartu Utama**: Beri efek *highly rounded* `rounded-[24px]`, bayangan dalam, border tipis, dan padding tebal `p-8`.
- **Form Input**: Gunakan tinggi `h-11`, radius `rounded-xl`, dan efek transparan saat fokus dengan warna ring biru royal.
- **Tombol Utama**: Gunakan tinggi `h-12` dengan varian `default` (biru royal) dan `outline` (border abu tipis) untuk alternatif.

#### 💡 Referensi Kode:
```tsx
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
```

---

### Langkah 2: Mempercantik Layout & Navigasi Mobile Aslap (`src/app/aslap/layout.tsx` & `BottomNav.tsx`)

Navigasi bawah (*Bottom Nav*) yang saat ini kaku harus disulap menjadi panel melayang premium bergaya kapsul dengan efek kaca halus (*frosted glass*), mirip aplikasi modern.

#### 📄 File Target: [src/components/aslap/BottomNav.tsx](file:///Users/ardi/Developments/GITHUB/dapurteman/src/components/aslap/BottomNav.tsx)
Ganti navigasi flat dengan struktur kapsul mengambang yang melengkung cantik.

#### 💡 Referensi Kode:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, PackageSearch, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/aslap", label: "Home", icon: Home },
  { href: "/aslap/produksi", label: "Produksi", icon: ClipboardList },
  { href: "/aslap/stok", label: "Stok", icon: PackageSearch },
  { href: "/aslap/distribusi", label: "Kirim", icon: Truck },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <nav className="bg-white/90 backdrop-blur-md border border-edusync-border/60 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.06)] px-4 py-2">
        <div className="flex justify-around items-center h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center w-full h-full relative"
              >
                <div 
                  className={cn(
                    "flex flex-col items-center justify-center p-1 px-3 rounded-full transition-all duration-200 active:scale-90",
                    isActive ? "text-edusync-blue bg-edusync-blue/10" : "text-edusync-muted hover:text-edusync-blue"
                  )}
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-bold tracking-wider uppercase">{item.label}</span>
                </div>
                {/* Indikator Titik Aktif */}
                {isActive && (
                  <span className="absolute bottom-[-4px] w-1 h-1 rounded-full bg-edusync-blue animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
```

#### 📄 File Target: [src/app/aslap/layout.tsx](file:///Users/ardi/Developments/GITHUB/dapurteman/src/app/aslap/layout.tsx)
Ganti header flat dengan AppBar yang memukau, menggunakan huruf tebal (*bold font*), lingkaran aksen profile mini, dan padding aman untuk perangkat seluler.

#### 💡 Referensi Kode:
```tsx
import { BottomNav } from "@/components/aslap/BottomNav";
import { User } from "lucide-react";

export default function AslapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F3F6FD] pb-24">
      {/* App Bar Premium */}
      <header className="bg-white/80 backdrop-blur-md border-b border-edusync-border/40 px-5 py-3.5 sticky top-0 z-40 flex items-center justify-between shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
        <div>
          <h1 className="text-base font-black tracking-tight text-edusync-text">
            ASLAP <span className="text-edusync-blue">SaaS</span>
          </h1>
          <p className="text-[9px] font-bold text-edusync-gold uppercase tracking-wider">Dapur Teman</p>
        </div>
        <div className="h-8 w-8 rounded-full bg-edusync-blue/10 border border-edusync-blue/20 flex items-center justify-center text-edusync-blue shadow-sm">
          <User className="w-4 h-4" />
        </div>
      </header>
      
      <main className="p-4 max-w-lg mx-auto">{children}</main>
      
      <BottomNav />
    </div>
  );
}
```

---

### Langkah 3: Menghias Dashboard Beranda Aslap (`src/app/aslap/page.tsx`)

Beri sentuhan premium pada halaman beranda Aslap.
- **Header Selamat Datang**: Halo, Budi! (ditambah visual teks yang lebih ramah & ringkasan operasional).
- **Banner Mode Offline**: Didesain sebagai alert kuning emas dengan sudut melengkung `rounded-xl`.
- **Grid Kartu Statistik**: Menggunakan kartu berwarna cerah dan melengkung tinggi.
- **Daftar Tugas Aktif**: Kartu tugas dengan garis aksen warna statik di sisi kiri (seperti kartu acara di sidebar Kepala SPPG).

#### 📄 File Target: [src/app/aslap/page.tsx](file:///Users/ardi/Developments/GITHUB/dapurteman/src/app/aslap/page.tsx)

#### 💡 Panduan Visual & Cuplikan Kode:
- Gunakan `rounded-[20px]` untuk **Statistik Grid** dan berikan aksen latar belakang lembut:
  - Kartu "Target Porsi": Background `bg-[#FFC23C]/10 text-edusync-text`, dengan border tipis `border-[#FFC23C]/20`.
  - Kartu "Sekolah Tujuan": Background `bg-[#1860F2]/10 text-edusync-text`, dengan border `border-[#1860F2]/20`.
- Kartu Tugas dibuat seperti kartu agenda Kepala SPPG (menggunakan aksen garis tebal vertikal di kiri):
  - **Tugas Berjalan**: Garis kiri tebal warna biru `bg-edusync-blue`.
  - **Tugas Menunggu**: Garis kiri tebal warna emas `bg-edusync-gold`.

```tsx
// Cuplikan struktur Tugas Card Aslap
<Card className="hover:border-edusync-blue/30 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-edusync-border/40 rounded-xl overflow-hidden cursor-pointer">
  <div className="flex items-stretch">
    {/* Garis Aksen Vertikal Kiri */}
    <div className="w-1.5 bg-edusync-blue" />
    <div className="flex-1 p-4 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-1">
        <h4 className="font-bold text-sm text-edusync-text">Monitor Produksi Nasi</h4>
        <span className="px-2 py-0.5 bg-edusync-blue/10 text-edusync-blue font-bold text-[9px] rounded-full uppercase">
          Berjalan
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-edusync-muted">
        <Clock className="w-3.5 h-3.5" />
        <span>Selesai: 09:30</span>
      </div>
    </div>
  </div>
</Card>
```

---

### Langkah 4: Penyempurnaan Modul Produksi (`src/app/aslap/produksi/page.tsx`)

Modul ini menampilkan stasiun pengerjaan dapur. Buat stasiun ini terasa seperti *interactive checklist progress bar*.

#### 📄 File Target: [src/app/aslap/produksi/page.tsx](file:///Users/ardi/Developments/GITHUB/dapurteman/src/app/aslap/produksi/page.tsx)
- Kartu Aktif ("Masak Nasi") wajib berwarna latar belakang lembut dengan visual indikator yang besar.
- Input batch jumlah porsi wajib didesain di dalam kartu melengkung tebal dengan warna tombol utama biru Edusync yang dinamis (`active:scale-95`).

---

### Langkah 5: Penyempurnaan Modul Stok & QC (`src/app/aslap/stok/page.tsx`)

Modul stok memuat informasi kritis berupa alert stok habis, penerimaan PO sayur, dan pembuangan sisa makanan (*waste*).

#### 📄 File Target: [src/app/aslap/stok/page.tsx](file:///Users/ardi/Developments/GITHUB/dapurteman/src/app/aslap/stok/page.tsx)
- **Alert Stok Menipis**: Ganti box merah flat standar dengan border melengkung halus `border-red-200` berwarna latar `bg-red-50/70` bersanding ikon lonceng bahaya merah.
- **Input QC Wortel**: Berikan warna visual yang tegas pada tombol **Terima** (hijau emerald `#10B981`) dan **Tolak** (merah `#EF4444`) dengan radius membulat `rounded-xl`.
- **Form Pilihan / Select Dropdown**: Berikan border abu tipis, tinggi `h-11` dengan fokus ring kebiruan yang modern.

---

## ✅ Checklist Verifikasi untuk Junior Developer / AI

Gunakan checklist ini untuk menguji apakah implementasi Opsi 1 sudah 100% sempurna:

- [ ] **Background Konsisten**: Latar belakang seluruh halaman Aslap dan Halaman Login menggunakan warna abu kebiruan lembut `#F3F6FD`.
- [ ] **Kapsul Navigasi**: BottomNav melayang (*floating*) di atas konten, memiliki efek frosted glass, dan terdapat titik indikator aktif di bawah ikon menu.
- [ ] **Card Radius**: Semua kartu utama pada mobile menggunakan radius tebal `rounded-[20px]` atau `rounded-xl` dengan garis tepi yang tipis (`border-edusync-border/40`).
- [ ] **Tombol Sentuh scale-95**: Semua elemen tombol (`Button`) memiliki efek menyusut `active:scale-95` saat diketuk.
- [ ] **Card Aksen Vertikal**: Kartu tugas pada dashboard Aslap memiliki ornamen garis berwarna tebal (`w-1.5`) di sisi paling kiri sebagai status visual.
- [ ] **Halaman Login Premium**: Form login memiliki ornamen efek radial blur berwarna biru-emas di latar belakangnya.
