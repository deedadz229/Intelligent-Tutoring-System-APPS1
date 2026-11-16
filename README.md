# Academic Assistant ITS
> **Chatbot Layanan Informasi dan FAQ Akademik Adaptif dengan Sistem Gamifikasi Terintegrasi**  
> Tugas Besar Mata Kuliah Intelligent Tutoring System (ITS) — Kelompok 1

---

## 📌 Ringkasan Sistem

**Academic Assistant ITS** adalah platform asisten akademik pintar berbasis kecerdasan buatan (*Natural Language Processing*) yang dirancang untuk membantu mahasiswa memperoleh informasi regulasi, prosedur, dan panduan akademik secara cepat, akurat, dan adaptif. 

Sistem ini menggabungkan:
1. **NLP FAQ Matching Engine (Deterministic & Anti-Hallucination):**
   - **Langkah 2 Preprocessing:** Unicode NFKC, lowercasing, regex cleaning, Indonesian stopword filtering, dan TF-IDF Vectorization.
   - **Langkah 3 Algoritma NLP:**
     - *Primary Matcher:* **TF-IDF + Cosine Similarity** (Threshold `0.35`).
     - *Fallback Matcher:* **Fuzzy String Matching / RapidFuzz** (Threshold `75.0`, `fuzz.ratio`) untuk toleransi salah ketik (*typo*).
     - *Dataset FAQ:* 8.391 pasang tanya-jawab terkurasi tanpa halusinasi generative AI.
2. **Sistem Gamifikasi Terkait Algoritma NLP (Langkah 4 & 5):**
   - Akumulasi XP berbasis aturan server terverifikasi: +15 XP untuk pencocokan semantik presisi tinggi (Cosine Similarity >= 0.70), +10 XP untuk FAQ standar & penelusuran toleransi saltik (Fuzzy Matching >= 75%), serta 0 XP untuk pertanyaan di luar dataset (`no_answer`).
   - Perlindungan anti-spam XP dan rate limit per menit/hari.
   - Dynamic Leveling (*Mahasiswa Baru*, *Mahasiswa Aktif*, *Peneliti Muda*, *Cendekiawan*, dll.) berdasarkan total XP.
   - Medali Penghargaan (*Achievements & Badges*) termasuk badge algoritma: *Peneliti Presisi* (Cosine >= 0.70), *Detektif Saltik* (Fuzzy Matching), dan *Juara Kuis Akademik*.
   - Misi Harian (*Daily Quests*) dengan klaim reward XP interaktif.
   - Papan Peringkat Kompetitif (*Leaderboard*).
3. **Frontend Interaktif & Modern (React JS):**
   - Dibangun dengan **React 19**, **Vite**, dan **Tailwind CSS v4**.
   - Terinspirasi dari rancangan visual akademik modern (`design-reference/`).
   - 7 modul halaman utama: Dashboard, AI Academic Chat, Kuis Akademik Interaktif (`/quiz`), Daily Quest, Achievements, Leaderboard, dan My Profile.
   - Umpan Balik Adaptif: Indikator tingkat akurasi (Tinggi/Sedang/Rendah), algoritma pencocokan, skor similarity, waktu eksekusi (ms), dan tombol rating feedback.
   - Disclaimer etika akademik sesuai standar regulasi kampus.

---

## 🏗️ Arsitektur Proyek

```
Tubes ITS/
├── backend/                  # FastAPI Backend & NLP Engine
│   ├── app/
│   │   ├── api/routes/       # Health, Chatbot, Gamification, Users endpoints
│   │   ├── core/             # Settings, Database configuration, Security
│   │   ├── ml/               # Model loader, Preprocessing (Langkah 2 & 3)
│   │   ├── models/           # SQLAlchemy ORM Models (SQLite)
│   │   ├── schemas/          # Pydantic v2 validation schemas
│   │   └── services/         # Cosine, Fuzzy, FAQ, dan Gamification services
│   ├── tests/                # Pytest test suite (Unit, Integration, Gamification, API)
│   ├── .env                  # Konfigurasi backend
│   ├── requirements.txt      # Dependensi Python
│   └── README.md             # Dokumentasi teknis backend
│
├── frontend/                 # React JS Frontend Application
│   ├── src/
│   │   ├── api/              # Centralized Fetch client
│   │   ├── components/       # Reusable UI components (Chat, Quest, Achievement, Common)
│   │   ├── context/          # React Context (Gamification & Health)
│   │   ├── layouts/          # MainLayout, Sidebar, Topbar
│   │   ├── pages/            # 6 Halaman utama (Dashboard, Chat, Quests, Badges, Board, Profile)
│   │   └── services/         # API Service layer
│   ├── .env                  # Konfigurasi VITE_API_BASE_URL
│   ├── package.json          # Dependensi frontend & scripts
│   ├── vite.config.js        # Konfigurasi Vite
│   └── README.md             # Dokumentasi teknis frontend
│
├── academic_assistant.db     # Database SQLite (disimpan & dikelola secara otomatis)
└── README.md                 # Dokumentasi utama proyek (file ini)
```

---

## 🚀 Panduan Menjalankan Sistem Secara Lengkap

### Prasyarat
1. **Python 3.12+** terinstal di sistem.
2. **Node.js 18+** dan **npm** terinstal di sistem.
3. Pastikan artefak model NLP (`tfidf_vectorizer.joblib`, `tfidf_matrix.npz`, dan `dataset_faq_preprocessed.csv`) tersedia di folder `backend/artifacts/` atau `D:\hasil_langkah_2\`.

---

### Langkah 1: Menjalankan Backend FastAPI

Buka terminal pertama:
```bash
# 1. Masuk ke direktori backend
cd "d:\Tubes ITS\backend"

# 2. Instal dependensi Python
pip install -r requirements.txt

# 3. Jalankan server Uvicorn
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend akan aktif di:
- **API Base:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
- **Health Check:** `http://127.0.0.1:8000/health`

---

### Langkah 2: Menjalankan Frontend React

Buka terminal kedua:
```bash
# 1. Masuk ke direktori frontend
cd "d:\Tubes ITS\frontend"

# 2. Instal dependensi Node.js
npm install

# 3. Jalankan development server Vite
npm run dev
```
Frontend akan aktif di:
- **Aplikasi Web:** `http://localhost:5173`

---

## 🧪 Pengujian & Verifikasi

### Pengujian Backend (Pytest)
```bash
cd "d:\Tubes ITS\backend"
pytest -v
```
Seluruh 35+ test case (Cosine Similarity, Fuzzy Matching, Edge Cases, Gamification Anti-Spam, Rate Limiting, dan REST Endpoints) terverifikasi lolos 100%.

### Pengujian Frontend (Build Verification)
```bash
cd "d:\Tubes ITS\frontend"
npm run build
```
Menghasilkan bundle produksi teroptimasi tanpa error atau missing imports.

---

## 📜 Kepatuhan & Etika Akademik

Aplikasi ini menyertakan *Academic Disclaimer* yang menegaskan bahwa seluruh informasi yang disediakan chatbot bersumber dari dataset panduan akademik resmi dan pedoman kurikulum. Mahasiswa disarankan untuk tetap melakukan konfirmasi ke Biro Akademik / Dosen Pembimbing untuk keputusan administratif yang krusial.

---

## 👥 Tim Pengembang

- **Kelompok 1 — Mata Kuliah Intelligent Tutoring System**
- Departemen Informatika, Institut Teknologi Sepuluh Nopember (ITS)
