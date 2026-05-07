# Financial Management Frontend

Aplikasi pengelolaan keuangan personal dan keluarga built with Next.js 15.

## Akun Demo

| Field | Value |
|-------|-------|
| Email | `demo@example.com` |
| Password | `demo123` |

## Cara Menggunakan Aplikasi

### 1. Login
Buka aplikasi dan login dengan kredensial akun demo di atas.

### 2. Dashboard
Setelah login, Anda akan melihat dashboard dengan:
- **Total Saldo**: Jumlah seluruh saldo akun Anda
- **Pemasukan Bulan Ini**: Total uang masuk bulan berjalan
- **Pengeluaran Bulan Ini**: Total uang keluar bulan berjalan
- **Grafik Pengeluaran**: Visualisasi pengeluaran berdasarkan kategori
- **Transaksi Terakhir**: Daftar transaksi terbaru

### 3. Akun (Accounts)
Kelola berbagai jenis akun keuangan:
- **Bank BCA** - Rekening bank (saldo: Rp 15.000.000)
- **GoPay** - E-wallet (saldo: Rp 2.500.000)
- **Tunai** - Cash (saldo: Rp 500.000)
- **Kartu Kredit** - Credit card (saldo: -Rp 2.500.000)

Fitur:
- Tambah akun baru (Bank, E-wallet, Cash, Kartu Kredit, Investasi)
- Edit nama, ikon, warna
- Arsipkan akun yang tidak aktif
- Hapus akun

### 4. Transaksi (Transactions)
Catat setiap transaksi keuangan:
- **Pemasukan** - Uang masuk (gaji, freelance, investasi)
- **Pengeluaran** - Uang keluar (makanan, transportasi, belanja, tagihan, hiburan, kesehatan)
- **Transfer** - Pindah uang antar akun

Fitur:
- Filter berdasarkan tanggal, jenis, kategori, akun
- Tambah tag untuk kategorisasi
- Transaksi berulang (setiap minggu/bulan)
- Upload receipt/faktur

### 5. Kategori (Categories)
Kelola kategori untuk transaksi:
- **Pemasukan**: Gaji, Freelance, Investasi
- **Pengeluaran**: Makanan, Transportasi, Belanja, Tagihan, Hiburan, Kesehatan

### 6. Budget
Atur budget bulanan per kategori:
- Tambah budget per kategori
- Atur batas warning (default 80%)
- Pantau progress spent vs amount
- Periode: Mingguan, Bulanan, Tahunan, Custom

### 7. Goals (Target)
Kelola target keuangan:
- **Liburan ke Jepang** - Rp 25.000.000 (deadline: 1 Juni 2027)
- **Beli Laptop Baru** - Rp 15.000.000 (deadline: 1 November 2026)
- **Dana Darurat** - Rp 30.000.000 (deadline: 1 Januari 2028)

Fitur:
- Tambah contribution/kontribusi
- History kontribusi
- Lock goal agar tidak terhapus
- Auto-generate dari milestone plan

### 8. Plans (Rencana)
Buat rencana keuangan jangka panjang:
- **Plan Tabungan 2026** - Rencana tabungan tahun 2026

Fitur:
- Tambah milestone dengan target amount dan tanggal
- Hubungkan dengan goals
- Generate goal dari milestone
- Track progress milestone

### 9. Reports (Laporan)
Lihat analisis keuangan:
- Grafik pengeluaran per kategori
- Tren per bulan
- Filter berdasarkan periode

### 10. Notifications
Pusat notifikasi:
- Budget warning
- Goal milestone
- Plan reminder
- Daily summary

### 11. Settings
Pengaturan akun:
- Ubah nama profile
- Ganti password
- Pengaturan notifikasi

## Struktur Data

```
User (1) ─────< Account
     │
     ├────< Category
     │
     ├────< Transaction
     │
     ├────< Budget (per Category)
     │
     ├────< Goal
     │      └────< GoalContribution
     │
     ├────< Plan
     │      └────< PlanMilestone
     │      └────< PlanGoal
     │
     ├────< Reminder
     │
     └────< Notification
```

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
- Prisma (Backend ORM)
- PostgreSQL (Database)

## Getting Started

```bash
cd frontend
pnpm install
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Reset Database

Jika ingin mereset database dan membuat data baru:

```bash
cd backend
pnpm db:push --force-reset
pnpm db:seed
```

Ini akan:
1. Menghapus semua data
2. Membuat schema baru
3. Menjalankan seed dengan data demo