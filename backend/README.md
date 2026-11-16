# Academic Assistant ITS — Backend REST API
> **Chatbot Layanan Informasi dan FAQ Akademik Adaptif dengan Sistem Gamifikasi Terintegrasi**  
> Mengintegrasikan Hasil Preprocessing Langkah 2 dan Algoritma NLP Langkah 3 dari Google Colab (`Tubes_ITS_Kel_1.ipynb`).

---

## 1. Ringkasan Proyek

Academic Assistant ITS adalah sistem backend berbasis **Python 3.12** dan **FastAPI** yang menyediakan layanan tanya jawab otomatis seputar pedoman dan regulasi akademik. Sistem ini menggabungkan dua lapis pencocokan cerdas:
1. **TF-IDF + Cosine Similarity** (Threshold: `0.35`) untuk pencocokan makna kata dan semantik teks pertanyaan.
2. **Fuzzy Matching / RapidFuzz** (Threshold: `75.0`, scorer `fuzz.ratio`) sebagai fallback tangguh untuk menangani kesalahan ketik (*typo* / saltik).
3. **Gamifikasi Adaptif**: Sistem XP, leveling bertingkat (*dynamic leveling*), badge prestasi (*achievements*), misi harian (*daily quests*), dan *leaderboard* mahasiswa dengan mekanisme *anti-spam*.

Semua jawaban diambil secara deterministik dan terverifikasi dari dataset FAQ (8.391 pasang tanya-jawab) tanpa menggunakan model generatif yang rentan halusinasi.

---

## 2. Struktur Proyek Backend

```
backend/
├── app/
│   ├── main.py                     # Entrypoint aplikasi FastAPI, lifespan, CORS & exception handler
│   ├── core/
│   │   ├── config.py               # Konfigurasi Pydantic Settings & path resolver (.env)
│   │   └── security.py             # Sanitasi input & utilitas keamanan
│   ├── api/
│   │   └── routes/
│   │       ├── health.py           # Endpoint GET /health
│   │       ├── chatbot.py          # Endpoint POST /api/process, feedback, dan kategori FAQ
│   │       ├── gamification.py     # Endpoint profil, progres, quest, dan leaderboard
│   │       └── users.py            # Endpoint manajemen pengguna
│   ├── schemas/
│   │   ├── chatbot.py              # Validasi Pydantic v2 (ProcessRequest, ProcessResponse)
│   │   ├── user.py                 # Schema pengguna (UserResponse, UserCreate)
│   │   └── gamification.py         # Schema profil, quest, achievement, leaderboard
│   ├── services/
│   │   ├── chatbot_service.py      # Orkestrator NLP: Cosine -> Fuzzy -> No Answer & logging
│   │   ├── cosine_service.py       # Algoritma TF-IDF + Cosine Similarity (threshold 0.35)
│   │   ├── fuzzy_service.py        # Algoritma RapidFuzz fuzz.ratio (threshold 75.0)
│   │   ├── faq_service.py          # Layanan query dataset FAQ & data verifikasi
│   │   └── gamification_service.py # Logika transaksi XP, dynamic leveling & quest anti-cheat
│   ├── ml/
│   │   ├── model_loader.py         # Singleton pemuat matriks TF-IDF, vectorizer & dataset
│   │   └── preprocessing.py        # Normalisasi teks konsisten Langkah 2 (NFKC, stopword) & Langkah 3
│   ├── models/
│   │   ├── base.py                 # SQLAlchemy declarative base
│   │   ├── user.py                 # Tabel users & user_levels
│   │   ├── chat.py                 # Tabel chat_history & user_feedback
│   │   └── gamification.py         # Tabel xp_transactions, achievements, quests, progress
│   └── database/
│       ├── session.py              # Engine SQLite & dependency session generator (get_db)
│       └── init_db.py              # Inisialisasi tabel, seeding level, quests, badges, demo user
├── model/
│   ├── tfidf_vectorizer.joblib     # Model TF-IDF Vectorizer (31.969 kosakata) dari Langkah 2
│   └── tfidf_matrix.npz            # Matriks sparse TF-IDF (8.391 x 31.969) dari Langkah 2
├── dataset/
│   ├── dataset_faq_preprocessed.csv# Dataset hasil cleaning & preprocessing Langkah 2 (8.391 baris)
│   └── qa_perlu_verifikasi.csv     # Data split bertanda titik koma (270 baris)
├── tests/
│   ├── conftest.py                 # Fixture pytest isolated in-memory DB & TestClient
│   ├── test_health.py              # Test Case 1: GET /health
│   ├── test_ml_loader.py           # Test Case 2 & 3: Model & dataset loading & matrix alignment
│   ├── test_preprocessing.py       # Konsistensi normalisasi teks & stopword removal
│   ├── test_similarity.py          # Test Case 4, 5, 6, 7: Cosine, Fuzzy, Valid & Irrelevant FAQ
│   ├── test_chatbot_api.py         # Test Case 8, 9, 10: Validasi Pydantic, HTTP 422, endpoint API
│   └── test_gamification.py        # Test Case 11 & 12: Penyelesaian quest, XP, badges, anti-spam
├── requirements.txt                # Dependensi pustaka Python
├── .env.example                    # Template variabel lingkungan
└── README.md                       # Dokumentasi teknis lengkap
```

---

## 3. Prasyarat & Instalasi

### Prasyarat
- **Python**: Versi `3.12` (atau `>= 3.10`)
- **Package Manager**: `pip`

### Langkah Instalasi

1. **Buka Terminal / PowerShell** dan arahkan ke folder backend:
   ```powershell
   cd "D:\Tubes ITS\backend"
   ```

2. **Buat Virtual Environment**:
   ```powershell
   python -m venv venv
   ```

3. **Aktifkan Virtual Environment**:
   - Di Windows (PowerShell):
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - Di Linux / macOS:
     ```bash
     source venv/bin/activate
     ```

4. **Instal Seluruh Dependensi**:
   ```powershell
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

5. **Siapkan Konfigurasi Lingkungan (`.env`)**:
   Salin `.env.example` menjadi `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
   Pastikan variabel konfigurasi sesuai:
   ```ini
   PROJECT_NAME="Academic Assistant ITS"
   ENVIRONMENT="development"
   DEBUG=True
   HOST="0.0.0.0"
   PORT=8000
   CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
   DATABASE_URL="sqlite:///./academic_assistant.db"
   DATASET_PATH="dataset/dataset_faq_preprocessed.csv"
   VERIFICATION_DATASET_PATH="dataset/qa_perlu_verifikasi.csv"
   TFIDF_VECTORIZER_PATH="model/tfidf_vectorizer.joblib"
   TFIDF_MATRIX_PATH="model/tfidf_matrix.npz"
   COSINE_THRESHOLD=0.35
   FUZZY_THRESHOLD=75.0
   ```

---

## 4. Menjalankan Aplikasi Backend

Jalankan server menggunakan **Uvicorn**:
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Server akan aktif di: `http://localhost:8000`

### Akses Dokumentasi Interaktif:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 5. Cara Kerja NLP Engine (Langkah 2 & 3)

```
                       [ Input Pertanyaan User ]
                                   │
                                   ▼
             [ Preprocessing: normalisasi_teks() ]
             - Unicode NFKC & lowercase
             - Hapus URL, tanda baca & garis bawah
             - Hapus Stopwords Bahasa Indonesia
                                   │
                                   ▼
                [ Transformasi TF-IDF Vectorizer ]
                                   │
                                   ▼
              [ Hitung Cosine Similarity vs Matriks ]
                                   │
                       Apakah skor >= 0.35?
                             /          \
                         (Ya)            (Tidak)
                         /                  \
                        ▼                    ▼
             [ Kembalikan Jawaban ]   [ Fallback: Fuzzy Matching ]
             Metode: cosine_similarity  bersihkan_teks() + RapidFuzz
                                             │
                                     Apakah skor >= 75?
                                           /          \
                                       (Ya)            (Tidak)
                                       /                  \
                                      ▼                    ▼
                           [ Kembalikan Jawaban ]   [ Status: no_answer ]
                           Metode: fuzzy_matching    answer: null
```

### Analisis & Dokumentasi Ketidaksesuaian Notebook (Langkah 2 vs Langkah 3)
1. **Normalisasi Fitur TF-IDF**: Pada Langkah 2 notebook (`normalisasi_teks`), korpus teks diproses melalui Unicode NFKC, pembersihan URL, pembuangan tanda baca, serta **penghapusan stopwords Bahasa Indonesia** (`stopwords_id`). Fitur TF-IDF (`search_text`) terbentuk dari gabungan pertanyaan bersih dan kata kunci (`keywords_normalized`).
2. **Kesesuaian Indeks Matriks**: Matriks TF-IDF (`tfidf_matrix.npz`) memiliki dimensi tepat `(8391, 31969)` yang berkorespondensi 1:1 terhadap 8.391 baris `dataset_faq_preprocessed.csv`.
3. **Dual Preprocessing**:
   - Untuk **Cosine Similarity**, input pengguna dinormalisasi menggunakan `normalisasi_teks` konsisten dengan pembentukan model TF-IDF agar bobot vektor konsisten.
   - Untuk **Fuzzy Matching**, input pengguna dibersihkan dengan `bersihkan_teks` (hanya alphanumeric dan spasi) tanpa menghapus stopwords agar susunan karakter alami tetap terjaga untuk perbandingan jarak Levenshtein (`fuzz.ratio`).

---

## 6. Dokumentasi REST API

### 1. GET `/health`
Mengembalikan status kesehatan sistem secara menyeluruh.
**Contoh Respons:**
```json
{
  "status": "healthy",
  "app": {
    "name": "Academic Assistant ITS",
    "environment": "development",
    "version": "1.0.0"
  },
  "model": {
    "loaded": true,
    "matrix_shape": [8391, 31969],
    "vocab_size": 31969,
    "fuzzy_corpus_size": 8391,
    "cosine_threshold": 0.35,
    "fuzzy_threshold": 75.0
  },
  "dataset": {
    "loaded": true,
    "total_faq": 8391,
    "verification_rows": 270,
    "columns": ["id", "question", "context", "category", "intent", "keywords", ...]
  },
  "database": {
    "connected": true,
    "engine": "sqlite"
  }
}
```

### 2. POST `/api/process`
Endpoint utama untuk memproses pertanyaan pengguna.
**Request Payload:**
```json
{
  "question": "Bagaimana cara mengajukan cuti?",
  "user_id": 1
}
```
**Respons (Cosine Similarity):**
```json
{
  "success": true,
  "status": "answer_found",
  "question": "Bagaimana cara mengajukan cuti?",
  "answer": "Permohonan cuti akademik diajukan kepada Dekan/Direktur pada awal semester...",
  "category": "Akademik",
  "match_method": "cosine_similarity",
  "score": 0.8488,
  "matched_question": "Bagaimana cara mengajukan cuti akademik?",
  "execution_time_ms": 12.4
}
```
**Respons (Fuzzy Matching — dengan typo pengguna):**
```json
{
  "success": true,
  "status": "answer_found",
  "question": "Apa visii uin sunan kalijaga?",
  "answer": "Visi UIN Sunan Kalijaga adalah 'Unggul dan Terkemuka dalam Pemaduan dan Pengembangan Keislaman dan Keilmuan bagi Peradaban'.",
  "category": "Kelembagaan",
  "match_method": "fuzzy_matching",
  "score": 98.18,
  "matched_question": "Apa visi UIN Sunan Kalijaga?",
  "execution_time_ms": 4.1
}
```
**Respons (Pertanyaan Tidak Relevan / Di luar FAQ):**
```json
{
  "success": true,
  "status": "no_answer",
  "question": "Bagaimana cara memasak nasi goreng enak?",
  "answer": null,
  "category": null,
  "match_method": null,
  "score": 0.2655,
  "matched_question": null,
  "execution_time_ms": 8.7
}
```

### 3. Endpoint Gamifikasi

| Metode | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/gamification/profile` | Mengambil data profil, level dinamis, total XP, dan badge mahasiswa |
| `GET` | `/api/gamification/progress` | Rincian progres bar level, quest harian selesai, dan target XP |
| `GET` | `/api/gamification/achievements` | Seluruh daftar badge pencapaian beserta status unlock |
| `GET` | `/api/gamification/quests` | Daftar misi harian (daily quests) dan progres hari ini |
| `POST` | `/api/gamification/quests/{quest_id}/complete` | Klaim penyelesaian quest & penambahan reward XP (divalidasi server) |
| `GET` | `/api/gamification/leaderboard` | Peringkat mahasiswa dengan XP tertinggi |

### 4. Kebijakan Anti-Spam Gamifikasi
XP **tidak diberikan secara bebas** untuk setiap pertanyaan chat yang dikirim berulang kali. XP hanya dapat diperoleh melalui:
1. Penyelesaian Daily Quest resmi yang diverifikasi di server (`quest_daily_login`, `quest_first_faq`, `quest_curriculum`, `quest_feedback`).
2. Milestone Achievement yang terbuka sekali seumur hidup (*one-time unlock*).
Nilai XP dikontrol 100% oleh backend; backend menolak manipulasi nilai XP dari klien/frontend.

---

## 7. Menjalankan Pengujian (Testing)

Pengujian dibangun menggunakan **Pytest** dengan 28 test cases mencakup seluruh skenario fungsional, NLP, validasi Pydantic, database, dan gamifikasi:

Jalankan perintah:
```powershell
pytest -v
```

Hasil eksekusi:
```
============================= test session starts =============================
collected 28 items

backend/tests/test_chatbot_api.py::test_api_process_cosine_success PASSED
backend/tests/test_chatbot_api.py::test_api_process_fuzzy_fallback_success PASSED
backend/tests/test_chatbot_api.py::test_api_process_no_answer PASSED
backend/tests/test_chatbot_api.py::test_empty_question_validation_error PASSED
backend/tests/test_chatbot_api.py::test_whitespace_only_question_validation_error PASSED
backend/tests/test_chatbot_api.py::test_missing_field_validation_error PASSED
backend/tests/test_chatbot_api.py::test_invalid_type_validation_error PASSED
backend/tests/test_chatbot_api.py::test_question_too_long_validation_error PASSED
backend/tests/test_chatbot_api.py::test_get_categories_and_samples_api PASSED
backend/tests/test_gamification.py::test_quest_completion_and_xp_awarded PASSED
backend/tests/test_gamification.py::test_badge_and_progress_updated PASSED
backend/tests/test_gamification.py::test_anti_spam_xp_policy PASSED
backend/tests/test_gamification.py::test_gamification_leaderboard PASSED
backend/tests/test_gamification.py::test_cannot_complete_same_quest_twice PASSED
backend/tests/test_health.py::test_health_check_success PASSED
backend/tests/test_ml_loader.py::test_model_loaded_successfully PASSED
backend/tests/test_ml_loader.py::test_dataset_loaded_successfully PASSED
backend/tests/test_ml_loader.py::test_matrix_and_dataset_index_alignment PASSED
backend/tests/test_ml_loader.py::test_verification_dataset_present PASSED
backend/tests/test_preprocessing.py::test_preprocessing_unicode_nfkc_and_lowercase PASSED
backend/tests/test_preprocessing.py::test_preprocessing_url_removal PASSED
backend/tests/test_preprocessing.py::test_preprocessing_punctuation_and_underscores PASSED
backend/tests/test_preprocessing.py::test_preprocessing_stopword_removal PASSED
backend/tests/test_preprocessing.py::test_clean_text_for_fuzzy_matching PASSED
backend/tests/test_similarity.py::test_cosine_similarity_finds_answer PASSED
backend/tests/test_similarity.py::test_fuzzy_matching_handles_typo PASSED
backend/tests/test_similarity.py::test_valid_faq_question_full_pipeline PASSED
backend/tests/test_similarity.py::test_irrelevant_question_returns_no_answer PASSED

====================== 28 passed in 4.61s ======================
```
Semua 28 skenario pengujian dinyatakan **100% Passed**.
