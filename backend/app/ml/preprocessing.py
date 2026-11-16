import re
import unicodedata
from typing import Optional, Set

# Daftar stopwords Bahasa Indonesia yang digunakan pada Langkah 2 Notebook Tubes_ITS_Kel_1.ipynb (Cell 72)
STOPWORDS_ID: Set[str] = {
    "yang", "dan", "di", "ke", "dari",
    "pada", "untuk", "dengan", "adalah",
    "ini", "itu", "dalam", "sebagai",
    "oleh", "atau", "juga", "akan",
    "dapat", "bisa", "karena", "agar",
    "serta", "telah", "sudah", "ada",
    "tersebut", "para", "sebuah", "satu",
    "lebih", "secara", "maupun", "antara",
    "bagi", "kepada", "tentang", "yaitu",
    "yakni", "terhadap", "saat", "ketika",
    "setelah", "sebelum", "hingga",
    "sampai", "merupakan"
}

def normalisasi_teks(teks: Optional[str]) -> str:
    """
    Fungsi normalisasi teks asli dari Google Colab Langkah 2 (Cell 72).
    
    Tahapan:
    1. Unicode Normalization NFKC.
    2. Lowercase.
    3. Pembersihan URL (http/https/www).
    4. Penghapusan tanda baca ([^\\w\\s] unicode).
    5. Normalisasi underscore / spasi.
    6. Token filtering (panjang > 1 atau isdigit) dan stopword removal bahasa Indonesia.
    """
    if teks is None:
        return ""

    # 1 & 2: NFKC normalization and lowercasing
    teks_norm = unicodedata.normalize("NFKC", str(teks)).lower()

    # 3: Remove URLs
    teks_norm = re.sub(r"https?://\S+|www\.\S+", " ", teks_norm)

    # 4: Remove punctuation
    teks_norm = re.sub(r"[^\w\s]", " ", teks_norm, flags=re.UNICODE)

    # 5: Replace underscores with space
    teks_norm = re.sub(r"_+", " ", teks_norm)

    # 6: Filter tokens: length > 1 or isdigit, not in stopwords_id
    tokens = [
        kata for kata in teks_norm.split()
        if (len(kata) > 1 or kata.isdigit())
        and kata not in STOPWORDS_ID
    ]

    return " ".join(tokens)


def bersihkan_teks(teks: Optional[str]) -> str:
    """
    Fungsi pembersihan teks sederhana asli dari Google Colab Langkah 3 (Cell 78 & 80).
    Digunakan secara spesifik untuk Fuzzy Matching agar urutan karakter tetap terjaga
    untuk mengukur Levenshtein/fuzz distance pada typo.
    """
    if teks is None:
        return ""
    teks_clean = str(teks).lower()
    teks_clean = re.sub(r'[^a-z0-9\s]', ' ', teks_clean)
    teks_clean = re.sub(r'\s+', ' ', teks_clean).strip()
    return teks_clean
