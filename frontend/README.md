# Academic Assistant ITS — Frontend Application

Antarmuka web interaktif berbasis **React JS** untuk **Academic Assistant ITS**, yaitu chatbot layanan informasi dan FAQ akademik adaptif berbasis NLP dengan sistem gamifikasi terintegrasi.

Aplikasi frontend ini dirancang khusus sesuai panduan **Tubes ITS Kelompok 1**, mengadaptasi arah visual dari `design-reference/` (clean academic portal, primary blue palette, modular card system, dan layout responsif desktop/mobile).

---

## 🚀 Fitur Utama

Aplikasi terdiri dari 6 halaman utama yang terintegrasi secara dinamis dengan backend FastAPI:

1. **Dashboard (`/`)**
   - Sapaan dinamis dan profil akademik pengguna.
   - Status level, total XP, dan progress bar interaktif menuju level berikutnya.
   - Kartu metrik cepat: Total Pertanyaan, Akurasi FAQ, Quest Selesai, dan Badge Diraih.
   - Daily Quests aktif dengan status progress dan tombol klaim reward XP.
   - Showcase Achievement terbaru yang telah diperoleh.
   - Riwayat aktivitas chatbot terbaru beserta indikator metode pencocokan (*Cosine Similarity* / *Fuzzy Matching*).
   - Akses navigasi cepat menuju seluruh modul utama.

2. **AI Academic Chat (`/chat`)**
   - Percakapan akademik modern dengan visual bubble pengguna dan respons bot.
   - Transparansi komputasi NLP per pesan: algoritma pencocokan (*TF-IDF Cosine Similarity* vs *RapidFuzz*), skor confidence, tingkat akurasi (Tinggi/Sedang/Rendah), dan latency eksekusi (ms).
   - Indikator status adaptif: jawaban ditemukan (*high confidence*), jawaban toleransi typo (*fuzzy matching*), atau jawaban belum tersedia (*unanswered* dengan saran pencarian).
   - Direct reward XP dari chat presisi (+15 XP Cosine Tinggi, +10 XP Standar/Fuzzy) dengan proteksi anti-spam rate-limit.
   - Tombol feedback respons (*thumbs up / down*) yang langsung terkirim ke database backend.
   - Suggested Topics pills untuk topik FAQ terpopuler (KRS, Cuti Kuliah, Syarat Wisuda, Beasiswa, Drop Out, dll.).
   - Riwayat percakapan interaktif dengan tombol *Clear Chat*.
   - Auto-refresh XP dan status quest secara otomatis saat pertanyaan diajukan.

3. **Kuis Akademik Interaktif (`/quiz`)**
   - Tantangan kuis regulasi kampus berbasis 5 soal akademik aktual dari kurikulum resmi.
   - Pilihan ganda interaktif (A, B, C, D) dengan navigasi langkah demi langkah dan indikator progres.
   - Umpan balik komprehensif setelah submit: persentase nilai, perolehan XP reward (hingga +75 XP), dan badge Juara Kuis.
   - Pembahasan mendalam disertai dasar hukum & regulasi pedoman akademik resmi ITS.

4. **Daily Quest (`/quests`)**
   - Daftar misi harian (Tanya Pertama Hari Ini, Jelajah 3 Kategori, Berikan Feedback, dll.).
   - Kartu misi informatif dengan deskripsi, bobot reward XP, dan progress bar.
   - Tombol **Klaim Reward XP** yang memicu pembaruan state global secara instan.
   - Banner reset countdown misi harian (otomatis reset setiap pukul 00:00 WIB).

4. **Achievements (`/achievements`)**
   - Galeri medali dan pencapaian akademik (Penjelajah Pemula, Detektif Akademik, dll.).
   - Filter kategori pencapaian: *Semua*, *Tercapai*, dan *Terkunci*.
   - Visual badge status: ikon berwarna untuk badge yang sudah terbuka (*unlocked*) dan ikon terkunci dengan requirement yang jelas untuk yang belum diperoleh.
   - Total reward XP tercatat secara transparan.

5. **Leaderboard (`/leaderboard`)**
   - Papan peringkat gamifikasi akademik kompetitif.
   - Podium Top 3 (Emas, Perak, Perunggu) dengan sorotan khusus dan avatar representatif.
   - Tabel peringkat lengkap dengan indikator pengguna saat ini (*highlighted*).
   - Informasi level, badge utama, total pertanyaan, dan total XP.

6. **My Profile (`/profile`)**
   - Profil lengkap mahasiswa: Nama, NIM, Departemen, Status Akademik, dan Role.
   - Ringkasan Level, Total XP, dan Milestone Progress.
   - Kartu statistik komprehensif aktivitas belajar dan interaksi chatbot.
   - Daftar lengkap badge penghargaan yang telah diraih.
   - Pengaturan notifikasi dan preferensi tampilan.

7. **Komponen Global & Etika Akademik**
   - **Academic Disclaimer (`AcademicDisclaimer.jsx`)**: Pernyataan kepatuhan etika akademik dan konfirmasi bahwa chatbot merupakan asisten penunjang informasi, bukan pengganti kebijakan resmi birokrasi kampus.
   - **Live Health Status Bar**: Indikator koneksi real-time ke FastAPI backend (`Online` vs `Offline`).
   - **Responsive Navigation**: Sidebar desktop yang elegan dan mobile navigation drawer + horizontal quick pills untuk layar smartphone.

---

## 🛠️ Tech Stack

- **Framework:** React 19 (JavaScript ES6+)
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Routing:** React Router DOM v7
- **Icons:** Lucide React
- **HTTP Client:** Native Fetch API dengan modular service layer & error normalization
- **State Management:** React Context API (`GamificationContext`) untuk sinkronisasi live XP, profil, dan quest rewards

---

## 📁 Struktur Folder

```
frontend/
├── public/                 # Static assets & favicon
├── src/
│   ├── api/
│   │   └── client.js       # Centralized Fetch wrapper (baseUrl, timeout, query params)
│   ├── components/
│   │   ├── achievement/
│   │   │   └── AchievementBadge.jsx   # Komponen visual badge pencapaian
│   │   ├── chat/
│   │   │   ├── ChatInput.jsx          # Input textarea + send button + char counter
│   │   │   ├── ChatMessage.jsx        # Bubble chat + metadata badge + feedback actions
│   │   │   └── SuggestedTopics.jsx    # Quick suggestions FAQ pills
│   │   ├── common/
│   │   │   ├── AcademicDisclaimer.jsx # Disclaimer etika & kepatuhan akademik
│   │   │   ├── EmptyState.jsx         # Fallback tampilan data kosong
│   │   │   ├── ErrorState.jsx         # Fallback tampilan error & tombol retry
│   │   │   ├── LoadingState.jsx       # Skeleton loading spinner
│   │   │   ├── PageHeader.jsx         # Reusable title & subtitle banner
│   │   │   ├── StatCard.jsx           # Kartu statistik metrik
│   │   │   └── XPProgress.jsx         # Level progress bar
│   │   └── quest/
│   │       └── QuestCard.jsx          # Kartu misi harian + tombol claim
│   ├── context/
│   │   └── GamificationContext.jsx    # Global state user, XP, level, health & refresh triggers
│   ├── layouts/
│   │   ├── MainLayout.jsx             # Shell layout: Sidebar + Topbar + Content + Disclaimer
│   │   ├── Sidebar.jsx                # Sidebar navigasi desktop & avatar card
│   │   └── Topbar.jsx                 # Header bar: Breadcrumb + Health pill + Live XP badge
│   ├── pages/
│   │   ├── AchievementsPage.jsx       # Halaman galeri medali & filter
│   │   ├── ChatPage.jsx               # Halaman percakapan interaktif
│   │   ├── DailyQuestPage.jsx         # Halaman misi harian & reward
│   │   ├── Dashboard.jsx              # Halaman beranda utama
│   │   ├── LeaderboardPage.jsx        # Halaman papan peringkat akademik
│   │   └── ProfilePage.jsx            # Halaman profil mahasiswa
│   ├── services/
│   │   ├── chatbotService.js          # API service chatbot (/api/process, feedback, samples)
│   │   ├── gamificationService.js     # API service gamifikasi (profile, quests, badges, leaderboard)
│   │   └── healthService.js           # API service health status (/health)
│   ├── App.jsx                        # Definisi rute React Router
│   ├── index.css                      # Tailwind v4 import & custom utilities
│   └── main.jsx                       # React root entry point
├── .env                               # Konfigurasi environment lokal
├── .env.example                       # Contoh environment template
├── index.html                         # HTML template & font Inter
├── package.json                       # Dependencies & scripts
└── vite.config.js                     # Vite build configuration
```

---

## ⚙️ Persyaratan Sistem

- **Node.js:** Versi 18.0.0 atau lebih baru (direkomendasikan v20+)
- **npm:** Versi 9.0.0 atau lebih baru
- **Backend FastAPI:** Berjalan pada port 8000 (`http://localhost:8000`)

---

## 🔧 Panduan Instalasi & Menjalankan

### 1. Masuk ke direktori frontend
```bash
cd "d:\Tubes ITS\frontend"
```

### 2. Instal dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env` (sudah disediakan secara otomatis):
```env
VITE_API_BASE_URL=http://localhost:8000
```
> **Catatan:** Jika backend Anda berjalan di port atau host berbeda, sesuaikan nilai `VITE_API_BASE_URL` di atas.

### 4. Jalankan Development Server
```bash
npm run dev
```
Aplikasi frontend akan aktif di:
`http://localhost:5173`

### 5. Build untuk Produksi
```bash
npm run build
```
Hasil kompilasi produksi yang teroptimasi akan berada di folder `dist/`.

Untuk melihat preview hasil build produksi secara lokal:
```bash
npm run preview
```

---

## 🔗 Integrasi Backend FastAPI

Frontend berkomunikasi dengan endpoint backend berikut:

| Modul | Endpoint | Method | Deskripsi |
|---|---|---|---|
| **System** | `/health` | `GET` | Memeriksa ketersediaan backend dan status NLP engine |
| **Chatbot** | `/api/process` | `POST` | Mengirim pertanyaan pengguna, memicu TF-IDF / Fuzzy engine, dan menambah XP |
| **Quiz** | `/api/quiz/questions` | `GET` | Mengambil daftar bank soal kuis regulasi akademik aktual |
| **Quiz** | `/api/quiz/submit` | `POST` | Mengirim jawaban kuis, evaluasi skor, ulasan dasar regulasi & klaim XP |
| **Feedback** | `/api/feedback` | `POST` | Mengirim rating jawaban pengguna (1-5 bintang atau relevan/tidak) |
| **FAQ** | `/api/faq/categories` | `GET` | Mendapatkan daftar kategori FAQ akademik |
| **FAQ** | `/api/faq/samples` | `GET` | Mendapatkan daftar contoh pertanyaan FAQ rekomendasi |
| **Profile** | `/api/gamification/profile` | `GET` | Mendapatkan data profil pengguna, level, dan XP saat ini |
| **Progress**| `/api/gamification/progress`| `GET` | Mendapatkan ringkasan statistik & kemajuan gamifikasi |
| **Quests** | `/api/gamification/quests` | `GET` | Mendapatkan daftar Daily Quests aktif beserta status penyelesaian |
| **Quests** | `/api/gamification/quests/{id}/complete` | `POST` | Mengklaim reward XP dari quest yang telah diselesaikan |
| **Badges** | `/api/gamification/achievements` | `GET` | Mendapatkan daftar medali dan pencapaian pengguna |
| **Board**  | `/api/gamification/leaderboard` | `GET` | Mendapatkan data papan peringkat mahasiswa |

---

## 🎨 Pedoman Desain & Identitas Visual

- **Palet Warna:**
  - **Primary Academic Blue:** `#245CF5` (accent hover `#1A46C4`)
  - **Canvas Background:** `#F1F4F9` (soft academic cool grey)
  - **Surface & Cards:** `#FFFFFF` dengan shadow lembut (`shadow-sm`) dan border abu-abu halus (`border-slate-100`)
  - **XP & Gamification Gold:** `#F59E0B` / `#D97706` dengan latar `#FEF3C7`
  - **Success / Online Emerald:** `#10B981` dengan latar `#D1FAE5`
  - **Pencapaian Purple:** `#8B5CF6` dengan latar `#EDE9FE`
- **Tipografi:** *Inter*, sans-serif untuk keterbacaan optimal pada teks akademik.
- **Responsif:** Breakpoint Tailwind (`sm`, `md`, `lg`, `xl`) dirancang untuk kenyamanan pada resolusi desktop (1280px+), tablet (768px - 1024px), maupun mobile smartphone (< 640px).

---

## 👥 Pengembang

- **Kelompok 1 — Tugas Besar Intelligent Tutoring System (ITS)**
- Institut Teknologi Sepuluh Nopember (ITS)
