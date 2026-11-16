from app.ml.preprocessing import normalisasi_teks, bersihkan_teks, STOPWORDS_ID

def test_preprocessing_unicode_nfkc_and_lowercase():
    """Memeriksa normalisasi Unicode NFKC dan penyeragaman huruf kecil."""
    # Karakter full-width atau aksen
    raw = "Ｂａｇａｉｍａｎａ Ｃａｒａ MENGURUS cuti？"
    norm = normalisasi_teks(raw)
    assert norm == "bagaimana cara mengurus cuti"


def test_preprocessing_url_removal():
    """Memeriksa pembersihan tautan website (URL http/https/www)."""
    raw = "Silakan cek di https://uin-suka.ac.id/panduan atau www.its.ac.id mengenai KRS"
    norm = normalisasi_teks(raw)
    assert "https" not in norm
    assert "uin-suka" not in norm
    assert "www" not in norm
    assert "krs" in norm


def test_preprocessing_punctuation_and_underscores():
    """Memeriksa penghapusan tanda baca dan garis bawah."""
    raw = "Apakah__ada (ujian) susulan/remedial di semester ini?!"
    norm = normalisasi_teks(raw)
    assert "(" not in norm and ")" not in norm
    assert "?" not in norm and "!" not in norm
    assert "__" not in norm
    assert "ujian susulan remedial semester" in norm


def test_preprocessing_stopword_removal():
    """Memeriksa penghapusan stopwords bahasa Indonesia sesuai daftar Langkah 2."""
    raw = "Buku pedoman ini adalah untuk mahasiswa yang ada di kampus"
    norm = normalisasi_teks(raw)
    # Stopwords: 'ini', 'adalah', 'untuk', 'yang', 'ada', 'di' harus dibuang
    for sw in ["ini", "adalah", "untuk", "yang", "ada", "di"]:
        assert sw not in norm.split()
    assert "buku" in norm
    assert "pedoman" in norm
    assert "mahasiswa" in norm
    assert "kampus" in norm


def test_clean_text_for_fuzzy_matching():
    """Memeriksa fungsi pembersihan teks khusus fuzzy matching (Langkah 3)."""
    raw = "Apa visii UIN Sunan Kalijaga?! (2024)"
    clean = bersihkan_teks(raw)
    assert clean == "apa visii uin sunan kalijaga 2024"
