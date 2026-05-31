# Panduan Implementasi Design System "Edusync" (Dashboard Style)

Dokumen ini berisi panduan teknis langkah-demi-langkah (step-by-step) untuk mengimplementasikan design system baru berdasarkan mockup dashboard premium **Edusync** pada aplikasi Next.js 16 + Tailwind CSS v4 + shadcn/ui.

Panduan ini dirancang sangat detail agar dapat dieksekusi dengan mudah oleh **Junior Programmer** atau **Model AI (seperti GPT-3.5 / Gemini Flash)** secara presisi tanpa kebingungan.

---

## 🎨 Analisis Estetika Visual & Token Desain

Berdasarkan desain Edusync, estetika yang ingin dicapai adalah **Modern Soft-UI** dengan kontras warna yang hidup dan sudut melengkung yang bersahabat (*highly rounded*).

### 1. Palet Warna (Color Palette)
*   **Base Background (Latar Belakang Utama)**: Abu-abu kebiruan yang sangat lembut (`#F3F6FD` / HSL: `220, 50%, 97%`). Memberikan kesan bersih, premium, dan tidak melelahkan mata dibanding putih pekat.
*   **Card Background**: Putih bersih (`#FFFFFF`) untuk memisahkan konten dari base background dengan kontras yang kuat.
*   **Warna Utama (Primary Blue)**: Biru Royal yang hidup (`#1860F2` / HSL: `220, 89%, 52%`). Digunakan untuk tombol utama, indikator aktif, dan aksen penting.
*   **Warna Kedua (Secondary Amber/Gold)**: Kuning emas hangat (`#FFC23C` / HSL: `41, 100%, 62%`). Digunakan sebagai warna latar belakang kartu statistik tertentu, grafik pencapaian, dan elemen perhatian.
*   **Teks Utama (Primary Text)**: Charcoal Gelap (`#1B1D21` / HSL: `220, 10%, 12%`) untuk tingkat keterbacaan yang tinggi.
*   **Teks Redup (Muted Text)**: Slate Gray Cool (`#6E7A8A` / HSL: `215, 12%, 48%`) untuk label, tanggal, dan deskripsi sekunder.
*   **Border & Divider**: Abu-abu kebiruan halus (`#E4E9F2` / HSL: `220, 30%, 92%`).

### 2. Sudut & Bayangan (Border Radius & Shadows)
*   **Batas Kartu (Card Corner)**: Melengkung tebal dengan radius `rounded-[20px]` (atau `1.25rem`).
*   **Batas Tombol & Input**: `rounded-xl` (`12px` / `0.75rem`) atau `rounded-full` untuk elemen berbentuk pil.
*   **Bayangan Kartu (Card Shadow)**: Sangat halus dan menyebar luas untuk memberi efek kedalaman tanpa terlihat kotor:
    `shadow-[0_8px_30px_rgb(0,0,0,0.02)]` atau `shadow-sm` yang disesuaikan.

---

## 🛠️ Langkah Demi Langkah Implementasi

### Langkah 1: Perbarui Konfigurasi Theme & CSS Global
Karena proyek ini menggunakan **Tailwind CSS v4**, konfigurasi tema tidak lagi menggunakan `tailwind.config.js` melainkan langsung dideklarasikan di dalam file CSS menggunakan direktif `@theme` di dalam file `src/app/globals.css`.

Buka file [src/app/globals.css](file:///Users/ardi/Developments/GITHUB/dapurteman/src/app/globals.css) dan perbarui isinya menjadi seperti berikut:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-sans);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  
  /* Tambahkan kustomisasi warna khusus Edusync */
  --color-edusync-blue: #1860F2;
  --color-edusync-gold: #FFC23C;
  --color-edusync-bg: #F3F6FD;
  --color-edusync-text: #1B1D21;
  --color-edusync-muted: #6E7A8A;
  --color-edusync-border: #E4E9F2;

  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  
  /* Update radius untuk estetika Edusync yang soft & rounded */
  --radius-sm: 0.5rem;      /* 8px */
  --radius-md: 0.75rem;     /* 12px untuk tombol/input */
  --radius-lg: 1.0rem;      /* 16px */
  --radius-xl: 1.25rem;     /* 20px untuk Card utama */
  --radius-2xl: 1.5rem;     /* 24px */
}

:root {
  /* HSL / OKLCH mapping untuk shadcn/ui */
  --background: oklch(0.97 0.01 245); /* Lembut, sedikit kebiruan #F3F6FD */
  --foreground: oklch(0.18 0.01 240); /* Charcoal Gelap #1B1D21 */
  
  --card: oklch(1 0 0); /* Putih bersih */
  --card-foreground: oklch(0.18 0.01 240);

  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.18 0.01 240);

  /* Set primary ke Edusync Royal Blue (#1860F2) */
  --primary: oklch(0.52 0.23 260); 
  --primary-foreground: oklch(1 0 0);

  /* Set secondary ke Edusync Warm Gold/Amber (#FFC23C) */
  --secondary: oklch(0.83 0.19 82);
  --secondary-foreground: oklch(0.18 0.01 240);

  --muted: oklch(0.95 0.01 240);
  --muted-foreground: oklch(0.53 0.02 240); /* Cool Slate Gray */

  --accent: oklch(0.95 0.01 240);
  --accent-foreground: oklch(0.52 0.23 260);

  --destructive: oklch(0.577 0.245 27.325);
  
  --border: oklch(0.93 0.01 245); /* Tipis lembut #E4E9F2 */
  --input: oklch(0.93 0.01 245);
  --ring: oklch(0.52 0.23 260 / 30%); /* Efek fokus biru royal transparan */
  
  --radius: 1.25rem; /* Default 20px */
  
  /* Sidebar styles matching Edusync (Putih bersih dengan active text biru) */
  --sidebar: oklch(1 0 0);
  --sidebar-foreground: oklch(0.45 0.02 240);
  --sidebar-primary: oklch(0.52 0.23 260);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.96 0.02 245);
  --sidebar-accent-foreground: oklch(0.52 0.23 260);
  --sidebar-border: oklch(0.95 0.01 245);
  --sidebar-ring: oklch(0.52 0.23 260 / 30%);
}

.dark {
  /* Skema Gelap (Opsional, sesuaikan jika dibutuhkan di kemudian hari) */
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    /* Set base background ke abu kebiruan lembut */
    @apply bg-background text-foreground antialiased;
  }
  html {
    @apply font-sans;
  }
}
```

---

### Langkah 2: Kustomisasi Komponen shadcn/ui

Agar junior programmer atau model AI dapat langsung menggunakan pustaka shadcn tanpa merusak style mockup, ubah/sesuaikan komponen dasar berikut di folder `src/components/ui/`:

#### 1. Perbarui Komponen Card (`src/components/ui/card.tsx`)
Buka file [card.tsx](file:///Users/ardi/Developments/GITHUB/dapurteman/src/components/ui/card.tsx). Pastikan kodenya menghasilkan sudut melengkung sempurna (`rounded-xl` atau `rounded-2xl`) dan bayangan yang sangat lembut.

*   Ubah kelas pembungkus `Card` agar menggunakan border tipis transparan dan bayangan lembut Edusync:
    ```tsx
    const Card = React.forwardRef<
      HTMLDivElement,
      React.HTMLAttributes<HTMLDivElement>
    >(({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-edusync-border/40 bg-card text-card-foreground shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]",
          className
        )}
        {...props}
      />
    ))
    ```

#### 2. Perbarui Komponen Button (`src/components/ui/button.tsx`)
Buka file [button.tsx](file:///Users/ardi/Developments/GITHUB/dapurteman/src/components/ui/button.tsx). Tambahkan varian khusus untuk tombol bertema Edusync.

*   Modifikasi bagian `buttonVariants` di `cva(...)` untuk menambahkan estetika tombol Edusync:
    ```tsx
    const buttonVariants = cva(
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] transition-transform duration-100",
      {
        variants: {
          variant: {
            // Tombol Utama Biru Royal Edusync
            default:
              "bg-edusync-blue text-white shadow-sm hover:bg-edusync-blue/90",
            // Tombol Sekunder Emas Edusync
            gold:
              "bg-edusync-gold text-edusync-text shadow-sm hover:bg-edusync-gold/90",
            destructive:
              "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
            outline:
              "border border-edusync-border bg-background text-edusync-text hover:bg-edusync-bg hover:text-edusync-blue",
            secondary:
              "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline",
          },
          size: {
            default: "h-11 px-5 py-2",
            sm: "h-9 rounded-md px-3 text-xs",
            lg: "h-12 rounded-xl px-8",
            icon: "h-10 w-10 rounded-full",
          },
        },
        defaultVariants: {
          variant: "default",
          size: "default",
        },
      }
    )
    ```

---

### Langkah 3: Struktur Layout & Grid Halaman Utama
Untuk mempermudah pembuatan kerangka halaman utama, instruksikan pembuatan tata letak grid 3 kolom seperti pada gambar mockup:

1.  **Sidebar Kiri (Lebar: ~260px)**:
    *   Warna background: Putih bersih (`bg-white`).
    *   Berisi logo **Edusync** (Biru) dan daftar navigasi vertical.
    *   Menu aktif disorot dengan warna teks biru royal (`text-edusync-blue`) dan ikon biru royal.
2.  **Konten Utama Tengah (Flex-1 / Grid)**:
    *   Latar belakang: Abu kebiruan lembut (`bg-background`).
    *   Bagian Atas: Header Dashboard + Search Bar (Input pencarian putih melengkung dengan tombol mikrofon/pencarian berwarna emas).
    *   Bagian Tengah: Grid Kartu Statistik (4 kolom):
        *   Kartu 1 (Kuning-Emas): "1,738 Students" dengan ikon panah melingkar hitam.
        *   Kartu 2 (Kuning-Emas): "179 Teachers" dengan ikon panah.
        *   Kartu 3 (Kuning-Emas): "165 Staffs" dengan ikon panah.
        *   Kartu 4 (Biru Royal): "893 Awards" dengan warna teks putih dan ikon panah putih.
    *   Bagian Bawah: Grid Grafik:
        *   Kolom Grafik Donut (Siswa Perempuan vs Laki-laki) - lebar 1/3.
        *   Kolom Grafik Garis (Pendapatan & Pengeluaran) - lebar 2/3.
        *   Kolom Grafik Batang (Kehadiran Mingguan) - lebar 1/2.
        *   Kolom List Aktivitas Siswa - lebar 1/2.
        *   Kolom Papan Pengumuman - lebar 1/2.
        *   Kolom Daftar Pesan - lebar 1/2.
3.  **Sidebar Kanan (Lebar: ~340px)**:
    *   Warna background: Sangat bersih atau abu-abu transparan tipis.
    *   Profil Admin: Foto sirkular + nama "Brandon Septimus" + teks "Admin".
    *   Widget Kalender Mini: Tanggal aktif terpilih dilingkari dengan Biru Royal.
    *   Upcoming Events: Daftar kartu agenda dengan aksen vertikal garis tebal warna Kuning-Emas di sisi kiri.
    *   Recent Activity: List aktivitas terbaru dengan avatar mini.

---

### Langkah 4: Panduan Visual Elemen Kustom

Berikut kode snippet referensi agar junior programmer atau AI dapat mencontoh langsung teknik styling visual premium:

#### A. Kode Struktur Stat Card Top Grid
Kartu statistik atas memiliki struktur melengkung yang cantik. Contoh implementasi untuk 1 kartu statistik kuning:

```tsx
import { ArrowUpRight } from "lucide-react";

export function StatCard({ title, value, variant = "gold" }: { title: string, value: string, variant?: "gold" | "blue" }) {
  const isBlue = variant === "blue";
  return (
    <div 
      className={cn(
        "p-6 rounded-[20px] flex justify-between items-center transition-transform hover:scale-[1.02] duration-200",
        isBlue ? "bg-edusync-blue text-white" : "bg-edusync-gold text-edusync-text"
      )}
    >
      <div className="flex flex-col gap-1">
        <span className={cn("text-2xl font-bold tracking-tight", isBlue ? "text-white" : "text-edusync-text")}>
          {value}
        </span>
        <span className={cn("text-xs font-medium uppercase tracking-wider", isBlue ? "text-white/80" : "text-edusync-muted")}>
          {title}
        </span>
      </div>
      <div className={cn("p-2 rounded-full", isBlue ? "bg-white/20 text-white" : "bg-edusync-text/10 text-edusync-text")}>
        <ArrowUpRight className="h-5 w-5" />
      </div>
    </div>
  );
}
```

#### B. Search Bar Premium
Search bar di bagian atas dashboard memiliki input pencarian yang rapi dengan tombol aksi beraksen emas di sisi kanan.

```tsx
import { Search, Mic } from "lucide-react";

export function SearchBar() {
  return (
    <div className="flex items-center gap-3 w-full max-w-md">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-edusync-muted" />
        <input 
          type="text" 
          placeholder="Search anything..." 
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-edusync-border/60 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-edusync-blue/30 focus:border-edusync-blue transition-all"
        />
      </div>
      <button className="h-11 w-11 flex items-center justify-center rounded-xl bg-edusync-gold text-edusync-text hover:bg-edusync-gold/90 active:scale-95 transition-all">
        <Mic className="h-4 w-4" />
      </button>
    </div>
  );
}
```

#### C. Card Agenda dengan Aksen Garis Kuning (Upcoming Events)
Kartu agenda di sidebar kanan memiliki garis aksen kuning di sisi kiri yang tebal:

```tsx
export function EventCard({ date, time, title, subtitle }: { date: string, time: string, title: string, subtitle: string }) {
  return (
    <div className="flex items-stretch bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] border border-edusync-border/40 overflow-hidden hover:border-edusync-blue/30 transition-all">
      {/* Garis Aksen Emas Tebal di Kiri */}
      <div className="w-1.5 bg-edusync-gold" />
      <div className="flex-1 p-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 bg-edusync-gold/20 text-edusync-text font-bold text-[10px] rounded">
            {date}
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
```

---

## 📊 Integrasi Grafik (Charts)

Mockup Edusync sangat mengandalkan visual grafik yang rapi. Gunakan pustaka **Recharts** (biasa digunakan pada shadcn/ui) dengan panduan warna berikut:

1.  **Donut Chart (Students)**:
    *   Gunakan komponen `PieChart` dengan `innerRadius={60}` dan `outerRadius={80}`.
    *   Warna Section Laki-laki (Boys): `#1860F2` (Biru Royal)
    *   Warna Section Perempuan (Girls): `#FFC23C` (Kuning-Emas)
    *   Di tengah lingkaran, letakkan teks bertumpuk: `Total` (ukuran kecil, redup) di atas dan `427` (ukuran besar, tebal, gelap) di bawah.
2.  **Line Chart (Earnings vs Expenses)**:
    *   Gunakan komponen `AreaChart` dengan kurva halus (`type="monotone"`).
    *   Warna Garis Earnings: `#FFC23C` (Emas) dengan gradient fill `fill="url(#colorEarnings)"` transparan ke bawah.
    *   Warna Garis Expenses: `#1860F2` (Biru Royal) dengan gradient fill `fill="url(#colorExpenses)"` transparan ke bawah.
3.  **Bar Chart (Attendance)**:
    *   Gunakan komponen `BarChart` bertumpuk (*stacked*) atau berdampingan.
    *   Ubah ujung atas batang menjadi melengkung dengan menambahkan properti `radius={[6, 6, 0, 0]}` pada komponen `<Bar />`.
    *   Warna Present: `#1860F2` (Biru Royal)
    *   Warna Absent: `#FFC23C` (Kuning-Emas)

---

## ✅ Checklist Verifikasi untuk Junior Developer / AI

Gunakan daftar periksa berikut untuk memastikan hasil pengerjaan sudah 100% sesuai dengan mockup Edusync:

*   [ ] **Theme Setup**: CSS variables pada `src/app/globals.css` sudah dideklarasikan sesuai panduan, menggunakan base background `#F3F6FD`.
*   [ ] **Radius Konsistensi**: Kartu utama menggunakan radius besar (`rounded-[20px]` / `1.25rem`), sedangkan tombol dan input menggunakan `rounded-xl` (`12px` / `0.75rem`).
*   [ ] **Varian Warna**: Komponen `Button` memiliki varian default (Biru Royal `#1860F2`) dan varian `gold` (Emas `#FFC23C`).
*   [ ] **Grid Halaman**: Grid 3 kolom sudah terbagi rata (Sidebar Kiri, Konten Utama Tengah, Sidebar Kanan) dan bersifat responsif pada layar tablet/mobile.
*   [ ] **Efek Bayangan**: Tidak ada bayangan abu-abu gelap kasar. Semua kartu menggunakan bayangan sangat tipis dan menyebar (`rgba(0,0,0,0.02)`).
*   [ ] **Gaya Grafik**: Grafik batang memiliki sudut atas membulat (`radius`), grafik garis berupa area halus dengan gradasi warna memudar di bawah garis.
*   [ ] **Aksen Khusus**: Setiap kartu event di sidebar memiliki garis vertikal tebal warna emas (`bg-edusync-gold`) di sisi paling kiri.
