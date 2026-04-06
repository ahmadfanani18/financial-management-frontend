# Financial Management Frontend

Aplikasi pengelolaan keuangan personal dan keluarga built with Next.js 15.

## Routes

### Public Routes
- `/login` - Halaman login
- `/register` - Halaman registrasi

### Protected Routes (Dashboard)
- `/dashboard` - Dashboard utama
- `/dashboard/accounts` - Manajemen akun
- `/dashboard/transactions` - Daftar transaksi
- `/dashboard/categories` - Kategori
- `/dashboard/budgets` - Budget
- `/dashboard/goals` - Goals
- `/dashboard/plans` - Rencana keuangan
- `/dashboard/reports` - Laporan
- `/dashboard/settings` - Pengaturan
- `/dashboard/notifications` - Notifikasi

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts

## Getting Started

```bash
cd frontend
pnpm install
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Notes

- UI menggunakan mock data untuk development standalone
- Next-auth sementara di-disable untuk UI-only development
- Nanti akan diintegrasikan dengan backend API
