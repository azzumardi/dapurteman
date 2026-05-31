# Panduan Implementasi UI & Logika Manajemen Porsi & Koordinasi Distribusi (Edusync Style)

Dokumen ini berisi panduan teknis langkah-demi-langkah (step-by-step) untuk merancang, mengimplementasikan, dan mempercantik **Modul Manajemen Porsi (Epic E-03)** dan **Modul Koordinasi Distribusi (Epic E-04)** pada aplikasi mobile-first Aslap. Seluruh desain visual diselaraskan dengan standar estetika premium **Edusync Design System** (Soft-UI, sudut melengkung tinggi, mikro-animasi, dan kontras warna yang hidup).

Panduan ini ditulis secara mendalam, lengkap dengan skema database (SQL DDL), arsitektur folder, tata letak antarmuka, serta cuplikan kode (*high-fidelity code blueprints*) agar dapat langsung dieksekusi dengan presisi oleh **Junior Programmer** atau **Model AI** lainnya.

---

## 🎨 Token Desain & Aturan Visual Mobile (Edusync Style)

Sebelum menulis kode UI, pastikan Anda memahami dan menerapkan aturan visual berikut di seluruh halaman mobile-first:

1. **Kelengkungan & Padding Elemen**:
   - **Kartu Utama (Cards)**: Gunakan `rounded-[20px]` (`1.25rem`) dengan padding `p-5` dan bayangan lembut `shadow-[0_8px_30px_rgba(0,0,0,0.02)]`.
   - **Tombol & Input**: Gunakan `rounded-xl` (`12px`) dengan tinggi `h-11` atau `h-12` agar ramah sentuhan jempol (*thumb zone*).
   - **Badge & Status**: Gunakan `rounded-full` dengan font tebal (`font-bold`) dan ukuran kecil (`text-[10px]` atau `text-xs`).

2. **Skema Warna Premium**:
   - **Base Background**: `#F3F6FD` (Abu-abu kebiruan sangat lembut) untuk mengurangi kelelahan mata.
   - **Primary Action (Biru Royal)**: `#1860F2` (`bg-edusync-blue` atau `text-edusync-blue`).
   - **Secondary Accent (Emas Hangat)**: `#FFC23C` (`bg-edusync-gold` atau `text-edusync-text`).
   - **Success (Hijau Emerald)**: `#10B981` (`bg-emerald-500`).
   - **Danger / Alert (Merah Karang)**: `#EF4444` (`bg-red-500`).

3. **Mikro-Interaksi Sentuh**:
   - Berikan efek membal pada tombol saat ditekan: `active:scale-95 transition-all duration-100`.
   - Efek transisi halus pada setiap perubahan state: `transition-all duration-200`.

---

## 🗄️ Langkah 1: Migrasi Database (Supabase / PostgreSQL)

Jalankan perintah SQL DDL berikut di Supabase SQL Editor untuk menyiapkan seluruh tabel, indeks, dan relasi yang diperlukan oleh Epic E-03 dan E-04.

```sql
-- ============================================================
-- SCHEMA: PORTIONS (E-03)
-- ============================================================

-- 1. Tabel Resep Utama (Master Recipes)
CREATE TABLE IF NOT EXISTS recipes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID REFERENCES sppg(id) ON DELETE CASCADE, -- NULL = Resep standar nasional BGN
  name            VARCHAR(255) NOT NULL,
  age_group       VARCHAR(20) NOT NULL CHECK (age_group IN ('balita','paud','sd','smp','sma','ibu_hamil','ibu_menyusui')),
  standard_weight_gram INT,                                  -- Berat porsi standar AKG
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Detail Bahan Baku per Resep
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id       UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id   UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  quantity_per_portion DECIMAL(10,4) NOT NULL,              -- Jumlah bahan per 1 porsi (misal: 0.05 kg)
  unit            VARCHAR(20) NOT NULL                      -- kg, gram, butir, dll
);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);

-- 3. Sesi Porsi Harian SPPG
CREATE TABLE IF NOT EXISTS portion_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id) ON DELETE CASCADE,
  session_date    DATE NOT NULL,
  production_session_id UUID REFERENCES production_sessions(id) ON DELETE SET NULL,
  total_produced  INT DEFAULT 0,
  total_distributed INT DEFAULT 0,
  portions_by_age JSONB DEFAULT '{}',                        -- format: {"balita": 50, "sd": 200, "smp": 150}
  status          VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','closed','reported')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sppg_id, session_date)
);
CREATE INDEX IF NOT EXISTS idx_portion_sessions_sppg_date ON portion_sessions(sppg_id, session_date DESC);

-- 4. Checklist Packing Porsi per Sekolah
CREATE TABLE IF NOT EXISTS portion_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portion_session_id UUID NOT NULL REFERENCES portion_sessions(id) ON DELETE CASCADE,
  sppg_id         UUID NOT NULL REFERENCES sppg(id) ON DELETE CASCADE,
  school_id       UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  packed_portions INT NOT NULL DEFAULT 0,
  checklist       JSONB DEFAULT '{}',                        -- format: {"nasi":true, "lauk":true, "sayur":true, "buah":false, "susu":true}
  is_complete     BOOLEAN DEFAULT false,
  packed_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  packed_at       TIMESTAMPTZ,
  local_id        TEXT
);
CREATE INDEX IF NOT EXISTS idx_portion_items_session ON portion_items(portion_session_id);

-- ============================================================
-- SCHEMA: DISTRIBUTION (E-04)
-- ============================================================

-- 5. Rencana Distribusi Harian
CREATE TABLE IF NOT EXISTS distribution_plans (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id) ON DELETE CASCADE,
  plan_date       DATE NOT NULL,
  status          VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','in_progress','completed','cancelled')),
  vehicle_info    JSONB DEFAULT '{}',                        -- format: {"driver": "Ahmad", "plate": "B 1234 ABC", "type": "Pickup"}
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sppg_id, plan_date)
);
CREATE INDEX IF NOT EXISTS idx_dist_plans_sppg_date ON distribution_plans(sppg_id, plan_date DESC);

-- 6. Titik Rute Stop Distribusi Sekolah
CREATE TABLE IF NOT EXISTS distribution_stops (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id         UUID NOT NULL REFERENCES distribution_plans(id) ON DELETE CASCADE,
  sppg_id         UUID NOT NULL REFERENCES sppg(id) ON DELETE CASCADE,
  school_id       UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  stop_order      INT NOT NULL,                              -- Urutan pengiriman (1, 2, 3...)
  portion_item_id UUID REFERENCES portion_items(id) ON DELETE SET NULL,
  estimated_arrival TIMESTAMPTZ,
  actual_arrival  TIMESTAMPTZ,
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','departed','arrived','confirmed','issue')),
  
  -- Data Konfirmasi Penerimaan Sekolah
  confirmed_by_name VARCHAR(255),
  confirmed_at    TIMESTAMPTZ,
  confirmation_method VARCHAR(20) CHECK (confirmation_method IN ('qr','pin','manual')),
  confirmation_token TEXT,                                   -- Token unik untuk QR Code penerima
  confirmation_photo_url TEXT,
  
  has_issue       BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  local_id        TEXT
);
CREATE INDEX IF NOT EXISTS idx_dist_stops_plan ON distribution_stops(plan_id, stop_order);
CREATE INDEX IF NOT EXISTS idx_dist_stops_sppg ON distribution_stops(sppg_id);

-- 7. Log Masalah / Kendala Distribusi
CREATE TABLE IF NOT EXISTS distribution_issues (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id) ON DELETE CASCADE,
  stop_id         UUID NOT NULL REFERENCES distribution_stops(id) ON DELETE CASCADE,
  issue_type      VARCHAR(50),                               -- 'late','missing_portions','quality','other'
  description     TEXT NOT NULL,
  photo_urls      TEXT[] DEFAULT '{}',
  severity        VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low','medium','high')),
  status          VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','acknowledged','resolved')),
  reported_by     UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  resolved_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dist_issues_sppg ON distribution_issues(sppg_id);
```

---

## 📂 Langkah 2: Struktur Arsitektur Folder Modul

Pastikan developer junior atau AI Anda menata file-file di bawah ini agar rapi dan mengikuti konvensi Next.js 16 App Router:

```
src/
├── app/
│   ├── (app)/aslap/
│   │   ├── porsi/
│   │   │   ├── page.tsx               # Sesi Input Porsi Harian & Kalkulator Resep
│   │   │   └── pemorsian/
│   │   │       └── page.tsx           # Checklist Kemasan/Box per Sekolah
│   │   └── distribusi/
│   │       └── page.tsx               # Timeline Rute, Maps, & Lapor Kendala
│   ├── (public)/
│   │   └── confirm-delivery/
│   │       └── [token]/
│   │           └── page.tsx           # Halaman Publik Penerimaan Sekolah (Bebas Login)
│   └── api/
│       └── confirm-delivery/
│           └── [token]/
│               └── route.ts           # REST API Route Konfirmasi (Bypass RLS)
└── components/
    └── aslap/
        ├── PortionCounter.tsx         # Input +/- Counter per kelompok umur
        ├── ShoppingListCard.tsx       # Kartu kalkulasi kebutuhan bahan baku
        ├── PortionChecklist.tsx       # Form checklist kemasan per sekolah
        ├── DistributionMapView.tsx    # Integrasi Google Maps Rute Pengantaran
        ├── StopIssueModal.tsx         # Dialog lapor kendala + upload foto kompresi
        └── StopDetailCard.tsx         # Kartu ringkasan status per titik pengantaran
```

---

## 🛠️ Langkah 3: Blueprints Implementasi Kode (Frontend & Backend)

### MODUL A: MANAJEMEN PORSI & PEMORSIAN (E-03)

Modul ini memuat kalkulasi bahan baku otomatis berbasis porsi dan sistem packing checklist yang ketat sebelum kotak makanan didistribusikan ke sekolah.

#### 1. Komponen Penghitung Porsi per Umur
*   **Tujuan**: Memudahkan Aslap menambah/mengurangi jumlah porsi per kelompok umur (Balita, SD, SMP, SMA) dengan input yang interaktif dan nyaman disentuh.
*   **File Target**: `src/components/aslap/PortionCounter.tsx`

```tsx
"use client";

import { Minus, Plus } from "lucide-react";

interface PortionCounterProps {
  label: string;
  ageGroup: string;
  value: number;
  onChange: (val: number) => void;
}

export function PortionCounter({ label, ageGroup, value, onChange }: PortionCounterProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-edusync-border/40 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:border-edusync-blue/20 transition-all">
      <div>
        <h4 className="font-bold text-sm text-edusync-text">{label}</h4>
        <span className="text-[10px] text-edusync-muted font-semibold uppercase tracking-wider">{ageGroup}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, value - 5))}
          className="h-9 w-9 flex items-center justify-center rounded-lg bg-edusync-bg border border-edusync-border/50 text-edusync-text hover:bg-edusync-blue/10 hover:text-edusync-blue active:scale-90 transition-all font-bold"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-16 h-9 text-center font-bold text-sm border border-edusync-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-edusync-blue/20 focus:border-edusync-blue [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          onClick={() => onChange(value + 5)}
          className="h-9 w-9 flex items-center justify-center rounded-lg bg-edusync-bg border border-edusync-border/50 text-edusync-text hover:bg-edusync-blue/10 hover:text-edusync-blue active:scale-90 transition-all font-bold"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
```

#### 2. Komponen Kalkulator Bahan Baku (Real-time Shopping List)
*   **Tujuan**: Menghitung secara langsung (*on-the-fly*) total bahan makanan yang dibutuhkan berdasarkan standar AKG BGN ketika porsi diubah.
*   **File Target**: `src/components/aslap/ShoppingListCard.tsx`

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, ShoppingBag } from "lucide-react";

interface IngredientItem {
  name: string;
  needed: number;
  unit: string;
  stock: number;
}

interface ShoppingListCardProps {
  ingredients: IngredientItem[];
}

export function ShoppingListCard({ ingredients }: ShoppingListCardProps) {
  return (
    <Card className="border border-edusync-border/50 rounded-[20px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
      <CardHeader className="bg-edusync-blue/5 border-b border-edusync-border/30 p-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-edusync-blue text-white shadow-sm">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-edusync-text">Auto-Kalkulasi Bahan Baku</CardTitle>
            <p className="text-[10px] text-edusync-muted font-medium">Berdasarkan Master Resep Standar AKG BGN</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3.5">
        {ingredients.length === 0 ? (
          <div className="text-center py-6 text-xs text-edusync-muted">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-edusync-border" />
            Isi porsi di atas untuk menghitung kebutuhan bahan.
          </div>
        ) : (
          ingredients.map((item, idx) => {
            const isLowStock = item.stock < item.needed;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-edusync-text">{item.name}</span>
                  <span className={isLowStock ? "text-red-500" : "text-edusync-blue"}>
                    {item.needed.toFixed(2)} {item.unit}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Progress Bar Ketersediaan Stok */}
                  <div className="flex-1 h-2 bg-edusync-bg border border-edusync-border/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${isLowStock ? "bg-red-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(100, (item.stock / Math.max(1, item.needed)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-semibold text-edusync-muted uppercase">
                    Stok: {item.stock} {item.unit}
                  </span>
                </div>
                {isLowStock && (
                  <p className="text-[9px] text-red-500 font-semibold animate-pulse">
                    ⚠️ Stok tidak cukup! Kurang {(item.needed - item.stock).toFixed(2)} {item.unit}
                  </p>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
```

#### 3. Sesi Input Porsi & Kalkulasi Utama (`src/app/aslap/porsi/page.tsx`)
*   **Tujuan**: Halaman beranda Manajemen Porsi untuk menetapkan target porsi harian dan me-review kebutuhan belanja.

```tsx
"use client";

import { useState } from "react";
import { PortionCounter } from "@/components/aslap/PortionCounter";
import { ShoppingListCard } from "@/components/aslap/ShoppingListCard";
import { Button } from "@/components/ui/button";
import { Save, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AslapPorsiPage() {
  const [portions, setPortions] = useState({
    balita: 50,
    sd: 120,
    smp: 80,
  });

  const handlePortionChange = (group: keyof typeof portions, value: number) => {
    setPortions(prev => ({ ...prev, [group]: value }));
  };

  // Mock kalkulasi bahan (untuk dihubungkan dengan hook database backend)
  const calculatedIngredients = [
    { name: "Beras Cianjur", needed: (portions.balita * 0.05) + (portions.sd * 0.08) + (portions.smp * 0.1), unit: "kg", stock: 25.0 },
    { name: "Daging Ayam Fillet", needed: (portions.balita * 0.04) + (portions.sd * 0.06) + (portions.smp * 0.08), unit: "kg", stock: 12.5 },
    { name: "Wortel Segar", needed: (portions.balita * 0.02) + (portions.sd * 0.03) + (portions.smp * 0.04), unit: "kg", stock: 15.0 },
    { name: "Susu Kotak UHT 125ml", needed: portions.balita + portions.sd + portions.smp, unit: "kotak", stock: 300 },
  ];

  return (
    <div className="space-y-5 pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-edusync-text">Manajemen Porsi</h2>
          <p className="text-xs text-edusync-muted font-medium">Input Target Harian & Kebutuhan AKG</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-edusync-border/60 p-2 rounded-xl text-xs font-bold text-edusync-text shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-edusync-blue" />
          <span>31 Mei 2026</span>
        </div>
      </div>

      {/* Target Porsi Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-edusync-muted uppercase tracking-wider">Langkah 1: Tentukan Target Porsi</h3>
        <PortionCounter label="Anak Balita / PAUD" ageGroup="Usia 1 - 5 Tahun" value={portions.balita} onChange={(v) => handlePortionChange("balita", v)} />
        <PortionCounter label="Anak Sekolah Dasar (SD)" ageGroup="Usia 6 - 12 Tahun" value={portions.sd} onChange={(v) => handlePortionChange("sd", v)} />
        <PortionCounter label="Anak Sekolah Menengah (SMP)" ageGroup="Usia 13 - 15 Tahun" value={portions.smp} onChange={(v) => handlePortionChange("smp", v)} />
      </div>

      {/* Shopping List Auto Calc */}
      <ShoppingListCard ingredients={calculatedIngredients} />

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <Button className="w-full h-12 bg-edusync-blue hover:bg-edusync-blue/90 text-white rounded-xl shadow-[0_4px_12px_rgba(24,96,242,0.2)] active:scale-95 transition-all">
          <Save className="w-4 h-4 mr-2" /> Simpan Sesi & Cetak SPK
        </Button>
        <Link href="/aslap/porsi/pemorsian" className="w-full">
          <Button variant="outline" className="w-full h-12 border border-edusync-border bg-white text-edusync-text hover:bg-edusync-bg rounded-xl active:scale-95 transition-all">
            Lanjut ke Checklist Packing <ArrowRight className="w-4 h-4 ml-2 text-edusync-blue" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
```

#### 4. Checklist Packing per Sekolah (`src/app/aslap/porsi/pemorsian/page.tsx`)
*   **Tujuan**: Memastikan aslap mencentang semua item (Nasi, Lauk, Sayur, Buah, Susu) per sekolah sebelum dikirim.

```tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, ChevronLeft, Package } from "lucide-react";
import Link from "next/link";

export default function PemorsianPage() {
  const [schools, setSchools] = useState([
    {
      id: "s1",
      name: "SDN 01 Pagi",
      target: 200,
      packed: 150,
      checklist: { nasi: true, sayur: true, lauk: true, buah: false, susu: true }
    },
    {
      id: "s2",
      name: "SMPN 5 Sore",
      target: 150,
      packed: 0,
      checklist: { nasi: false, sayur: false, lauk: false, buah: false, susu: false }
    }
  ]);

  const handleCheck = (schoolId: string, item: string, checked: boolean) => {
    setSchools(prev => prev.map(s => {
      if (s.id === schoolId) {
        return {
          ...s,
          checklist: { ...s.checklist, [item]: checked }
        };
      }
      return s;
    }));
  };

  const handleSave = (schoolId: string, count: number) => {
    setSchools(prev => prev.map(s => {
      if (s.id === schoolId) {
        return { ...s, packed: s.packed + count };
      }
      return s;
    }));
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-3">
        <Link href="/aslap/porsi" className="p-2 rounded-lg border border-edusync-border/60 bg-white text-edusync-text hover:bg-edusync-bg active:scale-90 transition-all shadow-sm">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-edusync-text">Checklist & Packing</h2>
          <p className="text-xs text-edusync-muted font-medium">Verifikasi Kemasan per Sekolah Tujuan</p>
        </div>
      </div>

      <div className="space-y-4">
        {schools.map((school) => {
          const checklistItems = Object.keys(school.checklist) as Array<keyof typeof school.checklist>;
          const isAllChecked = Object.values(school.checklist).every(Boolean);
          const isFinished = school.packed >= school.target;

          return (
            <Card key={school.id} className="border border-edusync-border/40 rounded-[20px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
              <CardHeader className="p-4 bg-edusync-bg/60 border-b border-edusync-border/40 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-edusync-text">{school.name}</CardTitle>
                <Badge className={isFinished ? "bg-emerald-500 text-white font-bold" : "bg-edusync-blue/15 text-edusync-blue border-0 font-bold"}>
                  {school.packed} / {school.target} Porsi
                </Badge>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {!isFinished ? (
                  <>
                    <div className="bg-[#1860F2]/5 border border-edusync-blue/15 p-4 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-edusync-text flex items-center gap-2">
                        <Package className="w-4 h-4 text-edusync-blue" />
                        Pengecekan Komponen Box Makanan
                      </h4>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        {checklistItems.map((item) => (
                          <div key={item} className="flex items-center space-x-2.5">
                            <Checkbox
                              id={`${school.id}-${item}`}
                              checked={school.checklist[item]}
                              onCheckedChange={(checked) => handleCheck(school.id, item, !!checked)}
                              className="rounded border-edusync-border text-edusync-blue focus:ring-edusync-blue/20"
                            />
                            <label htmlFor={`${school.id}-${item}`} className="text-xs font-semibold text-edusync-text capitalize select-none cursor-pointer">
                              {item}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <input
                        id={`input-${school.id}`}
                        type="number"
                        placeholder="Jumlah Box Siap..."
                        className="flex h-11 w-full rounded-xl border border-edusync-border bg-white px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-edusync-blue/20 focus:border-edusync-blue transition-all"
                      />
                      <Button
                        disabled={!isAllChecked}
                        onClick={() => {
                          const input = document.getElementById(`input-${school.id}`) as HTMLInputElement;
                          const val = parseInt(input.value) || 0;
                          if (val > 0) {
                            handleSave(school.id, val);
                            input.value = "";
                          }
                        }}
                        className="h-11 rounded-xl bg-edusync-blue hover:bg-edusync-blue/90 disabled:bg-edusync-muted/30 disabled:text-edusync-muted text-white font-bold"
                      >
                        Simpan
                      </Button>
                    </div>
                    {!isAllChecked && (
                      <p className="text-[10px] text-edusync-gold font-bold text-center">
                        ⚠️ Harap centang semua menu porsi sebelum memasukkan data box.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-emerald-500">
                    <div className="bg-emerald-100 p-3 rounded-full mb-3 shadow-[0_4px_12px_rgba(16,185,129,0.1)]">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-edusync-text">Selesai di-packing!</p>
                    <p className="text-[10px] text-edusync-muted">Siap dikirim ke kurir.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
```

---

### MODUL B: KOORDINASI DISTRIBUSI (E-04)

Modul ini memfasilitasi kurir/aslap dalam melakukan tracking rute pengantaran secara real-time, konfirmasi kehadiran menggunakan scan QR Code digital dari pihak sekolah, serta pelaporan kendala cepat di jalan.

#### 1. Halaman Dashboard Pengiriman Kurir (`src/app/aslap/distribusi/page.tsx`)
*   **Tujuan**: Timeline rute pengiriman harian dengan estimasi waktu, jarak, peta, dan tombol verifikasi.

```tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, QrCode, Truck, CheckCircle2, AlertTriangle, ChevronRight, Calendar } from "lucide-react";
import { DistributionMapView } from "@/components/aslap/DistributionMapView";
import { StopIssueModal } from "@/components/aslap/StopIssueModal";
import { StopDetailCard } from "@/components/aslap/StopDetailCard";

export default function AslapDistribusiPage() {
  const [selectedStop, setSelectedStop] = useState<any>(null);
  const [issueStopId, setIssueStopId] = useState<string | null>(null);

  const [routes, setRoutes] = useState([
    { id: "st-1", school: "SDN 01 Pagi", status: "confirmed", time: "09:30", distance: "2.1 km", coords: { lat: -6.2, lng: 106.8 } },
    { id: "st-2", school: "SMPN 5 Sore", status: "in_transit", time: "10:15 (Est)", distance: "3.5 km", coords: { lat: -6.22, lng: 106.82 } },
    { id: "st-3", school: "SMA Bangsa", status: "pending", time: "11:00 (Est)", distance: "5.0 km", coords: { lat: -6.25, lng: 106.85 } }
  ]);

  const activeRoute = routes.find(r => r.status === "in_transit");

  return (
    <div className="space-y-4 pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-edusync-text">Rute Pengiriman</h2>
          <p className="text-xs text-edusync-muted font-medium font-sans">Kurir & Konfirmasi Real-Time</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-edusync-border/60 p-2 rounded-xl text-xs font-bold text-edusync-text shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-edusync-blue" />
          <span>31 Mei 2026</span>
        </div>
      </div>

      {/* Banner Status Pengiriman Premium */}
      <Card className="bg-gradient-to-r from-edusync-blue to-blue-700 text-white border-0 shadow-[0_10px_25px_rgba(24,96,242,0.15)] rounded-[20px] overflow-hidden">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider">Status Kurir Aktif</p>
            <h3 className="font-extrabold text-lg mt-1 leading-tight">1 dari 3 Sekolah Terkirim</h3>
            <p className="text-[11px] text-blue-100/90 mt-0.5">Sedang menuju {activeRoute?.school}</p>
          </div>
          <div className="bg-white/10 p-3.5 rounded-full shadow-inner animate-pulse">
            <Truck className="w-6 h-6 text-white" />
          </div>
        </CardContent>
      </Card>

      {/* Google Maps View (Bisa Expand) */}
      <DistributionMapView stops={routes} />

      {/* Rute Timeline */}
      <div className="space-y-3 pt-1">
        <h3 className="text-xs font-extrabold text-edusync-muted uppercase tracking-wider">Timeline Pemberhentian</h3>
        
        {routes.map((route, idx) => (
          <StopDetailCard
            key={route.id}
            index={idx + 1}
            route={route}
            onShowQR={() => setSelectedStop(route)}
            onReportIssue={() => setIssueStopId(route.id)}
          />
        ))}
      </div>

      {/* Modal QR Code untuk Sekolah */}
      {selectedStop && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm border-0 rounded-[24px] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-4">
              <h3 className="font-bold text-base text-edusync-text">Scan QR Konfirmasi</h3>
              <p className="text-xs text-edusync-muted">Tunjukkan kode QR ini ke Penanggung Jawab di <span className="font-bold text-edusync-blue">{selectedStop.school}</span></p>
              
              <div className="bg-edusync-bg border border-edusync-border p-4 rounded-2xl inline-block shadow-inner">
                {/* QR Code Placeholder (bisa diganti qrcode.react) */}
                <div className="w-48 h-48 bg-white flex items-center justify-center mx-auto rounded-xl border border-edusync-border/60 relative">
                  <QrCode className="w-36 h-36 text-edusync-text" />
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                    <span className="bg-edusync-blue text-white text-[9px] font-black uppercase px-2 py-1 rounded shadow">ASLAP SECURE</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-edusync-muted bg-edusync-bg p-2 rounded-lg font-mono tracking-wider break-all select-all">
                Token: token_qr_{selectedStop.id}
              </div>

              <Button
                onClick={() => setSelectedStop(null)}
                className="w-full h-11 bg-edusync-text text-white hover:bg-edusync-text/90 rounded-xl font-bold text-xs"
              >
                Tutup Jendela
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Dialog Form Lapor Kendala */}
      {issueStopId && (
        <StopIssueModal
          stopId={issueStopId}
          onClose={() => setIssueStopId(null)}
          onSuccess={() => {
            setIssueStopId(null);
            alert("Kendala berhasil dilaporkan ke Kepala SPPG!");
          }}
        />
      )}
    </div>
  );
}
```

#### 2. Dialog Pelaporan Masalah (`src/components/aslap/StopIssueModal.tsx`)
*   **Tujuan**: Form pelaporan kendala/hambatan distribusi yang mencakup pemilihan jenis kendala, deskripsi, dan upload foto dari kamera dengan kompresi lokal.

```tsx
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Camera, Loader2, X } from "lucide-react";

interface StopIssueModalProps {
  stopId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function StopIssueModal({ stopId, onClose, onSuccess }: StopIssueModalProps) {
  const [loading, setLoading] = useState(false);
  const [issueType, setIssueType] = useState("late");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const handleCaptureImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kompresi lokal menggunakan FileReader (bisa ditingkatkan dengan browser-image-compression)
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Simulasi insert database Supabase `distribution_issues` & upload foto
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-edusync-border/40 rounded-[24px] bg-white p-5 shadow-2xl relative animate-in fade-in slide-in-from-bottom-5 duration-200">
        <button onClick={onClose} className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-edusync-bg text-edusync-muted transition-colors">
          <X className="w-4 h-4" />
        </button>

        <CardHeader className="p-0 pb-3 flex flex-row items-center gap-2">
          <div className="p-2 rounded-lg bg-red-100 text-red-500">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-extrabold text-edusync-text">Laporkan Kendala Pengantaran</CardTitle>
            <p className="text-[10px] text-edusync-muted">Laporan langsung masuk ke SPPG Pusat</p>
          </div>
        </CardHeader>

        <CardContent className="p-0 space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase text-edusync-muted tracking-wider">Jenis Kendala</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-edusync-border bg-white px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-edusync-blue/20"
            >
              <option value="late">Keterlambatan (Macet / Cuaca)</option>
              <option value="missing_portions">Porsi Kurang / Tidak Sesuai</option>
              <option value="quality">QC Rusak / Kemasan Bocor</option>
              <option value="other">Hambatan Lainnya</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase text-edusync-muted tracking-wider">Deskripsi Kronologi</label>
            <textarea
              placeholder="Ceritakan kronologi kendala secara detail..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="min-h-[80px] w-full rounded-xl border border-edusync-border bg-white px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-edusync-blue/20 placeholder:text-edusync-muted"
            />
          </div>

          {/* Bukti Foto Laporan */}
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold uppercase text-edusync-muted tracking-wider">Lampiran Bukti Foto</label>
            <div className="flex gap-3">
              <label className="flex-1 h-20 border-2 border-dashed border-edusync-border rounded-xl flex flex-col items-center justify-center bg-edusync-bg/40 hover:bg-edusync-bg cursor-pointer transition-colors active:scale-98">
                <Camera className="w-5 h-5 text-edusync-muted mb-1" />
                <span className="text-[10px] font-bold text-edusync-muted">Ambil Gambar</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCaptureImage} />
              </label>

              {image ? (
                <div className="w-20 h-20 rounded-xl border border-edusync-border overflow-hidden relative shadow">
                  <img src={image} alt="Bukti Kendala" className="w-full h-full object-cover" />
                  <button onClick={() => setImage(null)} className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-black">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl border border-dashed border-edusync-border/60 bg-edusync-bg/10 flex items-center justify-center text-[10px] text-edusync-muted font-bold text-center p-2 leading-tight">
                  Foto belum dilampirkan
                </div>
              )}
            </div>
          </div>

          <Button
            disabled={loading || !desc}
            onClick={handleSubmit}
            className="w-full h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-[0_4px_12px_rgba(239,68,68,0.2)]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sedang Mengirim Laporan...
              </>
            ) : (
              "Kirim Laporan Hambatan"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 3. Peta Rute Distribusi (`src/components/aslap/DistributionMapView.tsx`)
*   **Tujuan**: Panel visual peta navigasi untuk memberikan orientasi arah pengantaran.

```tsx
"use client";

import { MapPin, Navigation } from "lucide-react";

interface DistributionMapViewProps {
  stops: any[];
}

export function DistributionMapView({ stops }: DistributionMapViewProps) {
  return (
    <div className="relative h-44 w-full bg-blue-50 border border-edusync-blue/20 rounded-[20px] shadow-sm overflow-hidden flex items-center justify-center">
      {/* MAP BACKGROUND MOCK: Grid Visual & Efek Premium */}
      <div className="absolute inset-0 bg-[radial-gradient(#1860f2_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-10" />
      <div className="absolute top-[-10%] left-[-10%] w-36 h-36 rounded-full bg-blue-400/20 blur-[30px]" />
      
      {/* Route Line Mock */}
      <svg className="absolute inset-0 w-full h-full text-edusync-blue/30" xmlns="http://www.w3.org/2000/svg">
        <path d="M 50 120 Q 150 40 220 110 T 350 40" fill="transparent" stroke="#1860F2" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 6" className="animate-[dash_10s_linear_infinite]" />
      </svg>

      {/* Markers */}
      <div className="absolute left-[40px] top-[100px] flex flex-col items-center">
        <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[9px] shadow-md border-2 border-white animate-bounce">1</div>
        <span className="text-[8px] font-extrabold text-edusync-text bg-white/90 px-1 py-0.5 rounded shadow mt-1">SDN 01</span>
      </div>

      <div className="absolute left-[190px] top-[50px] flex flex-col items-center">
        <div className="h-6 w-6 rounded-full bg-edusync-blue text-white flex items-center justify-center font-bold text-[9px] shadow-md border-2 border-white animate-pulse">2</div>
        <span className="text-[8px] font-extrabold text-edusync-text bg-white/90 px-1 py-0.5 rounded shadow mt-1">SMPN 5</span>
      </div>

      <div className="absolute right-[50px] top-[80px] flex flex-col items-center">
        <div className="h-6 w-6 rounded-full bg-edusync-muted/60 text-white flex items-center justify-center font-bold text-[9px] shadow-md border-2 border-white">3</div>
        <span className="text-[8px] font-extrabold text-edusync-text bg-white/90 px-1 py-0.5 rounded shadow mt-1">SMA Bangsa</span>
      </div>

      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm border border-edusync-border p-2 rounded-xl text-[9px] font-bold text-edusync-text shadow flex items-center gap-1.5">
        <Navigation className="w-3.5 h-3.5 text-edusync-blue animate-pulse" />
        <span>Navigasi Aktif (Google Maps Directions)</span>
      </div>
    </div>
  );
}
```

#### 4. Landing Page Konfirmasi Publik (`src/app/(public)/confirm-delivery/[token]/page.tsx`)
*   **Tujuan**: Halaman publik (tidak memerlukan login) bagi guru / PIC sekolah untuk memverifikasi kedatangan porsi makanan secara instan.

```tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle, ShieldCheck, Loader2 } from "lucide-react";

export default function PublicConfirmationPage({ params }: { params: { token: string } }) {
  const [status, setStatus] = useState<"loading" | "ready" | "success" | "error">("loading");
  const [schoolName, setSchoolName] = useState("");
  const [portionCount, setPortionCount] = useState(0);

  useEffect(() => {
    // Simulasi memuat data penerima dari token
    setTimeout(() => {
      setSchoolName("SDN 01 Pagi");
      setPortionCount(200);
      setStatus("ready");
    }, 1200);
  }, [params.token]);

  const handleConfirm = async () => {
    setStatus("loading");
    try {
      const res = await fetch(`/api/confirm-delivery/${params.token}`, { method: "POST" });
      if (res.ok) setStatus("success");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F6FD] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Blur Premium */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-blue-200/40 blur-[80px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-amber-100/40 blur-[80px]" />

      <Card className="w-full max-w-md border border-edusync-border/50 bg-white/95 backdrop-blur-md rounded-[24px] shadow-[0_20px_50px_rgba(24,96,242,0.04)] relative z-10 p-2">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-edusync-blue animate-spin mb-4" />
            <p className="text-sm font-bold text-edusync-text">Memproses Konfirmasi...</p>
            <p className="text-[10px] text-edusync-muted mt-1">Mengamankan koneksi digital SPPG</p>
          </div>
        )}

        {status === "ready" && (
          <>
            <CardHeader className="text-center pb-2 pt-6">
              <div className="mx-auto bg-edusync-blue/10 p-3.5 rounded-full w-16 h-16 flex items-center justify-center mb-4 shadow-sm">
                <Activity className="w-8 h-8 text-edusync-blue animate-pulse" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight text-edusync-text">Konfirmasi Penerimaan</CardTitle>
              <CardDescription className="text-xs text-edusync-muted mt-1">Program Makan Bergizi Gratis SPPG</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="bg-edusync-bg border border-edusync-border/50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-xs border-b border-edusync-border/50 pb-2">
                  <span className="text-edusync-muted font-semibold uppercase">Sekolah Penerima</span>
                  <span className="font-extrabold text-edusync-text">{schoolName}</span>
                </div>
                <div className="flex justify-between text-xs pt-1">
                  <span className="text-edusync-muted font-semibold uppercase">Jumlah Distribusi</span>
                  <span className="font-extrabold text-edusync-blue text-sm">{portionCount} Box Makanan</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-edusync-muted tracking-wider">Nama Penerima / PIC</label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap Anda..."
                  className="flex h-11 w-full rounded-xl border border-edusync-border bg-white px-3.5 py-2 text-sm text-edusync-text focus:outline-none focus:ring-2 focus:ring-edusync-blue/20 transition-all font-semibold"
                />
              </div>

              <Button
                onClick={handleConfirm}
                className="w-full h-12 rounded-xl bg-edusync-blue hover:bg-edusync-blue/90 text-white font-bold text-sm shadow-[0_4px_12px_rgba(24,96,242,0.2)] active:scale-[0.98] transition-transform"
              >
                <ShieldCheck className="w-4 h-4 mr-2" /> Konfirmasi Terima Porsi
              </Button>
            </CardContent>
          </>
        )}

        {status === "success" && (
          <div className="text-center py-12 px-4 space-y-4">
            <div className="mx-auto bg-emerald-100 text-emerald-500 p-4 rounded-full w-20 h-20 flex items-center justify-center shadow-[0_8px_24px_rgba(16,185,129,0.15)] animate-bounce">
              <CheckCircle className="w-12 h-12" />
            </div>
            <div>
              <h3 className="text-lg font-black text-edusync-text">Terima Kasih!</h3>
              <p className="text-xs text-edusync-muted mt-1.5">Penerimaan porsi makanan di <span className="font-bold text-edusync-blue">{schoolName}</span> berhasil dicatat ke sistem pusat secara aman.</p>
            </div>
            <p className="text-[9px] text-edusync-muted font-mono pt-4 border-t border-edusync-border/50 uppercase tracking-widest">
              SECURE TRANSACTION &bull; SPPG DIGITAL
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
```

#### 5. API Route Konfirmasi Penerimaan (`src/app/api/confirm-delivery/[token]/route.ts`)
*   **Tujuan**: REST API dengan akses `Service Role` Supabase untuk melewati barikade RLS, mengonfirmasi secara instan status rute, dan merekam data penerima.

```typescript
import { createClient } from "@supabase/supabase-js";

// Menggunakan Service Role Client untuk bypass RLS (karena diakses oleh publik secara secure)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request, { params }: { params: { token: string } }) {
  try {
    // 1. Dapatkan detail titik pengiriman berdasarkan token unik yang dalam status 'arrived' atau 'in_transit'
    const { data: stop, error: getError } = await supabaseAdmin
      .from("distribution_stops")
      .select("id, plan_id, school_id, status")
      .eq("confirmation_token", params.token)
      .in("status", ["in_transit", "arrived"])
      .single();

    if (getError || !stop) {
      return Response.json({ error: "Token tidak valid, kedaluwarsa, atau sudah digunakan" }, { status: 400 });
    }

    // 2. Lakukan update status atomic ke 'confirmed'
    const { error: updateError } = await supabaseAdmin
      .from("distribution_stops")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        confirmation_method: "qr",
      })
      .eq("id", stop.id);

    if (updateError) {
      return Response.json({ error: "Gagal memperbarui status pengiriman" }, { status: 500 });
    }

    return Response.json({ success: true, school_id: stop.school_id });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
```

---

## 🚀 Urutan Implementasi (Implementation Roadmap)

Untuk memudahkan tim junior atau model AI pengerja dalam mengaplikasikan blueprint ini, instruksikan pengerjaan dalam 5 tahap berurutan:

*   **Fase 1: Setup Database & Seed Data** (1 Hari)
    - Jalankan SQL DDL Migrasi di atas di Supabase.
    - Seed data master resep standar AKG BGN untuk kelompok umur `balita` dan `sd`.
*   **Fase 2: UI & Input Sesi Porsi (E-03)** (1-2 Hari)
    - Integrasikan `PortionCounter.tsx` dan `ShoppingListCard.tsx` ke dalam `porsi/page.tsx`.
    - Uji performa kalkulasi real-time saat volume porsi bertambah.
*   **Fase 3: Checklist & Verifikasi Kemasan (E-03)** (1 Hari)
    - Buat halaman `porsi/pemorsian/page.tsx` dengan checklist validasi tombol simpan.
*   **Fase 4: Rute Distribusi & Peta (E-04)** (2 Hari)
    - Buat layout timeline pengiriman di `distribusi/page.tsx`.
    - Hubungkan `StopIssueModal.tsx` dengan integrasi upload media.
*   **Fase 5: API Konfirmasi Publik (E-04)** (1 Hari)
    - Implementasikan API Edge route `/api/confirm-delivery/[token]` bypass RLS.
    - Rancang halaman landing page publik konfirmasi dan tes alur end-to-end QR code.

---

## ✅ Checklist Verifikasi Hasil Implementasi

Tugaskan junior developer / AI model Anda untuk mencentang checklist ini demi menjamin kualitas pengerjaan sudah 100% sempurna:

- [ ] **Desain Soft-UI**: Latar belakang aplikasi menggunakan `#F3F6FD` dan seluruh kartu konten menggunakan `rounded-[20px]` dengan bayangan super lembut.
- [ ] **Kalkulasi Real-time Akurat**: Jumlah bahan pada *Shopping List* otomatis berlipat sesuai target porsi kelompok umur.
- [ ] **Validasi Checklist Kemasan**: Tombol "Simpan" di Pemorsian terkunci (*disabled*) sebelum seluruh checklist komponen porsi (Nasi, Lauk, Sayur, Buah, Susu) dicentang.
- [ ] **Public Landing Page Bebas Login**: Halaman `/confirm-delivery/[token]` dapat dibuka di browser mana pun (tanpa auth login) demi memudahkan guru sekolah scan QR.
- [ ] **Alur Konfirmasi Atomic**: Saat PIC sekolah menekan tombol konfirmasi, status pemberhentian di kurir berubah langsung (*real-time*) menjadi "Terkonfirmasi".
- [ ] **Upload Bukti Kendala Terkompresi**: Form lapor kendala berhasil menangkap file kamera, menampilkan preview, dan menyimpannya di storage.
