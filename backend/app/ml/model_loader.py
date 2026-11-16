import logging
from typing import Any, Dict, List, Optional
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from scipy.sparse import load_npz, spmatrix
from sklearn.feature_extraction.text import TfidfVectorizer

from app.core.config import settings
from app.ml.preprocessing import bersihkan_teks

logger = logging.getLogger(__name__)

class ModelLoader:
    _instance: Optional["ModelLoader"] = None

    def __init__(self):
        self.df_faq: Optional[pd.DataFrame] = None
        self.tfidf_matrix: Optional[spmatrix] = None
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.df_verification: Optional[pd.DataFrame] = None
        self.fuzzy_corpus: List[str] = []
        self._is_loaded: bool = False

    @classmethod
    def get_instance(cls) -> "ModelLoader":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_artifacts(self) -> None:
        """Load all preprocessed artifacts and models."""
        dataset_path = settings.resolve_path(settings.DATASET_PATH)
        matrix_path = settings.resolve_path(settings.TFIDF_MATRIX_PATH)
        vectorizer_path = settings.resolve_path(settings.TFIDF_VECTORIZER_PATH)
        verif_path = settings.resolve_path(settings.VERIFICATION_DATASET_PATH)

        logger.info(f"Loading dataset from: {dataset_path}")
        if not dataset_path.exists():
            raise FileNotFoundError(f"Dataset preprocessed tidak ditemukan di: {dataset_path}")
        self.df_faq = pd.read_csv(dataset_path)

        logger.info(f"Loading TF-IDF matrix from: {matrix_path}")
        if not matrix_path.exists():
            raise FileNotFoundError(f"TF-IDF matrix tidak ditemukan di: {matrix_path}")
        self.tfidf_matrix = load_npz(matrix_path)

        logger.info(f"Loading TF-IDF vectorizer from: {vectorizer_path}")
        if not vectorizer_path.exists():
            raise FileNotFoundError(f"TF-IDF vectorizer tidak ditemukan di: {vectorizer_path}")
        self.vectorizer = joblib.load(vectorizer_path)

        # Verifikasi konsistensi jumlah baris dan dimensi fitur
        if self.df_faq.shape[0] != self.tfidf_matrix.shape[0]:
            raise ValueError(
                f"Inkonsistensi dimensi: Jumlah baris dataset ({self.df_faq.shape[0]}) "
                f"tidak sama dengan baris matriks TF-IDF ({self.tfidf_matrix.shape[0]})."
            )

        vocab_len = len(self.vectorizer.vocabulary_)
        if vocab_len != self.tfidf_matrix.shape[1]:
            raise ValueError(
                f"Inkonsistensi fitur: Kosakata vectorizer ({vocab_len}) "
                f"tidak sama dengan kolom matriks ({self.tfidf_matrix.shape[1]})."
            )

        # Load verification dataset jika ada
        if verif_path.exists():
            self.df_verification = pd.read_csv(verif_path)
            logger.info(f"Verification dataset loaded with {len(self.df_verification)} rows.")
        else:
            self.df_verification = None

        # Siapkan corpus bersih untuk Fuzzy Matching (Langkah 3 Cell 80)
        questions_raw = self.df_faq["question"].fillna("").astype(str).tolist()
        self.fuzzy_corpus = [bersihkan_teks(q) for q in questions_raw]

        self._is_loaded = True
        logger.info(
            f"Artifacts successfully loaded: {len(self.df_faq)} FAQs, "
            f"Matrix shape {self.tfidf_matrix.shape}, Vocab {vocab_len} features."
        )

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded

    def get_dataframe(self) -> pd.DataFrame:
        if not self._is_loaded or self.df_faq is None:
            self.load_artifacts()
        return self.df_faq

    def get_matrix(self) -> spmatrix:
        if not self._is_loaded or self.tfidf_matrix is None:
            self.load_artifacts()
        return self.tfidf_matrix

    def get_vectorizer(self) -> TfidfVectorizer:
        if not self._is_loaded or self.vectorizer is None:
            self.load_artifacts()
        return self.vectorizer

    def get_fuzzy_corpus(self) -> List[str]:
        if not self._is_loaded or not self.fuzzy_corpus:
            self.load_artifacts()
        return self.fuzzy_corpus

    def get_verification_df(self) -> Optional[pd.DataFrame]:
        return self.df_verification

    def get_stats(self) -> Dict[str, Any]:
        if not self._is_loaded:
            return {"loaded": False}
        return {
            "loaded": True,
            "dataset_rows": len(self.df_faq) if self.df_faq is not None else 0,
            "dataset_columns": list(self.df_faq.columns) if self.df_faq is not None else [],
            "matrix_shape": list(self.tfidf_matrix.shape) if self.tfidf_matrix is not None else [],
            "vocab_size": len(self.vectorizer.vocabulary_) if self.vectorizer is not None else 0,
            "fuzzy_corpus_size": len(self.fuzzy_corpus),
            "verification_rows": len(self.df_verification) if self.df_verification is not None else 0
        }

model_loader = ModelLoader.get_instance()
