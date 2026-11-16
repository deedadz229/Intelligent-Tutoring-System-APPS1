from app.ml.model_loader import model_loader

def test_model_loaded_successfully():
    """
    Test Case 2: Model berhasil dimuat
    Memeriksa keberadaan dan validitas TF-IDF vectorizer dan matriks.
    """
    assert model_loader.is_loaded is True
    vectorizer = model_loader.get_vectorizer()
    matrix = model_loader.get_matrix()

    assert vectorizer is not None
    assert matrix is not None
    # Pastikan ukuran vocabulary konsisten dengan notebook
    assert len(vectorizer.vocabulary_) == 31969
    assert matrix.shape[1] == 31969


def test_dataset_loaded_successfully():
    """
    Test Case 3: Dataset berhasil dimuat
    Memeriksa keberadaan dataset FAQ hasil preprocessing Langkah 2.
    """
    df = model_loader.get_dataframe()
    assert df is not None
    assert len(df) == 8391
    # Memeriksa kolom esensial
    for col in ["question", "context", "category", "intent", "keywords"]:
        assert col in df.columns


def test_matrix_and_dataset_index_alignment():
    """
    Memastikan kesesuaian jumlah baris dataset dengan jumlah baris matriks TF-IDF.
    Setiap indeks matriks harus mengacu secara tepat pada FAQ yang benar.
    """
    df = model_loader.get_dataframe()
    matrix = model_loader.get_matrix()

    assert df.shape[0] == matrix.shape[0], (
        f"Jumlah baris dataset ({df.shape[0]}) tidak sama dengan baris matriks ({matrix.shape[0]})"
    )
    # Verifikasi baris pertama dan baris terakhir
    first_q = df.iloc[0]["question"]
    last_q = df.iloc[-1]["question"]
    assert isinstance(first_q, str) and len(first_q) > 0
    assert isinstance(last_q, str) and len(last_q) > 0


def test_verification_dataset_present():
    """Memeriksa keberadaan data verifikasi Langkah 2 (qa_perlu_verifikasi.csv)."""
    df_verif = model_loader.get_verification_df()
    assert df_verif is not None
    assert len(df_verif) == 270
    assert "question_asli" in df_verif.columns
    assert "context_asli" in df_verif.columns
