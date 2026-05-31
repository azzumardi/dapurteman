# Panduan Implementasi UI & Logika Pengelolaan Keuangan & Laporan Harian Otomatis (Edusync Style)

Dokumen ini berisi panduan teknis langkah-demi-langkah (step-by-step) untuk merancang, mengimplementasikan, dan mempercantik **Modul Pengelolaan Operasional & Keuangan (Epic E-05)** serta **Modul Pelaporan & Dokumentasi Otomatis (Epic E-06)** pada aplikasi mobile-first Aslap. Seluruh desain visual diselaraskan dengan standar estetika premium **Edusync Design System** (Soft-UI, sudut melengkung tinggi, mikro-animasi, dan kontras warna yang hidup).

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
   - **Pending / Warning (Oranye Labu)**: `#F59E0B` (`bg-amber-500`).

3. **Mikro-Interaksi Sentuh**:
   - Berikan efek membal pada tombol saat ditekan: `active:scale-95 transition-all duration-100`.
   - Efek transisi halus pada setiap perubahan state: `transition-all duration-200`.

---

## 🗄️ Langkah 1: Migrasi Database (Supabase / PostgreSQL)

Jalankan perintah SQL DDL berikut di Supabase SQL Editor untuk menyiapkan seluruh tabel, indeks, trigger immutability, dan relasi yang diperlukan oleh Epic E-05 dan E-06.

```sql
-- ============================================================
-- SCHEMA: OPERATIONAL EXPENSES (E-05)
-- ============================================================

-- 1. Tabel Kategori Pengeluaran (Expense Categories)
CREATE TABLE IF NOT EXISTS expense_categories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID REFERENCES sppg(id) ON DELETE CASCADE, -- NULL = system default/nasional BGN
  name            VARCHAR(100) NOT NULL,
  code            VARCHAR(20),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Pengeluaran Kasbon/Operasional (Expenses)
CREATE TABLE IF NOT EXISTS expenses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id) ON DELETE CASCADE,
  expense_date    DATE NOT NULL,
  category_id     UUID NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
  amount          DECIMAL(14,2) NOT NULL CHECK (amount > 0),
  description     TEXT NOT NULL,
  receipt_urls    TEXT[] DEFAULT '{}',
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  submitted_by    UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  submitted_at    TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  local_id        TEXT
);
CREATE INDEX IF NOT EXISTS idx_expenses_sppg_date ON expenses(sppg_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);

-- 3. Tabel Persetujuan Pengeluaran (Expense Approvals)
CREATE TABLE IF NOT EXISTS expense_approvals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id      UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  sppg_id         UUID NOT NULL REFERENCES sppg(id) ON DELETE CASCADE,
  action          VARCHAR(20) NOT NULL CHECK (action IN ('approved','rejected')),
  notes           TEXT,
  approved_by     UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  approved_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_expense_approvals_expense ON expense_approvals(expense_id);

-- 4. Trigger Immutability Pengeluaran Setelah Diproses
CREATE OR REPLACE FUNCTION prevent_expense_update_after_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != 'pending' THEN
    RAISE EXCEPTION 'Pengeluaran yang sudah diproses tidak dapat diubah atau dihapus';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_expense_immutable
BEFORE UPDATE ON expenses
FOR EACH ROW EXECUTE FUNCTION prevent_expense_update_after_approval();


-- ============================================================
-- SCHEMA: DAILY REPORTING & DOCUMENTATION (E-06)
-- ============================================================

-- 5. Tabel Laporan Harian Terintegrasi (Daily Reports)
CREATE TABLE IF NOT EXISTS daily_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id) ON DELETE CASCADE,
  report_date     DATE NOT NULL,
  -- Data Hasil Agregasi Otomatis (Snapshot)
  total_produced  INT DEFAULT 0,
  total_distributed INT DEFAULT 0,
  total_waste_kg  DECIMAL(10,3) DEFAULT 0,
  total_expenses  DECIMAL(14,2) DEFAULT 0,
  on_time_deliveries INT DEFAULT 0,
  late_deliveries INT DEFAULT 0,
  issues_count    INT DEFAULT 0,
  -- Catatan Manual & Evaluasi Aslap
  summary_notes   TEXT,
  issues_narrative TEXT,
  action_taken    TEXT,
  -- Alur Kerja Laporan
  status          VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','reviewed','submitted','acknowledged')),
  generated_at    TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,
  submitted_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  submitted_at    TIMESTAMPTZ,
  bgn_pushed_at   TIMESTAMPTZ,                            -- Timestamp sinkronisasi ke BGN Pusat
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sppg_id, report_date)
);
CREATE INDEX IF NOT EXISTS idx_daily_reports_sppg_date ON daily_reports(sppg_id, report_date DESC);

-- 6. Tabel Lampiran Dokumentasi Laporan (Report Attachments)
CREATE TABLE IF NOT EXISTS report_attachments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id       UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  sppg_id         UUID NOT NULL REFERENCES sppg(id) ON DELETE CASCADE,
  file_url        TEXT NOT NULL,
  file_type       VARCHAR(20) CHECK (file_type IN ('photo','video','document')),
  category        VARCHAR(50) CHECK (category IN ('produksi','distribusi','qc','lainnya')),
  gps_lat         DECIMAL(10,8),
  gps_lng         DECIMAL(11,8),
  taken_at        TIMESTAMPTZ,
  uploaded_by     UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_attachments_report ON report_attachments(report_id);
```

---

## 📂 Langkah 2: Struktur Arsitektur Folder Modul

Pastikan developer junior atau AI Anda menata file-file di bawah ini agar rapi dan mengikuti konvensi Next.js 16 App Router:

```
src/
└── app/
    └── (app)/aslap/
        ├── keuangan/
        │   └── page.tsx               # Dashboard Keuangan Kasbon & Riwayat Pengeluaran
        └── laporan/
            └── page.tsx               # Review Laporan Harian Otomatis & Submit
src/
└── components/
    └── aslap/
        ├── ExpenseFormModal.tsx       # Modal Input Kasbon + Kamera + Upload Foto Nota
        └── ReportSection.tsx          # Wrapper Section Laporan dengan metrik visual
```

---

## 🛠️ Langkah 3: Blueprints Implementasi Kode (Frontend & Backend)

### MODUL A: PENGELOALAN OPERASIONAL & KEUANGAN (E-05)

Modul ini memuat pencatatan kasbon darurat operasional SPPG, unggahan struk nota pembelanjaan, pelacakan status persetujuan Kepala SPPG, dan rekap keuangan.

#### 1. Dialog Input Pengeluaran (`src/components/aslap/ExpenseFormModal.tsx`)
*   **Tujuan**: Form input untuk mencatat detail pengeluaran operasional darurat dengan pengambilan foto nota fisik langsung dari kamera mobile (beserta preview).
*   **Aesthetic**: Edusync Glassmorphism border, rounded buttons, and micro-animations.

```tsx
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, X, DollarSign, FileText } from "lucide-react";

interface ExpenseFormModalProps {
  categories: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSubmit: (data: { categoryId: string; amount: number; description: string; receiptBase64: string | null }) => Promise<void>;
}

export function ExpenseFormModal({ categories, onClose, onSubmit }: ExpenseFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const handleCaptureImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // base64 image untuk preview & local offline storage sync
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !amount || !description) return;
    
    setLoading(true);
    try {
      await onSubmit({
        categoryId,
        amount: parseFloat(amount),
        description,
        receiptBase64: image
      });
      onClose();
    } catch (err) {
      console.error("Gagal mengirim pengeluaran:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-edusync-border/40 rounded-[24px] bg-white p-5 shadow-2xl relative animate-in fade-in slide-in-from-bottom-5 duration-200">
        <button onClick={onClose} type="button" className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-edusync-bg text-edusync-muted transition-colors active:scale-90">
          <X className="w-4 h-4" />
        </button>

        <CardHeader className="p-0 pb-3 flex flex-row items-center gap-2">
          <div className="p-2 rounded-lg bg-edusync-blue/10 text-edusync-blue">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-extrabold text-edusync-text">Input Kasbon / Pengeluaran</CardTitle>
            <p className="text-[10px] text-edusync-muted font-sans font-semibold">Dokumentasikan pengeluaran dapur operasional</p>
          </div>
        </CardHeader>

        <form onSubmit={handleFormSubmit}>
          <CardContent className="p-0 space-y-4 pt-3">
            {/* Input Nominal */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-edusync-muted tracking-wider">Jumlah Pengeluaran (Rp)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-edusync-text">Rp</span>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-edusync-border bg-white pl-10 pr-3.5 py-2 text-sm font-bold text-edusync-text focus:outline-none focus:ring-2 focus:ring-edusync-blue/20 transition-all"
                  required
                  min="1"
                />
              </div>
            </div>

            {/* Kategori Pengeluaran */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-edusync-muted tracking-wider">Kategori Pengeluaran</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-edusync-border bg-white px-3.5 py-2 text-sm font-bold text-edusync-text focus:outline-none focus:ring-2 focus:ring-edusync-blue/20"
                required
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Deskripsi Keperluan */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-edusync-muted tracking-wider">Keterangan / Keperluan</label>
              <textarea
                placeholder="Contoh: Beli tabung gas melon 3 buah / BBM kurir darurat..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] w-full rounded-xl border border-edusync-border bg-white px-3.5 py-2 text-sm font-semibold text-edusync-text focus:outline-none focus:ring-2 focus:ring-edusync-blue/20 placeholder:text-edusync-muted"
                required
              />
            </div>

            {/* Lampiran Nota */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase text-edusync-muted tracking-wider">Foto Nota / Struk</label>
              <div className="flex gap-3">
                <label className="flex-1 h-20 border-2 border-dashed border-edusync-border rounded-xl flex flex-col items-center justify-center bg-edusync-bg/40 hover:bg-edusync-bg cursor-pointer transition-colors active:scale-95">
                  <Camera className="w-5 h-5 text-edusync-muted mb-1" />
                  <span className="text-[10px] font-bold text-edusync-muted">Ambil Gambar</span>
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCaptureImage} />
                </label>

                {image ? (
                  <div className="w-20 h-20 rounded-xl border border-edusync-border overflow-hidden relative shadow">
                    <img src={image} alt="Nota Pengeluaran" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImage(null)} className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-black">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl border border-dashed border-edusync-border/60 bg-edusync-bg/10 flex items-center justify-center text-[10px] text-edusync-muted font-bold text-center p-2 leading-tight">
                    Belum ada lampiran
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !categoryId || !amount || !description}
              className="w-full h-12 bg-edusync-blue hover:bg-edusync-blue/90 text-white rounded-xl font-bold shadow-[0_4px_12px_rgba(24,96,242,0.2)] active:scale-95 transition-transform"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sedang Mengirim...
                </>
              ) : (
                "Kirim Kasbon & Ajukan Approval"
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
```

#### 2. Dashboard Halaman Keuangan Aslap (`src/app/aslap/keuangan/page.tsx`)
*   **Tujuan**: Menampilkan metrik pengeluaran hari ini vs pagu bulanan kasbon, beserta riwayat input, status persetujuan Kepala SPPG (Pending, Approved, Rejected), dan tombol pengajuan baru.

```tsx
"use client";

import { useState } from "react";
import { ExpenseFormModal } from "@/components/aslap/ExpenseFormModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, DollarSign, CheckCircle2, AlertTriangle, Clock, ChevronRight } from "lucide-react";

export default function AslapKeuanganPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data Mock untuk visualisasi data
  const categories = [
    { id: "cat-1", name: "Bahan Dapur Darurat" },
    { id: "cat-2", name: "BBM & Transportasi Kurir" },
    { id: "cat-3", name: "Perbaikan Alat & Gas Dapur" },
    { id: "cat-4", name: "Lainnya (Operasional SPPG)" }
  ];

  const [expenses, setExpenses] = useState([
    {
      id: "exp-1",
      date: "31 Mei 2026",
      category: "Bahan Dapur Darurat",
      amount: 145000,
      description: "Beli beras ketan & wortel tambahan karena kekurangan porsi SD",
      status: "approved",
      approvedBy: "Bapak Ahmad (Kepala SPPG)",
      notes: "Disetujui untuk penyesuaian porsi"
    },
    {
      id: "exp-2",
      date: "31 Mei 2026",
      category: "Perbaikan Alat & Gas Dapur",
      amount: 72000,
      description: "Tabung gas elpiji melon 3kg (3 tabung darurat)",
      status: "pending",
      approvedBy: null,
      notes: null
    },
    {
      id: "exp-3",
      date: "30 Mei 2026",
      category: "BBM & Transportasi Kurir",
      amount: 50000,
      description: "Bensin kurir darurat motor ke rute terjauh SMA Bangsa",
      status: "approved",
      approvedBy: "Bapak Ahmad (Kepala SPPG)",
      notes: "Sesuai regulasi BBM"
    }
  ]);

  const totalExpenseToday = expenses
    .filter(e => e.date === "31 Mei 2026" && e.status === "approved")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalPendingExpense = expenses
    .filter(e => e.status === "pending")
    .reduce((sum, item) => sum + item.amount, 0);

  const handleAddExpense = async (data: any) => {
    const matchedCategory = categories.find(c => c.id === data.categoryId);
    const newExpense = {
      id: `exp-${Date.now()}`,
      date: "31 Mei 2026",
      category: matchedCategory ? matchedCategory.name : "Operasional",
      amount: data.amount,
      description: data.description,
      status: "pending" as const,
      approvedBy: null,
      notes: null
    };

    // Simulasi penambahan data lokal
    setExpenses(prev => [newExpense, ...prev]);
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-edusync-text">Keuangan & Kasbon</h2>
          <p className="text-xs text-edusync-muted font-sans font-semibold">Kelola Operasional Kas Kecil SPPG</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-edusync-border/60 p-2 rounded-xl text-xs font-bold text-edusync-text shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-edusync-blue" />
          <span>31 Mei 2026</span>
        </div>
      </div>

      {/* Rangkuman Finansial Mini */}
      <div className="grid grid-cols-2 gap-3.5">
        <Card className="border border-edusync-border/40 rounded-[20px] bg-white shadow-sm overflow-hidden">
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-[9px] font-extrabold text-edusync-muted uppercase tracking-wider">Disetujui Hari Ini</span>
            <span className="font-extrabold text-lg text-emerald-500 mt-1">Rp {totalExpenseToday.toLocaleString("id-ID")}</span>
            <span className="text-[8px] text-edusync-muted mt-1 flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" /> Kas SPPG terpakai
            </span>
          </CardContent>
        </Card>

        <Card className="border border-edusync-border/40 rounded-[20px] bg-white shadow-sm overflow-hidden">
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-[9px] font-extrabold text-edusync-muted uppercase tracking-wider">Dalam Review (Pending)</span>
            <span className="font-extrabold text-lg text-amber-500 mt-1">Rp {totalPendingExpense.toLocaleString("id-ID")}</span>
            <span className="text-[8px] text-edusync-muted mt-1 flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5 text-amber-500" /> Menunggu Kepala SPPG
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Aksi Tambah Pengeluaran */}
      <Button
        onClick={() => setIsModalOpen(true)}
        className="w-full h-12 bg-edusync-blue hover:bg-edusync-blue/90 text-white rounded-xl font-bold shadow-[0_4px_12px_rgba(24,96,242,0.15)] active:scale-95 transition-transform"
      >
        <Plus className="w-4 h-4 mr-2" /> Catat Kasbon / Belanja
      </Button>

      {/* Daftar Pengeluaran */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-extrabold text-edusync-muted uppercase tracking-wider">Riwayat Pengeluaran Kasbon</h3>
        
        {expenses.map((expense) => {
          const isPending = expense.status === "pending";
          const isApproved = expense.status === "approved";

          return (
            <Card key={expense.id} className="border border-edusync-border/40 rounded-[20px] bg-white shadow-sm hover:border-edusync-blue/20 transition-all">
              <CardContent className="p-4.5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-sm text-edusync-text">Rp {expense.amount.toLocaleString("id-ID")}</h4>
                    <span className="text-[9px] text-edusync-muted font-bold font-sans uppercase tracking-wider">{expense.category}</span>
                  </div>
                  
                  {isApproved && (
                    <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-500 font-bold border-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Disetujui
                    </Badge>
                  )}
                  {isPending && (
                    <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-500 font-bold border-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Diproses
                    </Badge>
                  )}
                </div>

                <div className="bg-edusync-bg/50 border border-edusync-border/40 p-3 rounded-xl">
                  <p className="text-xs font-medium text-edusync-text leading-snug">{expense.description}</p>
                  <span className="text-[9px] text-edusync-muted font-bold block mt-1.5">Tanggal: {expense.date}</span>
                </div>

                {/* Detail Approval Box */}
                {isApproved && (
                  <div className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl space-y-1">
                    <span className="font-bold block">Persetujuan Kepala SPPG:</span>
                    <p className="font-medium italic">&quot;{expense.notes}&quot;</p>
                    <span className="text-[9px] opacity-80 block text-right font-sans font-bold">Verifikator: {expense.approvedBy}</span>
                  </div>
                )}
                
                {isPending && (
                  <div className="text-[9px] text-amber-600 bg-amber-50 border border-amber-100 p-2 rounded-xl flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-semibold leading-tight">Menunggu tanda tangan digital dari Kepala SPPG. Nota bersifat immutable setelah diapprove.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal Input Form */}
      {isModalOpen && (
        <ExpenseFormModal
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddExpense}
        />
      )}
    </div>
  );
}
```

---

### MODUL B: PELAPORAN & DOKUMENTASI OTOMATIS (E-06)

Modul ini melakukan agregasi data produksi porsi, waste makanan, pengantaran logistik, keuangan operasional, dan masalah di lapangan secara real-time. Aslap bertugas me-review laporan draf yang ter-generate otomatis pukul 20:00 WIB, menambahkan narasi kesimpulan, mengunggah foto penutupan, dan menekan tombol kirim ke BGN Pusat.

#### 1. Komponen Kartu Bagian Laporan Harian (`src/components/aslap/ReportSection.tsx`)
*   **Tujuan**: Komponen pembungkus serbaguna untuk me-review ringkasan metrik statistik per modul dengan ikon bergaya Edusync.

```tsx
"use client";

import { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ReportSectionProps {
  title: string;
  icon: LucideIcon;
  badgeText?: string;
  isRequired?: boolean;
  children: React.ReactNode;
}

export function ReportSection({ title, icon: Icon, badgeText, isRequired = false, children }: ReportSectionProps) {
  return (
    <Card className="border border-edusync-border/40 rounded-[20px] bg-white shadow-sm overflow-hidden">
      <CardHeader className="bg-edusync-bg/60 border-b border-edusync-border/30 p-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-edusync-blue/15 text-edusync-blue shadow-sm">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-extrabold text-edusync-text flex items-center gap-1">
              {title}
              {isRequired && <span className="text-red-500 font-extrabold">*</span>}
            </CardTitle>
          </div>
        </div>
        
        {badgeText && (
          <span className="px-2.5 py-0.5 rounded-full bg-edusync-blue/10 text-edusync-blue text-[9px] font-extrabold uppercase tracking-wider">
            {badgeText}
          </span>
        )}
      </CardHeader>
      <CardContent className="p-5 space-y-3.5">
        {children}
      </CardContent>
    </Card>
  );
}

// Reusable Sub-Komponen untuk Layout Ringkas Baris Metrik
interface MetricRowProps {
  label: string;
  value: string | number;
  unit?: string;
  isDanger?: boolean;
}

export function MetricRow({ label, value, unit, isDanger = false }: MetricRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-edusync-border/30 last:border-0 last:pb-0 first:pt-0">
      <span className="text-xs font-semibold text-edusync-muted">{label}</span>
      <span className={`text-sm font-bold font-sans ${isDanger ? "text-red-500" : "text-edusync-text"}`}>
        {value} {unit && <span className="text-[10px] font-bold text-edusync-muted uppercase tracking-wider">{unit}</span>}
      </span>
    </div>
  );
}
```

#### 2. Halaman Review & Submit Laporan Harian (`src/app/aslap/laporan/page.tsx`)
*   **Tujuan**: Dashboard interaktif yang mengagregasikan seluruh data harian untuk di-review Aslap sebelum di-submit ke Pusat BGN.

```tsx
"use client";

import { useState } from "react";
import { ReportSection, MetricRow } from "@/components/aslap/ReportSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Trash2, Truck, FileText, Send, Calendar, CheckCircle2, ShieldAlert, Camera, X } from "lucide-react";

export default function AslapLaporanPage() {
  const [status, setStatus] = useState<"draft" | "submitted">("draft");
  const [notes, setNotes] = useState("");
  const [issueNotes, setIssueNotes] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Data Ter-agregasi Otomatis (Snapshot)
  const reportData = {
    date: "31 Mei 2026",
    totalProduced: 430,
    totalDistributed: 430,
    wasteKg: 4.8,
    expensesAmount: 145000,
    onTimeDeliveries: 2,
    lateDeliveries: 1,
    issuesCount: 1
  };

  const handleCaptureImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages(prev => [...prev, event.target!.result as string]);
        }
        setUploading(false);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmitReport = async () => {
    setStatus("submitted");
    alert("Laporan Harian berhasil ditandatangani digital & dikirim ke BGN Pusat!");
  };

  return (
    <div className="space-y-4 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-edusync-text">Laporan Harian</h2>
          <p className="text-xs text-edusync-muted font-sans font-semibold">Integrasi Laporan Akhir Operasional</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-edusync-border/60 p-2 rounded-xl text-xs font-bold text-edusync-text shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-edusync-blue" />
          <span>31 Mei 2026</span>
        </div>
      </div>

      {/* Banner Status Laporan */}
      {status === "draft" ? (
        <Card className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-lg rounded-[20px] overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-100">Review Laporan Draf</span>
              <h3 className="font-extrabold text-base leading-tight">Siap Untuk Di-Submit</h3>
              <p className="text-[10px] text-amber-100/90 leading-snug">Mohon periksa akurasi data agregasi otomatis di bawah ini.</p>
            </div>
            <div className="bg-white/10 p-3.5 rounded-full shadow-inner">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg rounded-[20px] overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-100">Status Laporan Dikirim</span>
              <h3 className="font-extrabold text-base leading-tight">Telah Dikirim ke BGN Pusat</h3>
              <p className="text-[10px] text-emerald-100/90 leading-snug">Laporan dikunci (Read-Only) &amp; aman di blockchain audit log.</p>
            </div>
            <div className="bg-white/10 p-3.5 rounded-full shadow-inner animate-bounce">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 1: Produksi & Porsi */}
      <ReportSection title="Produksi Dapur SPPG" icon={ChefHat} badgeText="Modul E-03">
        <MetricRow label="Porsi Diproduksi Balita / PAUD" value={50} unit="porsi" />
        <MetricRow label="Porsi Diproduksi SD" value={200} unit="porsi" />
        <MetricRow label="Porsi Diproduksi SMP" value={180} unit="porsi" />
        <div className="h-[1px] bg-edusync-border/40 my-1" />
        <MetricRow label="Total Hasil Produksi" value={reportData.totalProduced} unit="porsi" />
      </ReportSection>

      {/* Section 2: Waste Makanan */}
      <ReportSection title="Food Waste Dapur Dapur" icon={Trash2} badgeText="Modul E-03">
        <MetricRow label="Food Waste Tersisa" value={reportData.wasteKg} unit="kg" />
        <p className="text-[10px] font-semibold text-edusync-muted">
          💡 Metrik ini mencatat sisa bahan baku / masakan yang tidak dapat dikonsumsi pasca-produksi.
        </p>
      </ReportSection>

      {/* Section 3: Pengantaran & Distribusi */}
      <ReportSection title="Koordinasi Distribusi Kurir" icon={Truck} badgeText="Modul E-04">
        <MetricRow label="Pengiriman Selesai (On-Time)" value={reportData.onTimeDeliveries} unit="sekolah" />
        <MetricRow label="Pengiriman Terlambat" value={reportData.lateDeliveries} unit="sekolah" isDanger={true} />
        <MetricRow label="Jumlah Kendala Dilaporkan" value={reportData.issuesCount} unit="kasus" isDanger={reportData.issuesCount > 0} />
      </ReportSection>

      {/* Section 4: Ringkasan Pengeluaran Kasbon */}
      <ReportSection title="Finansial & Keuangan Kas Kecil" icon={DollarSign} badgeText="Modul E-05">
        <MetricRow label="Total Pengeluaran Disetujui" value={`Rp ${reportData.expensesAmount.toLocaleString("id-ID")}`} />
        <p className="text-[10px] font-semibold text-edusync-muted">
          ℹ️ Hanya pengeluaran berstatus &quot;Approved&quot; oleh Kepala SPPG yang diringkas dalam Laporan Harian.
        </p>
      </ReportSection>

      {/* Form Aksi Penambahan Ulasan / Narasi */}
      <ReportSection title="Evaluasi & Narasi Lapangan" icon={FileText} isRequired={true}>
        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase text-edusync-muted tracking-wider">Kesimpulan Hari Ini</label>
            <textarea
              placeholder="Jelaskan secara ringkas jalannya operasional hari ini..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={status === "submitted"}
              className="min-h-[80px] w-full rounded-xl border border-edusync-border bg-white px-3.5 py-2 text-xs font-semibold text-edusync-text focus:outline-none focus:ring-2 focus:ring-edusync-blue/20 placeholder:text-edusync-muted disabled:bg-edusync-bg/70 disabled:text-edusync-muted"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase text-edusync-muted tracking-wider">Kronologi Penanganan Kendala</label>
            <textarea
              placeholder="Tuliskan tindakan korektif jika ada keterlambatan kurir..."
              value={issueNotes}
              onChange={(e) => setIssueNotes(e.target.value)}
              disabled={status === "submitted"}
              className="min-h-[80px] w-full rounded-xl border border-edusync-border bg-white px-3.5 py-2 text-xs font-semibold text-edusync-text focus:outline-none focus:ring-2 focus:ring-edusync-blue/20 placeholder:text-edusync-muted disabled:bg-edusync-bg/70 disabled:text-edusync-muted"
            />
          </div>

          {/* Lampiran Dokumentasi Visual Penutupan Dapur */}
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold uppercase text-edusync-muted tracking-wider">Dokumentasi Pembersihan & Penutupan Dapur</label>
            <div className="flex flex-wrap gap-2.5">
              {status === "draft" && (
                <label className="w-16 h-16 border-2 border-dashed border-edusync-border rounded-xl flex flex-col items-center justify-center bg-edusync-bg/40 hover:bg-edusync-bg cursor-pointer transition-colors active:scale-95">
                  <Camera className="w-4 h-4 text-edusync-muted mb-0.5" />
                  <span className="text-[8px] font-bold text-edusync-muted">Ambil</span>
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCaptureImage} disabled={uploading} />
                </label>
              )}

              {images.map((img, idx) => (
                <div key={idx} className="w-16 h-16 rounded-xl border border-edusync-border overflow-hidden relative shadow">
                  <img src={img} alt="Lampiran Laporan" className="w-full h-full object-cover" />
                  {status === "draft" && (
                    <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-white hover:bg-black">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              ))}

              {images.length === 0 && (
                <span className="text-[9px] text-edusync-muted font-bold self-center italic">Wajib melampirkan minimal 1 foto kebersihan dapur.</span>
              )}
            </div>
          </div>
        </div>
      </ReportSection>

      {/* Tombol Kirim / Submit */}
      {status === "draft" && (
        <Button
          onClick={handleSubmitReport}
          disabled={!notes || images.length === 0}
          className="w-full h-12 bg-edusync-blue hover:bg-edusync-blue/90 disabled:bg-edusync-muted/30 disabled:text-edusync-muted text-white rounded-xl font-bold shadow-[0_4px_12px_rgba(24,96,242,0.2)] active:scale-[0.98] transition-transform"
        >
          <Send className="w-4 h-4 mr-2" /> Tandatangani & Kirim Laporan Harian
        </Button>
      )}
    </div>
  );
}
```

---

## 🚀 Urutan Implementasi (Implementation Roadmap)

Untuk memudahkan tim junior atau model AI pengerja dalam mengaplikasikan blueprint ini, instruksikan pengerjaan dalam 4 tahap berurutan:

*   **Fase 1: Setup Database, Trigger, & Seed** (1 Hari)
    - Jalankan seluruh SQL DDL Migrasi di atas pada Supabase SQL Editor.
    - Pasang trigger `trg_expense_immutable` untuk memastikan integritas keuangan SPPG terjamin pasca-approval.
    - Lakukan seed data kategori standar pada `expense_categories`.
*   **Fase 2: Implementasi Modul Keuangan (E-05)** (2 Hari)
    - Buat modal interaktif `ExpenseFormModal.tsx` dengan integrasi FileReader kamera.
    - Susun halaman `keuangan/page.tsx` dengan dashboard rekap status (Pending, Approved, Rejected).
    - Hubungkan dengan hook/API Supabase untuk memuat real-time data keuangan.
*   **Fase 3: Pembuatan Komponen Laporan & Agregasi (E-06)** (2 Hari)
    - Buat komponen layout visual reusable `ReportSection.tsx`.
    - Susun dashboard agregasi `laporan/page.tsx` untuk menampilkan data komprehensif.
    - Sediakan pengisian kesimpulan lapangan, kronologi kendala, dan unggah foto dokumentasi penutupan dapur.
*   **Fase 4: Uji Coba Kepatuhan & Keamanan** (1 Hari)
    - Verifikasi bahwa data keuangan yang berstatus `approved` menolak seluruh operasi `UPDATE` database akibat adanya trigger.
    - Pastikan tombol kirim laporan harian terkunci (*disabled*) jika ulasan kesimpulan kosong atau foto dapur bersih belum diunggah.

---

## ✅ Checklist Verifikasi Hasil Implementasi

Tugaskan junior developer / AI model Anda untuk mencentang checklist ini demi menjamin kualitas pengerjaan sudah 100% sempurna:

- [ ] **Desain Soft-UI Edusync**: Latar belakang aplikasi menggunakan warna `#F3F6FD` dan seluruh kartu menggunakan `rounded-[20px]` dengan bayangan tipis menyebar (`rgba(0,0,0,0.02)`).
- [ ] **Sistem Input & Kompresi Foto**: File struk kasbon dan foto kebersihan dapur berhasil terunggah dan memiliki preview instan pada browser mobile.
- [ ] **Immutability Keuangan Terjamin**: Coba lakukan edit/update data pengeluaran yang berstatus `approved` melalui SQL Editor / API Client. Database harus memicu error trigger `Pengeluaran yang sudah diproses tidak dapat diubah`.
- [ ] **Validasi Laporan Sebelum Submit**: Tombol submit pada Laporan Harian terkunci jika ulasan kesimpulan kosong atau foto dapur bersih belum diunggah.
- [ ] **Kondisi Laporan Setelah Submit**: Setelah laporan dikirim, status laporan berubah menjadi `submitted` dan seluruh input ulasan, kronologi, serta unggah foto terkunci (*disabled / read-only*).
