import time
from typing import Any, Dict, Optional
from rapidfuzz import process, fuzz

from app.core.config import settings
from app.ml.model_loader import model_loader
from app.ml.preprocessing import bersihkan_teks

class FuzzyService:
    def __init__(self):
        self.default_threshold = settings.FUZZY_THRESHOLD

    def match(self, query: str, threshold: Optional[float] = None) -> Dict[str, Any]:
        """
        Melakukan pencarian jawaban FAQ menggunakan Fuzzy Matching (RapidFuzz)
        sesuai Langkah 3 Google Colab Notebook (Cell 81).
        """
        if threshold is None:
            threshold = self.default_threshold

        start_time = time.time()

        # 1. Membersihkan teks input pengguna sesuai Cell 81
        teks_user = bersihkan_teks(query)
        if not teks_user:
            execution_time_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "matched": False,
                "score": 0.0,
                "index": None,
                "question": None,
                "answer": None,
                "category": None,
                "intent": None,
                "execution_time_ms": execution_time_ms
            }

        df_faq = model_loader.get_dataframe()
        fuzzy_corpus = model_loader.get_fuzzy_corpus()

        # 2. Mencari pertanyaan yang paling mirip dengan fuzz.ratio
        hasil = process.extractOne(
            teks_user,
            fuzzy_corpus,
            scorer=fuzz.ratio
        )

        execution_time_ms = round((time.time() - start_time) * 1000, 2)

        # 3. Evaluasi terhadap threshold (75)
        if hasil and hasil[1] >= threshold:
            indeks = int(hasil[2])
            row = df_faq.iloc[indeks]
            return {
                "matched": True,
                "score": round(float(hasil[1]), 2),
                "index": indeks,
                "question": str(row["question"]),
                "answer": str(row["context"]),
                "category": str(row["category"]),
                "intent": str(row["intent"]) if hasattr(row, "intent") and str(row["intent"]) != "nan" else "Umum",
                "execution_time_ms": execution_time_ms
            }
        else:
            return {
                "matched": False,
                "score": round(float(hasil[1]), 2) if hasil else 0.0,
                "index": int(hasil[2]) if hasil else None,
                "question": None,
                "answer": None,
                "category": None,
                "intent": None,
                "execution_time_ms": execution_time_ms
            }

fuzzy_service = FuzzyService()
