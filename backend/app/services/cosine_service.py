import time
from typing import Any, Dict, Optional
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from app.core.config import settings
from app.ml.model_loader import model_loader
from app.ml.preprocessing import normalisasi_teks, bersihkan_teks

class CosineService:
    def __init__(self):
        self.default_threshold = settings.COSINE_THRESHOLD

    def match(self, query: str, threshold: Optional[float] = None) -> Dict[str, Any]:
        """
        Melakukan pencarian jawaban FAQ menggunakan TF-IDF + Cosine Similarity
        sesuai Langkah 2 & Langkah 3 Google Colab Notebook (Cell 74 & 78).
        """
        if threshold is None:
            threshold = self.default_threshold

        start_time = time.time()

        # 1. Normalisasi pertanyaan menggunakan fungsi normalisasi konsisten Langkah 2
        teks_clean = normalisasi_teks(query)
        # Jika setelah penghapusan stopwords teks kosong, coba pembersihan teks langkah 3
        if not teks_clean.strip():
            teks_clean = bersihkan_teks(query)

        if not teks_clean.strip():
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

        vectorizer = model_loader.get_vectorizer()
        tfidf_matrix = model_loader.get_matrix()
        df_faq = model_loader.get_dataframe()

        # 2. Transformasi ke vektor TF-IDF
        user_vec = vectorizer.transform([teks_clean])

        # 3. Hitung Cosine Similarity terhadap seluruh matriks FAQ
        similarities = cosine_similarity(user_vec, tfidf_matrix).flatten()

        # 4. Ambil skor tertinggi
        best_idx = int(np.argmax(similarities))
        best_score = float(similarities[best_idx])
        execution_time_ms = round((time.time() - start_time) * 1000, 2)

        # 5. Evaluasi terhadap threshold (0.35)
        if best_score >= threshold:
            row = df_faq.iloc[best_idx]
            return {
                "matched": True,
                "score": round(best_score, 4),
                "index": best_idx,
                "question": str(row["question"]),
                "answer": str(row["context"]),
                "category": str(row["category"]),
                "intent": str(row["intent"]) if pd_not_na(row.get("intent")) else "Umum",
                "execution_time_ms": execution_time_ms
            }
        else:
            return {
                "matched": False,
                "score": round(best_score, 4),
                "index": best_idx,
                "question": None,
                "answer": None,
                "category": None,
                "intent": None,
                "execution_time_ms": execution_time_ms
            }

def pd_not_na(val: Any) -> bool:
    if val is None:
        return False
    if isinstance(val, float) and np.isnan(val):
        return False
    return bool(str(val).strip())

cosine_service = CosineService()
