# ASLAP SaaS — Implementation Blueprint

**Technical Architecture & Development Guide v1.0**
*Prepared for Engineering Team | Mei 2026*

---

## Table of Contents

1. [Executive Technical Summary](#1-executive-technical-summary)
2. [Recommended Architecture](#2-recommended-architecture)
3. [System Design Overview](#3-system-design-overview)
4. [Monorepo Structure](#4-monorepo-structure)
5. [Database Design](#5-database-design)
6. [Authentication & RBAC](#6-authentication--rbac)
7. [Epic E-01: Manajemen Produksi Harian](#7-epic-e-01-manajemen-produksi-harian)
8. [Epic E-02: QC & Manajemen Stok Bahan Baku](#8-epic-e-02-qc--manajemen-stok-bahan-baku)
9. [Epic E-03: Manajemen Porsi & Pemorsian](#9-epic-e-03-manajemen-porsi--pemorsian)
10. [Epic E-04: Koordinasi Distribusi](#10-epic-e-04-koordinasi-distribusi)
11. [Epic E-05: Pengelolaan Operasional & Keuangan](#11-epic-e-05-pengelolaan-operasional--keuangan)
12. [Epic E-06: Pelaporan & Dokumentasi Otomatis](#12-epic-e-06-pelaporan--dokumentasi-otomatis)
13. [Epic E-07: Monitoring Tim & Kinerja](#13-epic-e-07-monitoring-tim--kinerja)
14. [Epic E-08: Edukasi Gizi & Komunikasi Eksternal](#14-epic-e-08-edukasi-gizi--komunikasi-eksternal)
15. [Frontend Architecture](#15-frontend-architecture)
16. [PWA & Offline Architecture](#16-pwa--offline-architecture)
17. [Realtime Architecture](#17-realtime-architecture)
18. [Background Jobs & Queue](#18-background-jobs--queue)
19. [DevOps & Infrastructure](#19-devops--infrastructure)
20. [Ambiguity Register & Technical Assumptions](#20-ambiguity-register--technical-assumptions)
21. [Task Breakdown Master List](#21-task-breakdown-master-list)

---

## 1. Executive Technical Summary

### Stack Pilihan (Final)

| Layer | Technology | Justification |
|---|---|---|
| Frontend | Next.js 16 App Router + TypeScript | SSR/SSG untuk dashboard, client-side untuk PWA Aslap |
| Mobile/PWA | Next.js PWA (next-pwa) + Service Worker | Offline-first, installable, zero native app cost di Phase 1 |
| Styling | TailwindCSS + shadcn/ui | Konsisten, accessible, rapid development |
| State | Zustand (global) + TanStack Query (server) | Clean separation: UI state vs server state |
| Validation | Zod + React Hook Form | Type-safe end-to-end schema sharing |
| Backend | Supabase (Auth + DB + Realtime + Storage) | Managed, scalable, RLS built-in, Indonesian region |
| Database | PostgreSQL via Supabase | Multi-tenant RLS, JSONB untuk fleksibilitas |
| Realtime | Supabase Realtime (Postgres Changes + Broadcast) | Zero infra overhead, WebSocket built-in |
| Background Jobs | Supabase Edge Functions + pg_cron | Laporan otomatis, notifikasi, aggregasi |
| File Storage | Supabase Storage | Foto QC, bukti pengeluaran, foto distribusi |
| Notifications | Supabase + FCM via Edge Function | Push notification Android/iOS |
| Maps | Google Maps JavaScript API | Rute distribusi, tracking lokasi |
| CI/CD | GitHub Actions | Staging → Production dengan canary deploy |
| Infrastructure | Supabase Cloud (Jakarta region via AWS ap-southeast-1) | Data sovereignty, low latency |
| Monitoring | Sentry (frontend) + Supabase Logs + Uptime Robot | Error tracking + uptime SLA 99.5% |

### Keputusan Arsitektur Utama

1. **Supabase sebagai BaaS utama** — Menggantikan custom Node.js microservices untuk Phase 1–3. Ini menurunkan operational overhead secara drastis sambil tetap mendukung 10.000+ SPPG via connection pooling (PgBouncer built-in).

2. **Monorepo dengan Turborepo** — Satu repo untuk web app, shared types, dan Supabase functions. Junior developer tidak perlu manage multiple repos.

3. **Multi-tenant via Row Level Security (RLS)** — Setiap query otomatis difilter per `sppg_id`. Tidak ada risiko data cross-tenant.

4. **Offline-first PWA untuk Aslap** — IndexedDB (Dexie.js) sebagai local store, background sync ketika online. Modul E-01, E-02, E-03 wajib berjalan offline.

5. **Auto-generated Reports via pg_cron** — Laporan harian di-trigger pukul 20.00 WIB via database cron job, bukan manual Aslap.

### Critical Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Supabase free tier limits | Start dengan Pro plan ($25/mo per project); gunakan satu project per environment |
| RLS performance pada 10.000+ SPPG | Index pada `sppg_id` di semua tabel utama; explain analyze sebelum deploy |
| PWA offline sync conflicts | Optimistic locking dengan `updated_at` timestamp; conflict UI untuk Aslap |
| Photo upload bandwidth di 2G | Client-side compress (browser-image-compression) sebelum upload, max 500KB per foto |

---

## 2. Recommended Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   Aslap PWA     │    │ Kepala SPPG     │                    │
│  │  (Mobile-first) │    │ Web Dashboard   │                    │
│  │  Next.js + SW   │    │ Next.js         │                    │
│  │  IndexedDB      │    │                 │                    │
│  └────────┬────────┘    └────────┬────────┘                    │
│           │                      │                             │
│  ┌─────────────────────────────────────────┐                   │
│  │         KPPG/BGN Analytics Dashboard    │                   │
│  │         Next.js (Desktop-optimized)     │                   │
│  └─────────────────┬───────────────────────┘                   │
└────────────────────┼────────────────────────────────────────── ┘
                     │ HTTPS / WSS
┌────────────────────┼────────────────────────────────────────── ┐
│                SUPABASE PLATFORM (Jakarta/ap-southeast-1)       │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Supabase    │  │  PostgREST   │  │  Supabase Realtime   │  │
│  │    Auth      │  │  Auto API    │  │  (WS Broadcast +     │  │
│  │  (JWT+RLS)   │  │              │  │   Postgres Changes)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                         │   │
│  │   Multi-tenant RLS | Audit Trail | pg_cron jobs          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Supabase    │  │  Edge        │  │  Supabase Storage    │  │
│  │  Storage     │  │  Functions   │  │  (Photos, Docs)      │  │
│  │              │  │  (Deno)      │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                     │
┌────────────────────┼─────────────────────────────────────────── ┐
│              THIRD-PARTY INTEGRATIONS                           │
│                                                                 │
│  Google Maps API   │  Firebase FCM   │  BGN REST API (future)  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow: Aslap Input → Dashboard KPPG

```
Aslap Input (PWA)
    │
    ├── [Offline] → IndexedDB (Dexie.js) → Background Sync Queue
    │                                           │
    │                                           ▼ (when online)
    └── [Online]  → TanStack Query mutation → Supabase PostgREST
                                                │
                                                ├── RLS validates sppg_id
                                                ├── Inserts to PostgreSQL
                                                └── Supabase Realtime broadcast
                                                          │
                                              ┌───────────┴───────────┐
                                              │                       │
                                        Kepala SPPG            KPPG Dashboard
                                        Dashboard              (aggregate view)
                                        (WS subscriber)        (WS subscriber)
```

---

## 3. System Design Overview

### Domain Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│ Domain          │ Tables                    │ Owner              │
├─────────────────────────────────────────────────────────────────┤
│ Identity        │ profiles, sppg, sppg_     │ Auth module        │
│                 │ members                   │                    │
├─────────────────────────────────────────────────────────────────┤
│ Production      │ production_sessions,      │ E-01               │
│                 │ station_updates           │                    │
├─────────────────────────────────────────────────────────────────┤
│ Inventory       │ ingredients, stock_       │ E-02               │
│                 │ ledger, deliveries, qc_   │                    │
│                 │ records, waste_logs       │                    │
├─────────────────────────────────────────────────────────────────┤
│ Portions        │ portion_sessions,         │ E-03               │
│                 │ portion_items, recipes,   │                    │
│                 │ recipe_ingredients        │                    │
├─────────────────────────────────────────────────────────────────┤
│ Distribution    │ distribution_plans,       │ E-04               │
│                 │ deliveries_ext, delivery_ │                    │
│                 │ confirmations, issues     │                    │
├─────────────────────────────────────────────────────────────────┤
│ Finance         │ expense_categories,       │ E-05               │
│                 │ expenses, expense_        │                    │
│                 │ approvals                 │                    │
├─────────────────────────────────────────────────────────────────┤
│ Reporting       │ daily_reports, report_    │ E-06               │
│                 │ attachments               │                    │
├─────────────────────────────────────────────────────────────────┤
│ HR              │ team_members, shifts,     │ E-07               │
│                 │ attendances, evaluations  │                    │
├─────────────────────────────────────────────────────────────────┤
│ Education       │ education_content,        │ E-08               │
│                 │ edu_sessions, announcements│                   │
└─────────────────────────────────────────────────────────────────┘
```

### Multi-Tenant Strategy

**Keputusan:** Shared Database, Shared Schema dengan Row Level Security (RLS).

Setiap tabel operasional memiliki kolom `sppg_id UUID NOT NULL`. RLS policy memastikan user hanya bisa membaca dan menulis data SPPG mereka sendiri. KPPG/BGN memiliki policy berbeda yang mengizinkan akses lintas SPPG dalam wilayah koordinasi mereka.

```sql
-- Contoh RLS Policy Pattern (berlaku di semua tabel)
ALTER TABLE production_sessions ENABLE ROW LEVEL SECURITY;

-- Aslap & Kepala SPPG: hanya data SPPG sendiri
CREATE POLICY "sppg_isolation" ON production_sessions
  FOR ALL USING (
    sppg_id = (
      SELECT sppg_id FROM sppg_members
      WHERE user_id = auth.uid() AND is_active = true
      LIMIT 1
    )
  );

-- KPPG: bisa lihat semua SPPG di bawah koordinasinya
CREATE POLICY "kppg_read" ON production_sessions
  FOR SELECT USING (
    sppg_id IN (
      SELECT s.id FROM sppg s
      JOIN kppg_sppg_assignments ksa ON ksa.sppg_id = s.id
      WHERE ksa.kppg_user_id = auth.uid()
    )
  );
```

---

## 4. Monorepo Structure

```
aslap-saas/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Test + lint on PR
│   │   ├── deploy-staging.yml        # Auto-deploy main → staging
│   │   └── deploy-production.yml     # Manual trigger → production
│   └── CODEOWNERS
│
├── apps/
│   └── web/                          # Next.js App (semua user personas)
│       ├── app/
│       │   ├── (auth)/               # Login, register, forgot-password
│       │   │   ├── login/page.tsx
│       │   │   └── layout.tsx
│       │   ├── (app)/                # Protected routes
│       │   │   ├── layout.tsx        # Auth guard + sidebar
│       │   │   ├── aslap/            # Aslap mobile-first views
│       │   │   │   ├── produksi/
│       │   │   │   ├── stok/
│       │   │   │   ├── porsi/
│       │   │   │   ├── distribusi/
│       │   │   │   ├── keuangan/
│       │   │   │   ├── laporan/
│       │   │   │   └── tim/
│       │   │   ├── kepala/           # Kepala SPPG dashboard
│       │   │   │   ├── dashboard/
│       │   │   │   ├── laporan/
│       │   │   │   ├── keuangan/
│       │   │   │   └── tim/
│       │   │   ├── kppg/             # KPPG/BGN analytics
│       │   │   │   ├── dashboard/
│       │   │   │   ├── sppg/
│       │   │   │   └── laporan/
│       │   │   └── admin/            # Super admin (tenant management)
│       │   ├── api/                  # Next.js API routes (thin proxy + webhook handlers)
│       │   │   ├── webhooks/
│       │   │   └── export/
│       │   ├── layout.tsx
│       │   └── globals.css
│       ├── components/
│       │   ├── ui/                   # shadcn/ui components (auto-generated)
│       │   ├── shared/               # Cross-domain reusable components
│       │   │   ├── PageHeader/
│       │   │   ├── DataTable/
│       │   │   ├── StatusBadge/
│       │   │   ├── PhotoUpload/
│       │   │   ├── OfflineIndicator/
│       │   │   └── EmptyState/
│       │   ├── aslap/                # Aslap-specific mobile components
│       │   │   ├── TaskCard/
│       │   │   ├── StationChecklist/
│       │   │   ├── QuickInput/
│       │   │   └── BottomNav/
│       │   └── dashboard/            # Dashboard-specific components
│       │       ├── MetricCard/
│       │       ├── RealtimeTable/
│       │       ├── MapView/
│       │       └── ChartWidget/
│       ├── lib/
│       │   ├── supabase/
│       │   │   ├── client.ts         # Browser Supabase client
│       │   │   ├── server.ts         # Server component client
│       │   │   └── middleware.ts     # Session refresh middleware
│       │   ├── dexie/
│       │   │   ├── db.ts             # IndexedDB schema (Dexie)
│       │   │   └── sync.ts           # Offline sync logic
│       │   ├── hooks/                # Domain-specific custom hooks
│       │   │   ├── useProduction.ts
│       │   │   ├── useStock.ts
│       │   │   ├── useDistribution.ts
│       │   │   └── ...
│       │   ├── stores/               # Zustand stores
│       │   │   ├── auth.store.ts
│       │   │   ├── offline.store.ts
│       │   │   └── notification.store.ts
│       │   └── utils/
│       │       ├── date.ts
│       │       ├── format.ts
│       │       └── compress-image.ts
│       ├── public/
│       │   ├── manifest.json         # PWA manifest
│       │   ├── sw.js                 # Service Worker (generated by next-pwa)
│       │   └── icons/
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── tsconfig.json
│
├── packages/
│   ├── types/                        # Shared TypeScript types
│   │   ├── database.types.ts         # Auto-generated dari Supabase CLI
│   │   ├── domain.types.ts           # Business domain types
│   │   └── api.types.ts              # API request/response types
│   ├── validations/                  # Shared Zod schemas
│   │   ├── production.schema.ts
│   │   ├── stock.schema.ts
│   │   ├── distribution.schema.ts
│   │   └── ...
│   └── constants/                    # Shared constants
│       ├── roles.ts
│       ├── status-codes.ts
│       └── offline-keys.ts
│
├── supabase/
│   ├── migrations/                   # SQL migrations (versioned)
│   │   ├── 0001_init_schema.sql
│   │   ├── 0002_rls_policies.sql
│   │   ├── 0003_seed_data.sql
│   │   └── ...
│   ├── functions/                    # Edge Functions (Deno)
│   │   ├── generate-daily-report/
│   │   ├── push-notification/
│   │   ├── sync-bgn/
│   │   └── export-pdf/
│   ├── seed/
│   │   └── seed.sql
│   └── config.toml
│
├── scripts/
│   ├── generate-types.sh             # supabase gen types typescript
│   ├── reset-db.sh
│   └── deploy.sh
│
├── turbo.json
├── package.json                      # Root workspace
└── .env.example
```

---

## 5. Database Design

### 5.1 Core Principles

- **Multi-tenancy**: `sppg_id UUID` di semua tabel operasional, enforced via RLS
- **Audit Trail**: Kolom `created_at`, `updated_at`, `created_by`, `updated_by` di semua tabel
- **Soft Delete**: Kolom `deleted_at TIMESTAMPTZ NULL` — row tidak pernah dihapus fisik
- **Immutable Records**: Tabel seperti `expenses` dan `qc_records` tidak bisa di-UPDATE setelah approval; gunakan INSERT-only pattern
- **FIFO Stock**: `stock_ledger` adalah event sourcing table — balance dihitung dari sum, bukan di-update

### 5.2 Complete Relational Schema

```sql
-- ============================================================
-- SCHEMA: IDENTITY & TENANT MANAGEMENT
-- ============================================================

-- Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- SPPG (Satuan Pelayanan Pemenuhan Gizi) — Tenant unit
CREATE TABLE sppg (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            VARCHAR(20) UNIQUE NOT NULL,         -- e.g. "SPPG-JKT-001"
  name            VARCHAR(255) NOT NULL,
  address         TEXT,
  city            VARCHAR(100),
  province        VARCHAR(100),
  kppg_id         UUID REFERENCES kppg(id),
  target_portions_daily INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  metadata        JSONB DEFAULT '{}',                  -- flexible extra fields
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ NULL
);
CREATE INDEX idx_sppg_kppg ON sppg(kppg_id);
CREATE INDEX idx_sppg_active ON sppg(is_active) WHERE deleted_at IS NULL;

-- KPPG (Koordinator Pelayanan Pemenuhan Gizi)
CREATE TABLE kppg (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            VARCHAR(20) UNIQUE NOT NULL,
  name            VARCHAR(255) NOT NULL,
  region          VARCHAR(100),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       VARCHAR(255) NOT NULL,
  phone           VARCHAR(20),
  avatar_url      TEXT,
  preferred_language VARCHAR(10) DEFAULT 'id',
  fcm_token       TEXT,                                -- Firebase push notification token
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Role enum
CREATE TYPE user_role AS ENUM (
  'aslap',
  'jurutama_masak',
  'pengawas_keuangan',
  'kepala_sppg',
  'kppg_staff',
  'bgn_staff',
  'super_admin'
);

-- SPPG Members (user ↔ sppg mapping with role)
CREATE TABLE sppg_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  role            user_role NOT NULL,
  is_active       BOOLEAN DEFAULT true,
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  left_at         TIMESTAMPTZ NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sppg_id, user_id)
);
CREATE INDEX idx_sppg_members_user ON sppg_members(user_id);
CREATE INDEX idx_sppg_members_sppg ON sppg_members(sppg_id);

-- Satuan Pendidikan (schools receiving food)
CREATE TABLE schools (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  code            VARCHAR(20),
  name            VARCHAR(255) NOT NULL,
  address         TEXT,
  latitude        DECIMAL(10,8),
  longitude       DECIMAL(11,8),
  pic_name        VARCHAR(255),
  pic_phone       VARCHAR(20),
  school_type     VARCHAR(20) CHECK (school_type IN ('PAUD','SD','SMP','SMA','LAINNYA')),
  target_portions_by_age JSONB DEFAULT '{}',          -- {balita: 50, sd: 200, smp: 150, ...}
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ NULL
);
CREATE INDEX idx_schools_sppg ON schools(sppg_id);

-- ============================================================
-- SCHEMA: PRODUCTION (E-01)
-- ============================================================

-- Production Sessions (one per day per SPPG)
CREATE TABLE production_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  session_date    DATE NOT NULL,
  target_portions INT NOT NULL DEFAULT 0,
  status          VARCHAR(20) DEFAULT 'ongoing'
                    CHECK (status IN ('ongoing','completed','cancelled')),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  notes           TEXT,
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sppg_id, session_date)
);
CREATE INDEX idx_prod_sessions_sppg_date ON production_sessions(sppg_id, session_date DESC);

-- Station Types enum
CREATE TYPE station_type AS ENUM (
  'persiapan_bahan',
  'masak_nasi',
  'masak_sayur',
  'masak_lauk',
  'pemorsian',
  'packaging',
  'quality_check_final'
);

-- Station Updates (event-sourced: insert only, no update)
CREATE TABLE station_updates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID NOT NULL REFERENCES production_sessions(id),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),        -- denormalized for RLS perf
  station         station_type NOT NULL,
  status          VARCHAR(20) NOT NULL
                    CHECK (status IN ('not_started','in_progress','completed','delayed')),
  notes           TEXT,
  photo_url       TEXT,
  portions_count  INT,                                       -- for masak/pemorsian stations
  recorded_by     UUID NOT NULL REFERENCES profiles(id),
  recorded_at     TIMESTAMPTZ DEFAULT NOW(),
  -- Offline sync fields
  local_id        TEXT,                                      -- client-generated ID for dedup
  synced_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_station_updates_session ON station_updates(session_id, recorded_at DESC);
CREATE INDEX idx_station_updates_sppg ON station_updates(sppg_id);

-- Production Schedule Template (per SPPG, configurable)
CREATE TABLE production_schedule_templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  station         station_type NOT NULL,
  scheduled_start TIME NOT NULL,
  scheduled_end   TIME NOT NULL,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sppg_id, station)
);

-- ============================================================
-- SCHEMA: INVENTORY & QC (E-02)
-- ============================================================

-- Ingredient Master
CREATE TABLE ingredients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  name            VARCHAR(255) NOT NULL,
  unit            VARCHAR(20) NOT NULL,                      -- kg, liter, pcs, dll
  category        VARCHAR(50),                               -- sayuran, bumbu, protein, dll
  min_stock_threshold DECIMAL(10,3) DEFAULT 0,
  current_stock   DECIMAL(10,3) DEFAULT 0,                   -- denormalized, updated via trigger
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ NULL
);
CREATE INDEX idx_ingredients_sppg ON ingredients(sppg_id) WHERE deleted_at IS NULL;

-- Stock Ledger (event-sourced, INSERT only)
CREATE TABLE stock_ledger (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  ingredient_id   UUID NOT NULL REFERENCES ingredients(id),
  entry_type      VARCHAR(20) NOT NULL
                    CHECK (entry_type IN ('in_delivery','out_production','out_waste','adjustment')),
  quantity        DECIMAL(10,3) NOT NULL,                    -- positive = masuk, negatif = keluar
  reference_id    UUID,                                      -- delivery_id or production_session_id
  reference_type  VARCHAR(30),
  notes           TEXT,
  recorded_by     UUID NOT NULL REFERENCES profiles(id),
  recorded_at     TIMESTAMPTZ DEFAULT NOW(),
  local_id        TEXT                                       -- offline dedup
);
CREATE INDEX idx_stock_ledger_sppg_ingredient ON stock_ledger(sppg_id, ingredient_id, recorded_at DESC);

-- Supplier Deliveries
CREATE TABLE supplier_deliveries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  delivery_date   DATE NOT NULL,
  supplier_name   VARCHAR(255),
  purchase_order_ref VARCHAR(100),
  status          VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending','partially_received','received','rejected')),
  received_by     UUID REFERENCES profiles(id),
  received_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_deliveries_sppg ON supplier_deliveries(sppg_id, delivery_date DESC);

-- QC Records per delivery item (INSERT only after approval)
CREATE TABLE qc_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  delivery_id     UUID NOT NULL REFERENCES supplier_deliveries(id),
  ingredient_id   UUID NOT NULL REFERENCES ingredients(id),
  expected_qty    DECIMAL(10,3),
  actual_qty      DECIMAL(10,3) NOT NULL,
  unit            VARCHAR(20),
  quality_rating  SMALLINT CHECK (quality_rating BETWEEN 1 AND 5),
  status          VARCHAR(20) NOT NULL
                    CHECK (status IN ('accepted','rejected','partial')),
  rejection_reason TEXT,
  photo_urls      TEXT[] DEFAULT '{}',
  recorded_by     UUID NOT NULL REFERENCES profiles(id),
  recorded_at     TIMESTAMPTZ DEFAULT NOW(),
  local_id        TEXT
);
CREATE INDEX idx_qc_records_sppg ON qc_records(sppg_id);
CREATE INDEX idx_qc_records_delivery ON qc_records(delivery_id);

-- Waste Logs
CREATE TABLE waste_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  session_id      UUID REFERENCES production_sessions(id),
  waste_date      DATE NOT NULL,
  waste_type      VARCHAR(20) NOT NULL CHECK (waste_type IN ('organic','inorganic','food')),
  ingredient_id   UUID REFERENCES ingredients(id),
  quantity        DECIMAL(10,3),
  unit            VARCHAR(20),
  estimated_cost  DECIMAL(12,2),
  notes           TEXT,
  recorded_by     UUID NOT NULL REFERENCES profiles(id),
  recorded_at     TIMESTAMPTZ DEFAULT NOW(),
  local_id        TEXT
);
CREATE INDEX idx_waste_logs_sppg_date ON waste_logs(sppg_id, waste_date DESC);

-- ============================================================
-- SCHEMA: PORTIONS (E-03)
-- ============================================================

-- Recipe Master
CREATE TABLE recipes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID REFERENCES sppg(id),               -- NULL = BGN standard recipe
  name            VARCHAR(255) NOT NULL,
  age_group       VARCHAR(20) NOT NULL
                    CHECK (age_group IN ('balita','paud','sd','smp','sma','ibu_hamil','ibu_menyusui')),
  standard_weight_gram INT,                               -- Berat per porsi standar AKG
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe Ingredients
CREATE TABLE recipe_ingredients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id       UUID NOT NULL REFERENCES recipes(id),
  ingredient_id   UUID NOT NULL REFERENCES ingredients(id),
  quantity_per_portion DECIMAL(10,4) NOT NULL,
  unit            VARCHAR(20) NOT NULL
);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);

-- Daily Portion Sessions
CREATE TABLE portion_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  session_date    DATE NOT NULL,
  production_session_id UUID REFERENCES production_sessions(id),
  total_produced  INT DEFAULT 0,
  total_distributed INT DEFAULT 0,
  portions_by_age JSONB DEFAULT '{}',                     -- {balita:50, sd:200, ...}
  status          VARCHAR(20) DEFAULT 'open'
                    CHECK (status IN ('open','closed','reported')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sppg_id, session_date)
);
CREATE INDEX idx_portion_sessions_sppg_date ON portion_sessions(sppg_id, session_date DESC);

-- Portion Items (checklist per school)
CREATE TABLE portion_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portion_session_id UUID NOT NULL REFERENCES portion_sessions(id),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  school_id       UUID NOT NULL REFERENCES schools(id),
  packed_portions INT NOT NULL DEFAULT 0,
  checklist       JSONB DEFAULT '{}',                     -- {nasi:true, lauk:true, sayur:true, buah:false, susu:true}
  is_complete     BOOLEAN DEFAULT false,
  packed_by       UUID REFERENCES profiles(id),
  packed_at       TIMESTAMPTZ,
  local_id        TEXT
);
CREATE INDEX idx_portion_items_session ON portion_items(portion_session_id);

-- ============================================================
-- SCHEMA: DISTRIBUTION (E-04)
-- ============================================================

-- Distribution Plans (one per day)
CREATE TABLE distribution_plans (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  plan_date       DATE NOT NULL,
  status          VARCHAR(20) DEFAULT 'draft'
                    CHECK (status IN ('draft','in_progress','completed','cancelled')),
  vehicle_info    JSONB DEFAULT '{}',                     -- {driver:..., plate:..., type:...}
  created_by      UUID REFERENCES profiles(id),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sppg_id, plan_date)
);
CREATE INDEX idx_dist_plans_sppg_date ON distribution_plans(sppg_id, plan_date DESC);

-- Distribution Route Stops
CREATE TABLE distribution_stops (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id         UUID NOT NULL REFERENCES distribution_plans(id),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  school_id       UUID NOT NULL REFERENCES schools(id),
  stop_order      INT NOT NULL,
  portion_item_id UUID REFERENCES portion_items(id),
  estimated_arrival TIMESTAMPTZ,
  actual_arrival  TIMESTAMPTZ,
  status          VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending','departed','arrived','confirmed','issue')),
  -- Confirmation
  confirmed_by_name VARCHAR(255),
  confirmed_at    TIMESTAMPTZ,
  confirmation_method VARCHAR(20)
                    CHECK (confirmation_method IN ('qr','pin','manual')),
  confirmation_token TEXT,                                -- QR code / PIN value
  confirmation_photo_url TEXT,
  -- Issues
  has_issue       BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  local_id        TEXT
);
CREATE INDEX idx_dist_stops_plan ON distribution_stops(plan_id, stop_order);
CREATE INDEX idx_dist_stops_sppg ON distribution_stops(sppg_id);

-- Distribution Issues
CREATE TABLE distribution_issues (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  stop_id         UUID NOT NULL REFERENCES distribution_stops(id),
  issue_type      VARCHAR(50),                            -- 'late','missing_portions','quality','other'
  description     TEXT NOT NULL,
  photo_urls      TEXT[] DEFAULT '{}',
  severity        VARCHAR(20) DEFAULT 'medium'
                    CHECK (severity IN ('low','medium','high')),
  status          VARCHAR(20) DEFAULT 'open'
                    CHECK (status IN ('open','acknowledged','resolved')),
  reported_by     UUID NOT NULL REFERENCES profiles(id),
  resolved_by     UUID REFERENCES profiles(id),
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_dist_issues_sppg ON distribution_issues(sppg_id);

-- ============================================================
-- SCHEMA: FINANCE (E-05)
-- ============================================================

-- Expense Categories
CREATE TABLE expense_categories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID REFERENCES sppg(id),               -- NULL = system default
  name            VARCHAR(100) NOT NULL,
  code            VARCHAR(20),
  is_active       BOOLEAN DEFAULT true
);

-- Expenses (INSERT only after approval — immutable)
CREATE TABLE expenses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  expense_date    DATE NOT NULL,
  category_id     UUID NOT NULL REFERENCES expense_categories(id),
  amount          DECIMAL(14,2) NOT NULL,
  description     TEXT NOT NULL,
  receipt_urls    TEXT[] DEFAULT '{}',
  status          VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected')),
  submitted_by    UUID NOT NULL REFERENCES profiles(id),
  submitted_at    TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  local_id        TEXT
);
CREATE INDEX idx_expenses_sppg_date ON expenses(sppg_id, expense_date DESC);
CREATE INDEX idx_expenses_status ON expenses(status);

-- Expense Approvals (INSERT only)
CREATE TABLE expense_approvals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id      UUID NOT NULL REFERENCES expenses(id),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  action          VARCHAR(20) NOT NULL CHECK (action IN ('approved','rejected')),
  notes           TEXT,
  approved_by     UUID NOT NULL REFERENCES profiles(id),
  approved_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_expense_approvals_expense ON expense_approvals(expense_id);

-- ============================================================
-- SCHEMA: REPORTING (E-06)
-- ============================================================

-- Daily Reports (auto-generated, Aslap review + submit)
CREATE TABLE daily_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  report_date     DATE NOT NULL,
  -- Aggregated data (snapshotted at generation time)
  total_produced  INT DEFAULT 0,
  total_distributed INT DEFAULT 0,
  total_waste_kg  DECIMAL(10,3) DEFAULT 0,
  total_expenses  DECIMAL(14,2) DEFAULT 0,
  on_time_deliveries INT DEFAULT 0,
  late_deliveries INT DEFAULT 0,
  issues_count    INT DEFAULT 0,
  -- Free-form sections
  summary_notes   TEXT,
  issues_narrative TEXT,
  action_taken    TEXT,
  -- Workflow
  status          VARCHAR(20) DEFAULT 'draft'
                    CHECK (status IN ('draft','reviewed','submitted','acknowledged')),
  generated_at    TIMESTAMPTZ,
  reviewed_by     UUID REFERENCES profiles(id),
  reviewed_at     TIMESTAMPTZ,
  submitted_by    UUID REFERENCES profiles(id),
  submitted_at    TIMESTAMPTZ,
  bgn_pushed_at   TIMESTAMPTZ,                            -- timestamp push ke BGN API
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sppg_id, report_date)
);
CREATE INDEX idx_daily_reports_sppg_date ON daily_reports(sppg_id, report_date DESC);

-- Report Attachments
CREATE TABLE report_attachments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id       UUID NOT NULL REFERENCES daily_reports(id),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  file_url        TEXT NOT NULL,
  file_type       VARCHAR(20),                            -- 'photo','video','document'
  category        VARCHAR(50),                            -- 'produksi','distribusi','qc','lainnya'
  gps_lat         DECIMAL(10,8),
  gps_lng         DECIMAL(11,8),
  taken_at        TIMESTAMPTZ,
  uploaded_by     UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_attachments_report ON report_attachments(report_id);

-- ============================================================
-- SCHEMA: HR & TEAM (E-07)
-- ============================================================

-- Team Members (distinct from system users — includes non-digital workers)
CREATE TABLE team_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  user_id         UUID REFERENCES profiles(id),           -- NULL if no app access
  full_name       VARCHAR(255) NOT NULL,
  role            VARCHAR(50),                            -- 'packaging','distribusi','kebersihan','pencuci'
  phone           VARCHAR(20),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ NULL
);
CREATE INDEX idx_team_members_sppg ON team_members(sppg_id) WHERE deleted_at IS NULL;

-- Shifts
CREATE TABLE shifts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  team_member_id  UUID NOT NULL REFERENCES team_members(id),
  shift_date      DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  role_on_shift   VARCHAR(50),
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_shifts_sppg_date ON shifts(sppg_id, shift_date DESC);

-- Attendances
CREATE TABLE attendances (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  team_member_id  UUID NOT NULL REFERENCES team_members(id),
  shift_id        UUID REFERENCES shifts(id),
  attendance_date DATE NOT NULL,
  check_in_at     TIMESTAMPTZ,
  check_out_at    TIMESTAMPTZ,
  selfie_url      TEXT,
  check_in_lat    DECIMAL(10,8),
  check_in_lng    DECIMAL(11,8),
  status          VARCHAR(20) DEFAULT 'present'
                    CHECK (status IN ('present','absent','late','half_day')),
  recorded_by     UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_attendances_sppg_date ON attendances(sppg_id, attendance_date DESC);

-- Evaluations
CREATE TABLE evaluations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  team_member_id  UUID NOT NULL REFERENCES team_members(id),
  eval_date       DATE NOT NULL,
  scores          JSONB NOT NULL DEFAULT '{}',            -- {kecepatan:4, kebersihan:5, kedisiplinan:3}
  overall_score   DECIMAL(3,1),
  notes           TEXT,
  evaluated_by    UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_evaluations_sppg ON evaluations(sppg_id, eval_date DESC);

-- ============================================================
-- SCHEMA: EDUCATION & COMMUNICATION (E-08)
-- ============================================================

-- Education Content Library
CREATE TABLE education_content (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by_sppg_id UUID REFERENCES sppg(id),           -- NULL = BGN global content
  title           VARCHAR(255) NOT NULL,
  content_type    VARCHAR(20) CHECK (content_type IN ('infographic','video','article','quiz')),
  topic           VARCHAR(100),
  target_age_group VARCHAR(50),
  file_url        TEXT,
  thumbnail_url   TEXT,
  qr_code_url     TEXT,
  is_published    BOOLEAN DEFAULT false,
  published_at    TIMESTAMPTZ,
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Education Sessions (log per delivery)
CREATE TABLE education_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  school_id       UUID NOT NULL REFERENCES schools(id),
  content_id      UUID REFERENCES education_content(id),
  session_date    DATE NOT NULL,
  beneficiaries_count INT DEFAULT 0,
  delivery_method VARCHAR(20) CHECK (delivery_method IN ('qr_screen','printout','verbal','app')),
  notes           TEXT,
  conducted_by    UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_edu_sessions_sppg ON education_sessions(sppg_id, session_date DESC);

-- Announcements (SPPG → Schools)
CREATE TABLE announcements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID NOT NULL REFERENCES sppg(id),
  school_id       UUID REFERENCES schools(id),            -- NULL = broadcast to all schools
  title           VARCHAR(255) NOT NULL,
  body            TEXT NOT NULL,
  priority        VARCHAR(10) DEFAULT 'normal'
                    CHECK (priority IN ('low','normal','high')),
  is_read         BOOLEAN DEFAULT false,
  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ NULL
);
CREATE INDEX idx_announcements_sppg ON announcements(sppg_id, created_at DESC);

-- ============================================================
-- TRIGGERS: AUTO-UPDATE stock & timestamps
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$ DECLARE t TEXT;
BEGIN FOR t IN SELECT unnest(ARRAY[
  'sppg','profiles','sppg_members','schools','production_sessions',
  'ingredients','supplier_deliveries','portion_sessions','distribution_plans',
  'distribution_stops','expenses','daily_reports','team_members','recipes',
  'education_content'
]) LOOP
  EXECUTE format('CREATE TRIGGER trg_updated_at BEFORE UPDATE ON %I
    FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t);
END LOOP; END $$;

-- Auto-update ingredient current_stock from ledger
CREATE OR REPLACE FUNCTION update_ingredient_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ingredients SET current_stock = (
    SELECT COALESCE(SUM(quantity), 0) FROM stock_ledger
    WHERE ingredient_id = NEW.ingredient_id AND sppg_id = NEW.sppg_id
  ) WHERE id = NEW.ingredient_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock_update
AFTER INSERT ON stock_ledger
FOR EACH ROW EXECUTE FUNCTION update_ingredient_stock();

-- ============================================================
-- RLS POLICIES (Core Pattern)
-- ============================================================

-- Helper function: get user's sppg_id
CREATE OR REPLACE FUNCTION get_user_sppg_id()
RETURNS UUID AS $$
  SELECT sppg_id FROM sppg_members
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: get user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM sppg_members
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS on all operational tables
ALTER TABLE production_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE station_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE qc_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE portion_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portion_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Standard SPPG isolation policy (applied to all operational tables)
-- INSERT via template:
-- CREATE POLICY "sppg_all_{table}" ON {table}
--   FOR ALL USING (sppg_id = get_user_sppg_id());
--   WITH CHECK (sppg_id = get_user_sppg_id());

-- KPPG Read Policy (applied to reporting tables)
-- CREATE POLICY "kppg_read_{table}" ON {table}
--   FOR SELECT USING (
--     get_user_role() IN ('kppg_staff','bgn_staff','super_admin')
--     OR sppg_id = get_user_sppg_id()
--   );

-- ============================================================
-- pg_cron JOBS
-- ============================================================

-- Auto-generate daily reports at 20:00 WIB (13:00 UTC)
SELECT cron.schedule(
  'generate-daily-reports',
  '0 13 * * *',
  $$SELECT net.http_post(
    url := current_setting('app.edge_function_url') || '/generate-daily-report',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key')),
    body := jsonb_build_object('trigger', 'cron')
  )$$
);

-- Alert low stock check every 6 hours
SELECT cron.schedule(
  'check-low-stock',
  '0 */6 * * *',
  $$SELECT net.http_post(
    url := current_setting('app.edge_function_url') || '/check-low-stock',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key')),
    body := '{}'::jsonb
  )$$
);
```

### 5.3 Offline Sync Strategy

**Problem:** Aslap bekerja di lingkungan dengan koneksi intermiten. Data harus tetap bisa diinput dan disinkronisasi tanpa konflik.

**Solution:** Optimistic Local-First dengan `local_id` deduplication.

```typescript
// packages/types/offline.types.ts
export interface OfflineQueueItem {
  local_id: string;           // UUID generated client-side
  table: string;
  operation: 'insert' | 'update';
  payload: Record<string, unknown>;
  created_at: number;         // Unix timestamp
  retry_count: number;
  last_error?: string;
}

// lib/dexie/db.ts
import Dexie, { Table } from 'dexie';

export class ASLAPDatabase extends Dexie {
  offlineQueue!: Table<OfflineQueueItem>;
  stationUpdates!: Table<LocalStationUpdate>;
  stockEntries!: Table<LocalStockEntry>;
  portionItems!: Table<LocalPortionItem>;

  constructor() {
    super('aslap_offline_v1');
    this.version(1).stores({
      offlineQueue: '++id, table, created_at, retry_count',
      stationUpdates: 'local_id, session_id, synced',
      stockEntries: 'local_id, ingredient_id, synced',
      portionItems: 'local_id, portion_session_id, synced',
    });
  }
}

export const db = new ASLAPDatabase();

// Sync logic on reconnect
export async function syncOfflineQueue(supabase: SupabaseClient) {
  const pending = await db.offlineQueue
    .where('retry_count').below(3)
    .toArray();

  for (const item of pending) {
    try {
      const { error } = await supabase
        .from(item.table)
        .upsert(item.payload, { onConflict: 'local_id', ignoreDuplicates: true });

      if (!error) {
        await db.offlineQueue.delete(item.id!);
      }
    } catch (e) {
      await db.offlineQueue.update(item.id!, {
        retry_count: item.retry_count + 1,
        last_error: String(e),
      });
    }
  }
}
```

### 5.4 Audit Trail Strategy

```sql
-- Semua tabel memiliki created_at, updated_at, created_by
-- Tabel sensitive (expenses, qc_records) memiliki audit_log terpisah

CREATE TABLE audit_log (
  id              BIGSERIAL PRIMARY KEY,
  table_name      VARCHAR(100) NOT NULL,
  record_id       UUID NOT NULL,
  sppg_id         UUID,
  action          VARCHAR(10) NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  old_values      JSONB,
  new_values      JSONB,
  changed_by      UUID REFERENCES profiles(id),
  changed_at      TIMESTAMPTZ DEFAULT NOW(),
  ip_address      INET
);
CREATE INDEX idx_audit_log_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_sppg ON audit_log(sppg_id, changed_at DESC);

-- Trigger function untuk audit
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log(table_name, record_id, sppg_id, action, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, NEW.sppg_id, 'INSERT', to_jsonb(NEW), auth.uid());
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log(table_name, record_id, sppg_id, action, old_values, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, NEW.sppg_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger ke tabel sensitive
CREATE TRIGGER audit_expenses AFTER INSERT OR UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_qc_records AFTER INSERT OR UPDATE ON qc_records
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_daily_reports AFTER INSERT OR UPDATE ON daily_reports
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

---

## 6. Authentication & RBAC

### 6.1 Authentication Flow

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/packages/types/database.types';

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
};

// middleware.ts (Next.js)
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient(request);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session && request.nextUrl.pathname.startsWith('/(app)')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based redirect
  if (session) {
    const role = session.user.app_metadata?.role;
    const path = request.nextUrl.pathname;

    if (path.startsWith('/aslap') && !['aslap','jurutama_masak'].includes(role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  return NextResponse.next();
}
```

### 6.2 RBAC Permission Matrix

```typescript
// packages/constants/roles.ts
export const PERMISSIONS = {
  // Production (E-01)
  'production:read':    ['aslap','jurutama_masak','kepala_sppg','kppg_staff','bgn_staff'],
  'production:write':   ['aslap','jurutama_masak'],
  'production:manage':  ['kepala_sppg'],

  // Inventory (E-02)
  'stock:read':         ['aslap','pengawas_keuangan','kepala_sppg','kppg_staff','bgn_staff'],
  'stock:write':        ['aslap'],
  'stock:manage':       ['kepala_sppg','pengawas_keuangan'],

  // Distribution (E-04)
  'distribution:read':  ['aslap','kepala_sppg','kppg_staff','bgn_staff'],
  'distribution:write': ['aslap'],
  'distribution:confirm': ['aslap'],                    // school confirmation via QR

  // Finance (E-05)
  'expense:submit':     ['aslap'],
  'expense:approve':    ['kepala_sppg'],
  'expense:report':     ['pengawas_keuangan','kepala_sppg','kppg_staff'],

  // Reports (E-06)
  'report:generate':    ['aslap'],
  'report:submit':      ['aslap'],
  'report:view_all':    ['kppg_staff','bgn_staff'],

  // HR (E-07)
  'team:read':          ['aslap','kepala_sppg'],
  'team:manage':        ['kepala_sppg','pengawas_keuangan'],

  // Analytics (KPPG/BGN)
  'analytics:sppg':     ['kppg_staff','bgn_staff','super_admin'],
  'analytics:national': ['bgn_staff','super_admin'],
} as const;

export type Permission = keyof typeof PERMISSIONS;
export type UserRole = typeof PERMISSIONS[Permission][number];

// Utility hook
export function usePermission(permission: Permission): boolean {
  const { user } = useAuthStore();
  return PERMISSIONS[permission].includes(user?.role as UserRole) ?? false;
}
```

### 6.3 JWT Custom Claims

```sql
-- Supabase hook: customize JWT with user role
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB AS $$
DECLARE
  claims JSONB;
  user_role user_role;
  user_sppg_id UUID;
BEGIN
  claims := event->'claims';

  SELECT sm.role, sm.sppg_id INTO user_role, user_sppg_id
  FROM sppg_members sm
  WHERE sm.user_id = (event->>'user_id')::UUID AND sm.is_active = TRUE
  LIMIT 1;

  claims := jsonb_set(claims, '{app_metadata}', jsonb_build_object(
    'role', user_role,
    'sppg_id', user_sppg_id
  ));

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

---

## 7. Epic E-01: Manajemen Produksi Harian

### 7.1 Objective

Aslap dapat memantau dan mencatat progress setiap station produksi secara real-time dari satu tampilan mobile. Kepala SPPG melihat update dalam < 5 detik.

### 7.2 Scope

- Production session per hari (satu SPPG satu session)
- 7 station types dengan status tracking
- Notifikasi otomatis keterlambatan > 15 menit
- Timeline aktual vs scheduled
- Offline capable (PWA)

### 7.3 User Flow

```
Aslap membuka app → Tap "Produksi Hari Ini"
  → Jika belum ada session → Auto-create session (ambil target dari SPPG config)
  → Tampil 7 station cards dengan status (Not Started/In Progress/Completed/Delayed)
  → Tap station card → Update status + optional notes + optional photo
  → Update tersimpan (online: langsung ke Supabase; offline: IndexedDB → sync queue)
  → Kepala SPPG dashboard auto-update via Supabase Realtime
  → Jika station > 15 menit dari jadwal → Push notification ke Aslap & Kepala SPPG
```

### 7.4 Technical Flow

```typescript
// hooks/useProductionSession.ts
export function useProductionSession(date: string) {
  const supabase = createClient();
  const sppgId = useAuthStore(s => s.sppgId);

  // Get or create today's session
  return useQuery({
    queryKey: ['production-session', sppgId, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_sessions')
        .select(`
          *,
          station_updates(*, recorded_by:profiles(full_name))
        `)
        .eq('sppg_id', sppgId)
        .eq('session_date', date)
        .maybeSingle();

      if (!data && !error) {
        // Auto-create
        const { data: newSession } = await supabase
          .from('production_sessions')
          .insert({ sppg_id: sppgId, session_date: date, status: 'ongoing' })
          .select().single();
        return newSession;
      }
      return data;
    }
  });
}

// Station update mutation (offline-aware)
export function useUpdateStation() {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();

  return useMutation({
    mutationFn: async (update: StationUpdateInput) => {
      const local_id = crypto.randomUUID();
      const payload = { ...update, local_id };

      if (isOnline) {
        const { data, error } = await supabase
          .from('station_updates')
          .insert(payload)
          .select().single();
        if (error) throw error;
        return data;
      } else {
        // Save to IndexedDB
        await db.offlineQueue.add({
          local_id,
          table: 'station_updates',
          operation: 'insert',
          payload,
          created_at: Date.now(),
          retry_count: 0,
        });
        return payload; // Return optimistic
      }
    },
    onMutate: async (update) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['production-session'] });
      const prev = queryClient.getQueryData(['production-session', ...]);
      queryClient.setQueryData(['production-session', ...], (old) => ({
        ...old,
        station_updates: [...(old?.station_updates ?? []), update]
      }));
      return { prev };
    },
    onError: (_, __, ctx) => {
      queryClient.setQueryData(['production-session', ...], ctx?.prev);
    },
  });
}
```

### 7.5 API Endpoints

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/rest/v1/production_sessions?sppg_id=eq.{id}&session_date=eq.{date}` | Get/create today's session | All SPPG roles |
| POST | `/rest/v1/production_sessions` | Create new session | aslap |
| POST | `/rest/v1/station_updates` | Record station update | aslap, jurutama_masak |
| GET | `/rest/v1/station_updates?session_id=eq.{id}` | Get updates for session | All SPPG roles |
| PATCH | `/rest/v1/production_sessions?id=eq.{id}` | Update session status | aslap, kepala_sppg |

> **Note:** Semua endpoint adalah PostgREST auto-generated dari Supabase. No custom server needed.

### 7.6 Frontend Structure

```
app/(app)/aslap/produksi/
├── page.tsx                          # Main production view
├── [sessionId]/
│   └── page.tsx                      # Detailed timeline view
└── components/
    ├── ProductionStationCard.tsx      # Station card dengan status
    ├── StationUpdateModal.tsx         # Modal update status
    ├── ProductionTimeline.tsx         # Gantt-style timeline
    ├── ProductionProgressBar.tsx      # Overall progress indicator
    └── DelayBanner.tsx               # Alert banner saat ada delay
```

```typescript
// components/aslap/ProductionStationCard.tsx
interface Props {
  station: StationType;
  latestUpdate?: StationUpdate;
  scheduledTime?: { start: string; end: string };
  onUpdate: (station: StationType) => void;
}

export function ProductionStationCard({ station, latestUpdate, scheduledTime, onUpdate }: Props) {
  const status = latestUpdate?.status ?? 'not_started';
  const isDelayed = checkDelay(latestUpdate, scheduledTime);

  return (
    <Card
      className={cn(
        "touch-manipulation cursor-pointer active:scale-98 transition-transform",
        STATUS_COLORS[status],
        isDelayed && "ring-2 ring-red-500"
      )}
      onClick={() => onUpdate(station)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StationIcon station={station} className="w-8 h-8" />
            <div>
              <p className="font-semibold text-sm">{STATION_LABELS[station]}</p>
              {scheduledTime && (
                <p className="text-xs text-muted-foreground">
                  Jadwal: {scheduledTime.start} – {scheduledTime.end}
                </p>
              )}
            </div>
          </div>
          <StatusBadge status={status} />
        </div>
        {latestUpdate && (
          <p className="text-xs text-muted-foreground mt-2">
            Update: {formatRelative(latestUpdate.recorded_at)}
            {isDelayed && <span className="text-red-500 ml-2">⚠ Terlambat</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

### 7.7 Realtime Behavior

```typescript
// hooks/useProductionRealtime.ts
export function useProductionRealtime(sessionId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`production:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'station_updates',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['production-session'] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);
}
```

### 7.8 Delay Notification (Edge Function)

```typescript
// supabase/functions/check-production-delays/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const today = new Date().toISOString().split('T')[0];

  // Get all active sessions for today
  const { data: sessions } = await supabase
    .from('production_sessions')
    .select(`
      id, sppg_id,
      production_schedule_templates(station, scheduled_start),
      station_updates(station, status, recorded_at)
    `)
    .eq('session_date', today)
    .eq('status', 'ongoing');

  for (const session of sessions ?? []) {
    for (const template of session.production_schedule_templates) {
      const latestUpdate = session.station_updates
        .filter(u => u.station === template.station)
        .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))[0];

      const scheduledStart = new Date(`${today}T${template.scheduled_start}`);
      const now = new Date();
      const delayMinutes = (now.getTime() - scheduledStart.getTime()) / 60000;

      if (delayMinutes > 15 && (!latestUpdate || latestUpdate.status === 'not_started')) {
        await sendPushNotification(supabase, session.sppg_id, {
          title: 'Station Terlambat',
          body: `${STATION_LABELS[template.station]} belum dimulai, terlambat ${Math.floor(delayMinutes)} menit`,
          data: { session_id: session.id, station: template.station }
        });
      }
    }
  }

  return new Response('OK');
});
```

### 7.9 Edge Cases

| Scenario | Handling |
|---|---|
| Dua Aslap update station yang sama bersamaan | Last-write-wins; station_updates adalah append-only; latest update yang ditampilkan |
| App ditutup saat ada pending offline writes | Service Worker background sync menggunakan Background Sync API |
| Session sudah completed tapi Aslap coba update | Tampilkan error "Sesi sudah selesai"; allow notes-only update dengan role kepala_sppg |
| Jadwal production_schedule_template belum diisi | Tombol update tetap berfungsi; delay detection di-skip; tampil warning "Jadwal belum dikonfigurasi" |

### 7.10 Testing Checklist

- [ ] Unit: `checkDelay()` function dengan berbagai timezone scenarios
- [ ] Unit: Offline queue deduplication dengan `local_id`
- [ ] Integration: Station update tersimpan ke DB dan trigger realtime
- [ ] Integration: Delay notification Edge Function via pg_cron
- [ ] E2E: Aslap update station offline → reconnect → auto-sync → Kepala SPPG melihat update
- [ ] E2E: Delay notifikasi diterima dalam < 1 menit setelah trigger
- [ ] Performance: 500 concurrent station updates dalam 1 menit (load test)

### 7.11 Task Breakdown

| # | Task | Domain | Complexity | Priority |
|---|---|---|---|---|
| E01-DB-01 | Buat migrations: `production_sessions`, `station_updates`, `production_schedule_templates` | DB | Small | P0 |
| E01-DB-02 | RLS policies untuk semua roles | DB | Small | P0 |
| E01-DB-03 | Seed data: schedule templates default (7 stations) | DB | Small | P0 |
| E01-BE-01 | Edge Function: `check-production-delays` | Backend | Medium | P0 |
| E01-BE-02 | pg_cron job untuk check delays setiap 15 menit | Backend | Small | P0 |
| E01-FE-01 | `ProductionStationCard` component + Storybook | Frontend | Small | P0 |
| E01-FE-02 | `StationUpdateModal` dengan React Hook Form + Zod | Frontend | Small | P0 |
| E01-FE-03 | `useProductionSession` hook + TanStack Query | Frontend | Medium | P0 |
| E01-FE-04 | `useProductionRealtime` Supabase subscription | Frontend | Small | P0 |
| E01-FE-05 | Offline queue integration (Dexie) + Background Sync | Frontend | Large | P0 |
| E01-FE-06 | `ProductionTimeline` Gantt component | Frontend | Medium | P1 |
| E01-FE-07 | Delay notification banner + push notification handler | Frontend | Small | P1 |
| E01-QA-01 | Unit tests untuk hooks dan utilities | QA | Medium | P0 |
| E01-QA-02 | E2E test: offline → online sync flow | QA | Large | P1 |

---

## 8. Epic E-02: QC & Manajemen Stok Bahan Baku

### 8.1 Objective

Digitalisasi penerimaan dan QC bahan baku dari supplier. Stok tercatat akurat via FIFO event-sourcing. Alert otomatis ketika stok mendekati threshold.

### 8.2 User Flow

```
Supplier datang → Aslap buka "Penerimaan Bahan"
  → Pilih/buat Delivery dari supplier
  → Per item: input berat aktual + kondisi (foto wajib) + rating 1-5
  → Submit QC → stock_ledger otomatis ter-update via trigger
  → Jika actual < expected - 5%: notifikasi ke Pengawas Keuangan
  → Jika stok < threshold: alert low-stock
  → Aslap input food waste → stock_ledger berkurang
```

### 8.3 Technical Flow

```typescript
// Zod schema untuk QC record
// packages/validations/stock.schema.ts
export const QCRecordSchema = z.object({
  delivery_id: z.string().uuid(),
  ingredient_id: z.string().uuid(),
  expected_qty: z.number().positive().optional(),
  actual_qty: z.number().positive({ message: "Berat aktual harus lebih dari 0" }),
  unit: z.string().min(1),
  quality_rating: z.number().min(1).max(5),
  status: z.enum(['accepted', 'rejected', 'partial']),
  rejection_reason: z.string().optional(),
  photo_urls: z.array(z.string().url()).min(1, "Minimal 1 foto wajib diupload"),
  local_id: z.string().uuid().default(() => crypto.randomUUID()),
});

export type QCRecordInput = z.infer<typeof QCRecordSchema>;

// Photo upload with client-side compression
// lib/utils/compress-image.ts
import imageCompression from 'browser-image-compression';

export async function compressAndUpload(
  file: File,
  supabase: SupabaseClient,
  sppgId: string
): Promise<string> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.5,         // Max 500KB
    maxWidthOrHeight: 1280,
    useWebWorker: true,
  });

  const fileName = `${sppgId}/qc/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('evidence-photos')
    .upload(fileName, compressed, { cacheControl: '3600', upsert: false });

  if (error) throw error;
  return supabase.storage.from('evidence-photos').getPublicUrl(data.path).data.publicUrl;
}
```

### 8.4 API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/rest/v1/supplier_deliveries?sppg_id=eq.{id}&delivery_date=gte.{date}` | List deliveries |
| POST | `/rest/v1/supplier_deliveries` | Create delivery |
| POST | `/rest/v1/qc_records` | Submit QC record (triggers stock_ledger insert via DB function) |
| GET | `/rest/v1/ingredients?sppg_id=eq.{id}&current_stock=lt.min_stock_threshold` | Low stock items |
| POST | `/rest/v1/waste_logs` | Log food waste |
| GET | `/rest/v1/stock_ledger?ingredient_id=eq.{id}&order=recorded_at.desc&limit=30` | Stock history |

### 8.5 Stock Alert Edge Function

```typescript
// supabase/functions/check-low-stock/index.ts
Deno.serve(async () => {
  const { data: lowStockItems } = await supabase
    .from('ingredients')
    .select('id, name, current_stock, min_stock_threshold, sppg_id, sppg:sppg(name)')
    .filter('current_stock', 'lt', 'min_stock_threshold')
    .eq('is_active', true);

  const grouped = groupBy(lowStockItems, 'sppg_id');

  for (const [sppgId, items] of Object.entries(grouped)) {
    await sendPushNotification(supabase, sppgId, {
      title: `⚠ Stok Menipis — ${items.length} bahan`,
      body: items.slice(0, 3).map(i => i.name).join(', '),
      data: { type: 'low_stock', sppg_id: sppgId }
    });
  }
});
```

### 8.6 Frontend Structure

```
app/(app)/aslap/stok/
├── page.tsx                          # Stock overview + low stock alerts
├── penerimaan/
│   ├── page.tsx                      # Active deliveries
│   └── [deliveryId]/page.tsx         # QC form per delivery
├── riwayat/page.tsx                  # Stock ledger history
├── waste/page.tsx                    # Waste logging
└── components/
    ├── IngredientList.tsx             # Stock levels dengan progress bar
    ├── LowStockAlert.tsx              # Alert card
    ├── QCForm.tsx                     # Multi-item QC form
    ├── PhotoUploadGrid.tsx            # 4-up photo grid dengan compression
    ├── StockLedgerTable.tsx           # History table
    └── WasteLogForm.tsx
```

### 8.7 Task Breakdown

| # | Task | Domain | Complexity | Priority |
|---|---|---|---|---|
| E02-DB-01 | Migrations: `ingredients`, `stock_ledger`, `supplier_deliveries`, `qc_records`, `waste_logs` | DB | Medium | P0 |
| E02-DB-02 | Trigger: auto-update `current_stock` dari `stock_ledger` | DB | Small | P0 |
| E02-DB-03 | DB Function: `submit_qc_record()` — atomic QC + stock insert | DB | Medium | P0 |
| E02-BE-01 | Edge Function: `check-low-stock` + push notification | Backend | Medium | P1 |
| E02-FE-01 | `PhotoUploadGrid` dengan compression (browser-image-compression) | Frontend | Medium | P0 |
| E02-FE-02 | `QCForm` multi-item dengan React Hook Form + Zod | Frontend | Large | P0 |
| E02-FE-03 | `IngredientList` dengan realtime stock update | Frontend | Small | P0 |
| E02-FE-04 | Offline: QC records di Dexie + sync | Frontend | Medium | P0 |
| E02-FE-05 | `StockLedgerTable` dengan infinite scroll | Frontend | Small | P1 |
| E02-FE-06 | `WasteLogForm` + tren grafik mingguan | Frontend | Medium | P1 |
| E02-QA-01 | Test: stock trigger akurasi FIFO | QA | Medium | P0 |
| E02-QA-02 | Test: QC discrepancy > 5% notification | QA | Small | P1 |

---

## 9. Epic E-03: Manajemen Porsi & Pemorsian

### 9.1 Objective

Aslap mencatat jumlah porsi terproduksi dan terdistribusi per hari, per kelompok umur, sesuai standar AKG BGN. Sistem auto-kalkulasi kebutuhan bahan baku berdasarkan target porsi.

### 9.2 Key Technical Decisions

**Ambiguity:** PRD tidak menjelaskan apakah "database resep" dikelola by BGN atau per SPPG.

**Asumsi:** BGN mengelola "master recipes" (`sppg_id IS NULL`). SPPG dapat membuat variasi lokal yang meng-override master. Query menggunakan `COALESCE(sppg_recipe, bgn_master_recipe)`.

### 9.3 Recipe-based Calculation

```typescript
// lib/hooks/usePortionCalc.ts
export function usePortionCalc(targetPortions: PortionsByAge) {
  const { data: recipes } = useQuery({
    queryKey: ['recipes', sppgId],
    queryFn: () => supabase
      .from('recipes')
      .select('*, recipe_ingredients(*, ingredient:ingredients(*))')
      .or(`sppg_id.eq.${sppgId},sppg_id.is.null`)
      .eq('is_active', true)
  });

  const shoppingList = useMemo(() => {
    if (!recipes) return [];

    const totals: Record<string, { name: string; qty: number; unit: string }> = {};

    for (const [ageGroup, count] of Object.entries(targetPortions)) {
      const recipe = recipes.find(r => r.age_group === ageGroup && r.sppg_id === sppgId)
        ?? recipes.find(r => r.age_group === ageGroup && !r.sppg_id);

      if (!recipe) continue;

      for (const ri of recipe.recipe_ingredients) {
        const key = ri.ingredient_id;
        const needed = ri.quantity_per_portion * count;
        totals[key] = {
          name: ri.ingredient.name,
          qty: (totals[key]?.qty ?? 0) + needed,
          unit: ri.unit,
        };
      }
    }

    return Object.values(totals);
  }, [recipes, targetPortions]);

  return { shoppingList };
}
```

### 9.4 Frontend Structure

```
app/(app)/aslap/porsi/
├── page.tsx                          # Daily portion tracker
├── pemorsian/page.tsx                # Checklist per school packaging
├── kalkulasi/page.tsx                # Shopping list calculator
└── components/
    ├── PortionCounter.tsx             # +/- counter per age group
    ├── PortionChecklist.tsx           # Per-school packaging checklist
    ├── ShoppingListCard.tsx           # Ingredient requirement card
    └── PortionSummaryBadge.tsx        # Real-time total badge
```

### 9.5 Task Breakdown

| # | Task | Domain | Complexity | Priority |
|---|---|---|---|---|
| E03-DB-01 | Migrations: `recipes`, `recipe_ingredients`, `portion_sessions`, `portion_items` | DB | Medium | P0 |
| E03-DB-02 | Seed: BGN standard recipes semua age groups | DB | Large | P1 |
| E03-FE-01 | `PortionCounter` component untuk input per age group | Frontend | Small | P0 |
| E03-FE-02 | `usePortionCalc` hook dengan recipe-based calculation | Frontend | Medium | P1 |
| E03-FE-03 | `PortionChecklist` per sekolah dengan submit validation | Frontend | Medium | P1 |
| E03-FE-04 | PDF export shopping list (via Edge Function) | Backend | Medium | P1 |
| E03-QA-01 | Test: kalkulasi bahan baku akurat per resep | QA | Medium | P1 |

---

## 10. Epic E-04: Koordinasi Distribusi

### 10.1 Objective

Otomasi rute distribusi, tracking pengiriman, konfirmasi digital dari sekolah via QR/PIN, dan eskalasi masalah distribusi.

### 10.2 QR Confirmation Flow

```
Aslap generate distribution_plan (rute + estimasi waktu)
  → Per stop: sistem generate unique confirmation_token
  → Aslap tiba di sekolah → update stop status = 'arrived'
  → Tampilkan QR code ke PIC sekolah
  → PIC sekolah scan QR → landing page konfirmasi (no login required)
  → Konfirmasi tersimpan dengan timestamp + IP
  → Realtime update ke Kepala SPPG dashboard
```

```typescript
// API route untuk school confirmation (no auth required)
// app/api/confirm-delivery/[token]/route.ts
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const supabase = createServiceRoleClient(); // service role untuk bypass RLS

  const { data: stop } = await supabase
    .from('distribution_stops')
    .select('id, plan_id, school_id, status')
    .eq('confirmation_token', params.token)
    .eq('status', 'arrived')
    .single();

  if (!stop) {
    return Response.json({ error: 'Token tidak valid atau sudah digunakan' }, { status: 400 });
  }

  await supabase
    .from('distribution_stops')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      confirmation_method: 'qr',
    })
    .eq('id', stop.id);

  return Response.json({ success: true, school_id: stop.school_id });
}
```

### 10.3 Distribution Map Dashboard

```typescript
// components/dashboard/MapView.tsx
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';

export function DistributionMapView({ planId }: { planId: string }) {
  const { data: stops } = useDistributionStops(planId);
  const { data: directions } = useOptimizedRoute(stops);

  return (
    <GoogleMap zoom={12} center={SPPG_CENTER}>
      {stops?.map(stop => (
        <Marker
          key={stop.id}
          position={{ lat: stop.school.latitude, lng: stop.school.longitude }}
          icon={STATUS_ICONS[stop.status]}
          label={String(stop.stop_order)}
        />
      ))}
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
}
```

### 10.4 Task Breakdown

| # | Task | Domain | Complexity | Priority |
|---|---|---|---|---|
| E04-DB-01 | Migrations: `distribution_plans`, `distribution_stops`, `distribution_issues` | DB | Medium | P0 |
| E04-DB-02 | Function: `generate_confirmation_tokens()` untuk batch stops | DB | Small | P0 |
| E04-BE-01 | API route: `/api/confirm-delivery/[token]` (public) | Backend | Small | P0 |
| E04-BE-02 | Edge Function: route optimization via Google Maps Directions API | Backend | Large | P0 |
| E04-FE-01 | Distribution plan creator (rute manual drag-drop) | Frontend | Large | P0 |
| E04-FE-02 | QR code generator + display (qrcode.react) | Frontend | Small | P0 |
| E04-FE-03 | Konfirmasi landing page (public, no auth) | Frontend | Small | P0 |
| E04-FE-04 | `DistributionMapView` Google Maps dengan realtime markers | Frontend | Large | P1 |
| E04-FE-05 | Issue reporting form dengan foto upload | Frontend | Small | P1 |
| E04-FE-06 | Kepala SPPG: real-time delivery dashboard | Frontend | Medium | P1 |
| E04-QA-01 | E2E: QR scan → konfirmasi → realtime update dashboard | QA | Medium | P0 |

---

## 11. Epic E-05: Pengelolaan Operasional & Keuangan

### 11.1 Approval Workflow

```
Aslap input pengeluaran + upload struk → status: 'pending'
  → Notifikasi ke Kepala SPPG (push + in-app)
  → Kepala SPPG approve/reject dengan optional notes
  → Setelah approve: expense TIDAK BISA diedit (immutable)
  → Pengawas Keuangan dapat lihat semua expenses + rekap otomatis
```

### 11.2 Immutable Expense Pattern

```sql
-- Enforce immutability: no UPDATE allowed after approval
CREATE OR REPLACE FUNCTION prevent_expense_update_after_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != 'pending' THEN
    RAISE EXCEPTION 'Pengeluaran yang sudah diproses tidak dapat diubah';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_expense_immutable
BEFORE UPDATE ON expenses
FOR EACH ROW EXECUTE FUNCTION prevent_expense_update_after_approval();
```

### 11.3 Auto Rekap via Edge Function

```typescript
// supabase/functions/generate-expense-report/index.ts
// Dipanggil oleh pg_cron setiap hari 23:59
Deno.serve(async (req) => {
  const { sppg_id, period } = await req.json(); // 'daily' or 'monthly'

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*, category:expense_categories(name,code), expense_approvals(*)')
    .eq('sppg_id', sppg_id)
    .eq('status', 'approved')
    .gte('expense_date', periodStart(period))
    .lte('expense_date', periodEnd(period));

  const breakdown = groupBy(expenses, 'category.code');
  const total = sumBy(expenses, 'amount');

  // Store as JSON in daily_reports
  await supabase
    .from('daily_reports')
    .upsert({
      sppg_id,
      report_date: today(),
      total_expenses: total,
      // expenses_breakdown stored in report metadata JSONB
    });
});
```

### 11.4 Task Breakdown

| # | Task | Domain | Complexity | Priority |
|---|---|---|---|---|
| E05-DB-01 | Migrations: `expense_categories`, `expenses`, `expense_approvals` | DB | Small | P0 |
| E05-DB-02 | Trigger: prevent update after approval | DB | Small | P0 |
| E05-DB-03 | Seed: default expense categories (BBM, gas, air, lainnya) | DB | Small | P0 |
| E05-BE-01 | Edge Function: expense approval notification | Backend | Small | P0 |
| E05-BE-02 | Edge Function: generate expense rekap PDF | Backend | Medium | P1 |
| E05-FE-01 | Expense submission form + struk photo upload | Frontend | Medium | P0 |
| E05-FE-02 | Approval UI untuk Kepala SPPG (approve/reject with notes) | Frontend | Small | P0 |
| E05-FE-03 | Expense dashboard: rekap harian + bulanan dengan chart | Frontend | Medium | P1 |
| E05-QA-01 | Test: immutability trigger setelah approval | QA | Small | P0 |

---

## 12. Epic E-06: Pelaporan & Dokumentasi Otomatis

### 12.1 Objective

Laporan harian ter-generate otomatis pukul 20.00 WIB dari data yang sudah terinput. Aslap hanya perlu review dan submit dalam < 5 menit.

### 12.2 Auto-Generation Logic

```typescript
// supabase/functions/generate-daily-report/index.ts
Deno.serve(async () => {
  const today = getTodayInJakarta(); // Handle WIB timezone

  // Get all active SPPGs
  const { data: sppgs } = await supabase
    .from('sppg')
    .select('id')
    .eq('is_active', true);

  for (const sppg of sppgs ?? []) {
    await generateReportForSPPG(sppg.id, today);
  }
});

async function generateReportForSPPG(sppgId: string, date: string) {
  // Check if report already submitted
  const { data: existing } = await supabase
    .from('daily_reports')
    .select('status')
    .eq('sppg_id', sppgId)
    .eq('report_date', date)
    .maybeSingle();

  if (existing?.status === 'submitted') return; // Don't overwrite

  // Aggregate from other tables
  const [portionData, wasteData, expenseData, distributionData, issueData] =
    await Promise.all([
      getPortionSummary(sppgId, date),
      getWasteSummary(sppgId, date),
      getExpenseSummary(sppgId, date),
      getDistributionSummary(sppgId, date),
      getIssueSummary(sppgId, date),
    ]);

  await supabase.from('daily_reports').upsert({
    sppg_id: sppgId,
    report_date: date,
    total_produced: portionData.total_produced,
    total_distributed: portionData.total_distributed,
    total_waste_kg: wasteData.total_kg,
    total_expenses: expenseData.total,
    on_time_deliveries: distributionData.on_time,
    late_deliveries: distributionData.late,
    issues_count: issueData.count,
    status: 'draft',
    generated_at: new Date().toISOString(),
  }, { onConflict: 'sppg_id,report_date', ignoreDuplicates: false });

  // Notify Aslap to review
  await sendPushNotification(supabase, sppgId, {
    title: 'Laporan Harian Siap Review',
    body: 'Laporan hari ini telah ter-generate. Silakan review dan submit.',
    data: { type: 'daily_report', date }
  });
}
```

### 12.3 Report Review UI

```typescript
// app/(app)/aslap/laporan/page.tsx
// Target: Aslap bisa review dan submit dalam < 5 menit

export default function DailyReportPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: report } = useDailyReport(today);

  return (
    <div className="space-y-4 pb-20">
      <ReportStatusBanner report={report} />

      {/* Auto-filled sections — read only dengan edit option */}
      <ReportSection title="Produksi & Distribusi" icon="ChefHat">
        <MetricRow label="Total Produksi" value={report?.total_produced} unit="porsi" />
        <MetricRow label="Total Distribusi" value={report?.total_distributed} unit="porsi" />
      </ReportSection>

      <ReportSection title="Food Waste" icon="Trash2">
        <MetricRow label="Total Waste" value={report?.total_waste_kg} unit="kg" />
      </ReportSection>

      <ReportSection title="Distribusi" icon="Truck">
        <MetricRow label="On-Time" value={report?.on_time_deliveries} />
        <MetricRow label="Terlambat" value={report?.late_deliveries} highlight="red" />
      </ReportSection>

      {/* Free-form narrative yang HARUS diisi Aslap */}
      <ReportSection title="Catatan & Kendala" icon="FileText" required>
        <Textarea
          placeholder="Ceritakan kendala hari ini (opsional jika tidak ada)"
          value={report?.issues_narrative ?? ''}
          onChange={e => updateReportField('issues_narrative', e.target.value)}
        />
      </ReportSection>

      <PhotoAttachments reportId={report?.id} />

      <SubmitReportButton
        report={report}
        disabled={report?.status === 'submitted'}
      />
    </div>
  );
}
```

### 12.4 Task Breakdown

| # | Task | Domain | Complexity | Priority |
|---|---|---|---|---|
| E06-DB-01 | Migrations: `daily_reports`, `report_attachments` | DB | Small | P0 |
| E06-DB-02 | pg_cron: schedule generate-daily-report 20:00 WIB | DB | Small | P0 |
| E06-BE-01 | Edge Function: `generate-daily-report` (aggregasi semua domain) | Backend | Extra Large | P0 |
| E06-BE-02 | Edge Function: `push-report-to-bgn` (REST/webhook ke BGN) | Backend | Large | P2 |
| E06-BE-03 | Edge Function: `export-report-pdf` (template PDF) | Backend | Medium | P1 |
| E06-FE-01 | Report review page dengan editable narrative sections | Frontend | Medium | P0 |
| E06-FE-02 | Photo attachment per report dengan GPS tag | Frontend | Medium | P1 |
| E06-FE-03 | KPPG: aggregate report dashboard (cross-SPPG view) | Frontend | Large | P1 |
| E06-QA-01 | Test: auto-generation accuracy vs manual calculation | QA | Large | P0 |

---

## 13. Epic E-07: Monitoring Tim & Kinerja

### 13.1 Attendance via Selfie + GPS

```typescript
// components/aslap/AttendanceCapture.tsx
export function AttendanceCapture({ teamMemberId }: { teamMemberId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);

  const captureAndSubmit = async () => {
    // 1. Capture selfie from camera
    const canvas = document.createElement('canvas');
    canvas.drawImage(videoRef.current!, 0, 0);
    const blob = await new Promise<Blob>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));

    // 2. Get GPS
    const pos = await getCurrentPosition();

    // 3. Upload + record attendance
    const photoUrl = await compressAndUpload(new File([blob], 'selfie.jpg'), supabase, sppgId);

    await supabase.from('attendances').insert({
      sppg_id: sppgId,
      team_member_id: teamMemberId,
      attendance_date: today(),
      check_in_at: new Date().toISOString(),
      selfie_url: photoUrl,
      check_in_lat: pos.coords.latitude,
      check_in_lng: pos.coords.longitude,
      status: 'present',
    });
  };
}
```

### 13.2 Task Breakdown

| # | Task | Domain | Complexity | Priority |
|---|---|---|---|---|
| E07-DB-01 | Migrations: `team_members`, `shifts`, `attendances`, `evaluations` | DB | Medium | P1 |
| E07-FE-01 | Team member management CRUD | Frontend | Medium | P1 |
| E07-FE-02 | Shift scheduler (calendar view, monthly) | Frontend | Large | P1 |
| E07-FE-03 | Selfie attendance dengan kamera + GPS | Frontend | Medium | P1 |
| E07-FE-04 | Evaluation form per role dengan scoring template | Frontend | Medium | P1 |
| E07-FE-05 | Performance dashboard Kepala SPPG | Frontend | Medium | P2 |
| E07-QA-01 | Test: GPS validation untuk attendance (dalam radius SPPG) | QA | Small | P1 |

---

## 14. Epic E-08: Edukasi Gizi & Komunikasi Eksternal

### 14.1 Announcement System (Pengganti WhatsApp)

```typescript
// Structured announcement, auditable, per sekolah atau broadcast
// app/(app)/aslap/komunikasi/page.tsx

export function AnnouncementComposer() {
  const { schools } = useSPPGSchools();

  return (
    <Form onSubmit={handleSubmit}>
      <FormField name="school_id">
        <Select>
          <SelectItem value="">Semua Sekolah (Broadcast)</SelectItem>
          {schools?.map(s => (
            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
          ))}
        </Select>
      </FormField>
      <FormField name="priority">
        <RadioGroup options={['low','normal','high']} />
      </FormField>
      <FormField name="title"><Input /></FormField>
      <FormField name="body"><Textarea rows={5} /></FormField>
      <Button type="submit">Kirim Pengumuman</Button>
    </Form>
  );
}
```

### 14.2 Task Breakdown

| # | Task | Domain | Complexity | Priority |
|---|---|---|---|---|
| E08-DB-01 | Migrations: `education_content`, `education_sessions`, `announcements` | DB | Small | P1 |
| E08-FE-01 | Announcement composer + inbox per sekolah | Frontend | Medium | P1 |
| E08-FE-02 | Content library browser (filter by topic/age group) | Frontend | Medium | P2 |
| E08-FE-03 | QR code share untuk konten edukasi | Frontend | Small | P2 |
| E08-FE-04 | Education session log form | Frontend | Small | P2 |
| E08-BE-01 | Push notification ke PIC sekolah saat ada announcement | Backend | Small | P1 |

---

## 15. Frontend Architecture

### 15.1 Route Structure (Next.js App Router)

```
app/
├── (auth)/
│   ├── login/page.tsx                # Email + password login
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
│
├── (app)/
│   ├── layout.tsx                    # Root protected layout
│   │   // - Auth guard
│   │   // - Role-based layout selector (mobile vs desktop)
│   │   // - Supabase Realtime connection
│   │   // - Offline status indicator
│   │
│   ├── aslap/
│   │   ├── layout.tsx                # Mobile-first layout + BottomNav
│   │   ├── page.tsx                  # Home dashboard (today's summary)
│   │   ├── produksi/...              # E-01
│   │   ├── stok/...                  # E-02
│   │   ├── porsi/...                 # E-03
│   │   ├── distribusi/...            # E-04
│   │   ├── keuangan/...              # E-05
│   │   ├── laporan/...               # E-06
│   │   ├── tim/...                   # E-07
│   │   └── komunikasi/...            # E-08
│   │
│   ├── kepala/
│   │   ├── layout.tsx                # Sidebar + header layout
│   │   ├── dashboard/page.tsx        # Real-time operations overview
│   │   ├── distribusi/page.tsx       # Delivery map view
│   │   ├── keuangan/page.tsx         # Expense approval queue
│   │   ├── laporan/page.tsx          # Reports archive
│   │   └── tim/page.tsx             # Team performance
│   │
│   └── kppg/
│       ├── layout.tsx
│       ├── dashboard/page.tsx        # Multi-SPPG analytics
│       ├── sppg/[id]/page.tsx        # Per-SPPG drill-down
│       └── laporan/page.tsx          # Aggregate report export
│
├── confirm-delivery/[token]/page.tsx # Public: school QR confirmation
└── api/
    ├── confirm-delivery/[token]/route.ts
    └── export/report/[id]/route.ts
```

### 15.2 Mobile-First UX untuk Aslap

```typescript
// app/(app)/aslap/layout.tsx
export default function AslapLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-background border-b px-4 py-3 flex items-center justify-between">
        <SPPGIdentityBadge />
        <div className="flex items-center gap-2">
          <OfflineIndicator />
          <NotificationBell />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {children}
      </main>

      {/* Bottom Navigation — native app feel */}
      <BottomNav />
    </div>
  );
}

// components/aslap/BottomNav.tsx
const NAV_ITEMS = [
  { href: '/aslap', icon: Home, label: 'Beranda' },
  { href: '/aslap/produksi', icon: ChefHat, label: 'Produksi' },
  { href: '/aslap/distribusi', icon: Truck, label: 'Distribusi' },
  { href: '/aslap/laporan', icon: FileText, label: 'Laporan' },
  { href: '/aslap/stok', icon: Package, label: 'Stok' },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t bg-background">
      <div className="flex">
        {NAV_ITEMS.map(item => (
          <Link key={item.href} href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center py-2 px-1 text-xs gap-1",
              pathname.startsWith(item.href) && item.href !== '/aslap'
                ? "text-primary" : "text-muted-foreground"
            )}>
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

### 15.3 Zustand Store Architecture

```typescript
// lib/stores/auth.store.ts
interface AuthStore {
  user: UserProfile | null;
  role: UserRole | null;
  sppgId: string | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null, role: null, sppgId: null, isLoading: true,
      setUser: (user) => set({
        user,
        role: user?.app_metadata?.role ?? null,
        sppgId: user?.app_metadata?.sppg_id ?? null,
        isLoading: false,
      }),
    }),
    { name: 'auth-storage', partialize: (s) => ({ user: s.user }) }
  )
);

// lib/stores/offline.store.ts
interface OfflineStore {
  isOnline: boolean;
  pendingSyncCount: number;
  setOnline: (v: boolean) => void;
  incrementPending: () => void;
  decrementPending: () => void;
}

export const useOfflineStore = create<OfflineStore>()((set) => ({
  isOnline: navigator.onLine,
  pendingSyncCount: 0,
  setOnline: (v) => set({ isOnline: v }),
  incrementPending: () => set(s => ({ pendingSyncCount: s.pendingSyncCount + 1 })),
  decrementPending: () => set(s => ({ pendingSyncCount: Math.max(0, s.pendingSyncCount - 1) })),
}));
```

---

## 16. PWA & Offline Architecture

### 16.1 next-pwa Configuration

```typescript
// next.config.ts
import withPWA from 'next-pwa';

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/production_sessions/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'production-api',
        expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/ingredients/,
      handler: 'NetworkFirst',
      options: { cacheName: 'ingredients-api' },
    },
    {
      // Cache app shell
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: 'CacheFirst',
      options: { cacheName: 'google-fonts' },
    },
  ],
})({
  // ... other Next.js config
});

export default nextConfig;
```

### 16.2 PWA Manifest

```json
// public/manifest.json
{
  "name": "ASLAP SaaS",
  "short_name": "ASLAP",
  "description": "Platform Otomasi Operasional Asisten Lapangan SPPG",
  "start_url": "/aslap",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#16a34a",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "categories": ["productivity", "utilities"],
  "lang": "id"
}
```

### 16.3 Background Sync Registration

```typescript
// app/(app)/aslap/layout.tsx — register sync on reconnect
useEffect(() => {
  const handleOnline = async () => {
    useOfflineStore.getState().setOnline(true);

    // Trigger sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const sw = await navigator.serviceWorker.ready;
      await sw.sync.register('sync-offline-queue');
    } else {
      // Fallback: manual sync
      await syncOfflineQueue(createClient());
    }
  };

  const handleOffline = () => useOfflineStore.getState().setOnline(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);
```

---

## 17. Realtime Architecture

### 17.1 Channel Strategy

```typescript
// Satu channel per domain per SPPG, bukan per record
// Mencegah terlalu banyak WebSocket connections

// Production realtime
const productionChannel = supabase.channel(`production:${sppgId}`)
  .on('postgres_changes', {
    event: '*', schema: 'public', table: 'station_updates',
    filter: `sppg_id=eq.${sppgId}`
  }, handleStationUpdate)
  .subscribe();

// Distribution realtime
const distributionChannel = supabase.channel(`distribution:${sppgId}`)
  .on('postgres_changes', {
    event: 'UPDATE', schema: 'public', table: 'distribution_stops',
    filter: `sppg_id=eq.${sppgId}`
  }, handleDeliveryUpdate)
  .subscribe();

// KPPG: subscribe ke broadcast (aggregated events, not raw DB changes)
const kppgChannel = supabase.channel('kppg:broadcasts')
  .on('broadcast', { event: 'report_submitted' }, handleReportSubmitted)
  .subscribe();
```

### 17.2 Dashboard Refresh Strategy

```typescript
// Untuk KPPG dashboard yang melihat ratusan SPPG:
// JANGAN subscribe ke postgres_changes semua SPPG (terlalu mahal)
// Gunakan polling setiap 60 detik + manual refresh

export function useKPPGDashboard() {
  return useQuery({
    queryKey: ['kppg-dashboard'],
    queryFn: fetchKPPGAggregates,
    refetchInterval: 60 * 1000,    // 60 detik
    staleTime: 30 * 1000,
  });
}
```

---

## 18. Background Jobs & Queue

### 18.1 Edge Functions Inventory

| Function | Trigger | Description |
|---|---|---|
| `generate-daily-report` | pg_cron 20:00 WIB | Aggregate data → create draft report |
| `check-production-delays` | pg_cron tiap 15 menit | Check station delays → push notification |
| `check-low-stock` | pg_cron tiap 6 jam | Low stock detection → alert |
| `push-notification` | HTTP POST dari lain | Send FCM notification |
| `export-report-pdf` | HTTP POST on demand | Generate PDF laporan |
| `sync-bgn` | HTTP POST atau webhook | Push laporan ke BGN API |
| `expense-approval-notify` | DB trigger → HTTP | Notify kepala_sppg on new expense |

### 18.2 Push Notification Function

```typescript
// supabase/functions/push-notification/index.ts
interface PushPayload {
  sppg_id: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  target_roles?: UserRole[];           // Optional: specific roles only
}

Deno.serve(async (req) => {
  const payload: PushPayload = await req.json();

  // Get FCM tokens for target users in SPPG
  const { data: members } = await supabase
    .from('sppg_members')
    .select('user_id, role, profiles(fcm_token)')
    .eq('sppg_id', payload.sppg_id)
    .eq('is_active', true)
    .in('role', payload.target_roles ?? ALL_ROLES);

  const tokens = members
    ?.map(m => m.profiles?.fcm_token)
    .filter(Boolean) as string[];

  if (!tokens.length) return new Response('No tokens', { status: 200 });

  // Send via FCM v1 API
  await fetch(`https://fcm.googleapis.com/v1/projects/${FCM_PROJECT_ID}/messages:send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await getFCMAccessToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        notification: { title: payload.title, body: payload.body },
        data: payload.data,
        tokens,
      }
    })
  });

  return new Response('OK');
});
```

### 18.3 Caching Strategy

```typescript
// TanStack Query cache configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // 5 menit: data dianggap fresh
      gcTime: 30 * 60 * 1000,          // 30 menit: cache di-garbage collect
      retry: (failureCount, error) => {
        if (!navigator.onLine) return false; // Jangan retry saat offline
        return failureCount < 2;
      },
    },
  },
});

// Per-domain stale times
// production session: staleTime 30 detik (high frequency update)
// ingredients: staleTime 5 menit
// recipes: staleTime 1 jam (jarang berubah)
// schools: staleTime 1 jam
```

---

## 19. DevOps & Infrastructure

### 19.1 Environment Variables

```bash
# .env.example — SEMUA variabel yang dibutuhkan

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...     # Server-side only, NEVER expose to client
SUPABASE_DB_URL=postgresql://...     # Direct DB connection (migrations)

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...

# Firebase FCM
FIREBASE_PROJECT_ID=aslap-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."

# App
NEXT_PUBLIC_APP_URL=https://app.aslap.id
NEXT_PUBLIC_APP_ENV=production       # development | staging | production

# Feature Flags
NEXT_PUBLIC_ENABLE_BGN_INTEGRATION=false
NEXT_PUBLIC_ENABLE_OCR=false

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...

# Edge Functions (set via Supabase Dashboard)
# EDGE: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected)
# EDGE: FCM_PROJECT_ID, FCM_ACCESS_TOKEN
# EDGE: BGN_API_URL, BGN_API_KEY
```

### 19.2 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test:unit
      - run: npx supabase db lint   # Lint SQL migrations

  e2e:
    runs-on: ubuntu-latest
    needs: test
    services:
      supabase:
        image: supabase/postgres:15
    steps:
      - uses: actions/checkout@v4
      - run: npx supabase start --local
      - run: npm run test:e2e        # Playwright tests

---
# .github/workflows/deploy-staging.yml
name: Deploy Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel (staging)
        run: vercel --token ${{ secrets.VERCEL_TOKEN }} --env staging

      - name: Run DB migrations (staging)
        run: npx supabase db push --project-ref ${{ secrets.STAGING_SUPABASE_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Run smoke tests
        run: npm run test:smoke -- --base-url https://staging.aslap.id

---
# .github/workflows/deploy-production.yml
name: Deploy Production

on:
  workflow_dispatch:               # Manual trigger
    inputs:
      confirm:
        description: 'Type DEPLOY to confirm'
        required: true

jobs:
  deploy:
    if: github.event.inputs.confirm == 'DEPLOY'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel (production)
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}

      - name: Run DB migrations (production)
        run: npx supabase db push --project-ref ${{ secrets.PROD_SUPABASE_REF }}

      - name: Notify Slack
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -d '{"text":"✅ ASLAP Production deployed: ${{ github.sha }}"}'
```

### 19.3 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   PRODUCTION SETUP                       │
│                                                         │
│  Vercel (Next.js)           Supabase Cloud              │
│  ─────────────────          ──────────────              │
│  - Global CDN               - ap-southeast-1 (Jakarta)  │
│  - Edge Runtime             - PostgreSQL 15              │
│  - Automatic HTTPS          - Realtime                  │
│  - Branch deploys           - Storage                   │
│                             - Edge Functions (Deno)      │
│                             - Auth                       │
│                                                         │
│  Domain: app.aslap.id       DB: [ref].supabase.co       │
│  Staging: staging.aslap.id  Staging: [ref2].supabase.co │
└─────────────────────────────────────────────────────────┘
```

### 19.4 Monitoring & Alerting

```typescript
// Sentry error tracking
// app/layout.tsx
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV,
  tracesSampleRate: 0.1,             // 10% performance traces
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({ sessionSampleRate: 0.05 }), // 5% session replay
  ],
});

// Custom metric tracking
export function trackReportSubmissionTime(durationMs: number, sppgId: string) {
  Sentry.metrics.distribution('report.submission_duration_ms', durationMs, {
    tags: { sppg_id: sppgId },
  });
}
```

**Uptime Monitoring:** Uptime Robot dengan check setiap 5 menit pada:

- `https://app.aslap.id/api/health`
- `https://[ref].supabase.co/rest/v1/`

**Alert thresholds:**

- Response time > 2.5s → Warning (Slack)
- Downtime > 1 menit → Critical (PagerDuty + SMS)
- Error rate > 1% → Warning (Sentry alert)

---

## 20. Ambiguity Register & Technical Assumptions

| # | Ambiguity di PRD | Asumsi Teknis | Rekomendasi |
|---|---|---|---|
| A-01 | Format laporan ke BGN belum ada API spec | Implementasi sebagai JSON export + webhook handler. Siapkan adapter pattern untuk mudah diubah | Konfirmasi dengan tim IT BGN sebelum Phase 3 |
| A-02 | "Timbangan digital terintegrasi" (US05) — tidak jelas protokolnya | Implementasi manual input sebagai default. Siapkan webhook endpoint untuk integrasi scale via Bluetooth/API di Phase 2 | Tetapkan hardware standar per SPPG |
| A-03 | Siapa yang mengelola master recipe BGN? | BGN mengelola via super_admin role. SPPG dapat override dengan versi lokal | Konfirmasi dengan BGN apakah mereka mau manage via platform |
| A-04 | "Konfirmasi penerimaan via QR atau PIN" — apakah PIC sekolah perlu akun? | Tidak perlu akun. QR/PIN adalah one-time token per pengiriman, dibuka via public URL | Pertimbangkan keamanan jika URL leaked |
| A-05 | "Integrasi timbangan digital" — spesifikasi hardware? | Skip Phase 1. Tambahkan Bluetooth Web API integration di Phase 2 jika hardware disediakan BGN | Request hardware spec dari BGN |
| A-06 | "Modul OCR scan struk" (Phase 2) — library apa? | Google Vision API. Siapkan receipt_raw_text field di expenses table sejak awal | OCR accuracy di foto struk thermal rendah; manual fallback wajib |
| A-07 | "SPPG terpencil" dengan koneksi sangat buruk — apakah SMS fallback diimplementasi? | Tidak di Phase 1. PWA offline mode cukup untuk operasional harian. SMS hanya untuk critical alerts | Evaluasi setelah pilot 10 SPPG |
| A-08 | Consent foto anak sekolah per UU PDP (Open Question 5) | Store foto di private Supabase Storage bucket. Tampilkan consent banner saat pertama install | Legal team harus konfirmasi sebelum go-live |

---

## 21. Task Breakdown Master List

### Infrastruktur & Foundation (Sprint 0)

| Task | Domain | Complexity | Priority |
|---|---|---|---|
| Setup Supabase project (prod + staging) | Infra | Small | P0 |
| Setup Next.js monorepo dengan Turborepo | Infra | Medium | P0 |
| Configure GitHub Actions CI/CD | Infra | Medium | P0 |
| Setup Vercel projects (prod + staging) | Infra | Small | P0 |
| Implement database migrations framework | DB | Small | P0 |
| Core schema: SPPG, profiles, sppg_members, schools | DB | Medium | P0 |
| RLS policies foundation + helper functions | DB | Medium | P0 |
| Supabase Auth setup + custom JWT claims | Backend | Medium | P0 |
| Next.js App Router structure + middleware | Frontend | Medium | P0 |
| shadcn/ui setup + design token configuration | Frontend | Small | P0 |
| Zustand stores: auth, offline | Frontend | Small | P0 |
| Dexie.js setup + offline sync foundation | Frontend | Large | P0 |
| PWA manifest + next-pwa configuration | Frontend | Small | P0 |
| Sentry setup (frontend + edge functions) | Infra | Small | P1 |

### Sprint 1 — MVP (E-01, E-02, E-03, E-06 Core) — Target 3 minggu

| Task | Domain | Complexity | Priority |
|---|---|---|---|
| E01 full implementation (see E-01 breakdown) | All | Large | P0 |
| E02 QC + stock core (US05, US06, US07) | All | Large | P0 |
| E03 portion counter + daily tracking (US09) | All | Medium | P0 |
| E06 auto-generate report + review UI (US19, US20) | All | Extra Large | P0 |
| Push notification infrastructure (FCM) | Backend | Medium | P0 |
| Mobile Aslap layout + BottomNav | Frontend | Small | P0 |
| Kepala SPPG basic dashboard (read-only) | Frontend | Medium | P0 |

### Sprint 2 — Core Expansion (E-04, E-05) — Target 3 minggu

| Task | Domain | Complexity | Priority |
|---|---|---|---|
| E04 distribution plan + QR confirmation | All | Extra Large | P0 |
| E05 expense submission + approval | All | Large | P0 |
| Google Maps integration (rute + map view) | Frontend | Large | P1 |
| E06 photo attachments + GPS tagging | Frontend | Medium | P1 |
| KPPG dashboard foundation | Frontend | Large | P1 |

### Sprint 3 — Full Platform (E-07, E-08, Analytics) — Target 3 minggu

| Task | Domain | Complexity | Priority |
|---|---|---|---|
| E07 team management + shift + attendance | All | Large | P1 |
| E08 announcement system | All | Medium | P1 |
| KPPG cross-SPPG analytics | Frontend | Large | P1 |
| E03 recipe calculator + shopping list | All | Medium | P1 |
| PDF report export | Backend | Medium | P1 |
| E06 BGN push integration (mock) | Backend | Medium | P2 |
| Performance optimization + load testing | QA/Infra | Large | P1 |

---

## Appendix: Environment Setup Checklist

```bash
# Prerequisites
node --version    # v20+
npm --version     # v10+
npx supabase --version  # v1.150+

# Initial setup
git clone git@github.com:org/aslap-saas.git
cd aslap-saas
npm install

# Environment
cp .env.example .env.local
# Fill in Supabase URL, anon key, etc.

# Local Supabase
npx supabase start
npx supabase db push
npx supabase db seed

# Generate types
npm run db:types   # runs: supabase gen types typescript --local > packages/types/database.types.ts

# Run dev
npm run dev        # turbo dev -- starts Next.js on :3000

# Run tests
npm run test:unit
npm run test:e2e   # requires: npx supabase start

# Build check
npm run build
npm run type-check
npm run lint
```

---

*Blueprint ini adalah living document. Update setelah setiap sprint retrospective.*
*Versi: 1.0 | Tanggal: Mei 2026 | Author: Principal Engineer*
