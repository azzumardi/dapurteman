# Bug Fix Plan: Missing `Button` Import

**Tanggal**: 29 Mei 2026  
**Severity**: High (halaman `/kepala/dashboard` tidak dapat dirender)  
**Assignee**: Junior Programmer / AI Model

---

## Deskripsi Bug

Halaman Kepala SPPG Dashboard (`/kepala/dashboard`) mengalami **Runtime ReferenceError** karena komponen `Button` dari `shadcn/ui` digunakan di dalam JSX tetapi tidak pernah di-import di bagian atas file.

```
ReferenceError: Can't find variable: Button
  at KepalaDashboard (src/app/kepala/dashboard/page.tsx:150:20)
```

---

## Root Cause

File [src/app/kepala/dashboard/page.tsx](file:///Users/ardi/Developments/GITHUB/dapurteman/src/app/kepala/dashboard/page.tsx) meng-import beberapa komponen UI, namun **lupa menyertakan `Button`** pada baris import:

```tsx
// Baris 3–5 saat ini (SALAH — Button tidak ada):
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, CheckCircle2, AlertTriangle, Users, Package, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
```

Sementara `Button` digunakan di baris 150–151:

```tsx
<Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8 text-xs">Setujui</Button>
<Button size="sm" variant="outline" className="h-8 text-xs">Tolak</Button>
```

---

## Solusi

Tambahkan import `Button` dari `@/components/ui/button` pada baris import di bagian atas file.

### File yang Perlu Diubah

**`src/app/kepala/dashboard/page.tsx`**

**Perubahan yang harus dilakukan** — tambahkan 1 baris import baru:

```diff
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Activity, Clock, CheckCircle2, AlertTriangle, Users, Package, TrendingUp } from "lucide-react";
  import { Badge } from "@/components/ui/badge";
+ import { Button } from "@/components/ui/button";
```

> [!IMPORTANT]
> Komponen `@/components/ui/button` sudah tersedia di project ini (dibuat saat inisialisasi `shadcn/ui`). Tidak perlu instalasi tambahan apapun — **cukup tambahkan baris import saja**.

---

## Langkah Implementasi

1. Buka file `src/app/kepala/dashboard/page.tsx`.
2. Temukan blok import di baris 3–5.
3. Tambahkan baris berikut tepat setelah import `Badge`:
   ```tsx
   import { Button } from "@/components/ui/button";
   ```
4. Simpan file.
5. Verifikasi dengan menjalankan `npm run dev` dan membuka `http://localhost:3000/kepala/dashboard` di browser — halaman harus tampil tanpa error.

---

## Verifikasi

- [ ] `npm run dev` berjalan tanpa error di terminal.
- [ ] Halaman `http://localhost:3000/kepala/dashboard` ter-render dengan benar.
- [ ] Dua tombol "Setujui" dan "Tolak" di bagian **Perlu Persetujuan** terlihat dan tampil normal.
- [ ] Tidak ada error baru yang muncul di console browser.

---

## Commit yang Disarankan

Setelah perbaikan selesai, commit dengan pesan yang jelas:

```bash
git add src/app/kepala/dashboard/page.tsx
git commit -m "fix: add missing Button import in kepala dashboard page"
git push
```
