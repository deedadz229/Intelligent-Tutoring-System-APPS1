from typing import Any, Dict, List, Optional
import pandas as pd
from app.ml.model_loader import model_loader

class FAQService:
    def get_faq_by_id(self, faq_id: int) -> Optional[Dict[str, Any]]:
        df = model_loader.get_dataframe()
        matched = df[df["id"] == faq_id]
        if not matched.empty:
            return matched.iloc[0].to_dict()
        return None

    def get_categories(self) -> List[Dict[str, Any]]:
        df = model_loader.get_dataframe()
        if "category" in df.columns:
            counts = df["category"].value_counts().to_dict()
            return [{"category": k, "count": int(v)} for k, v in counts.items()]
        return []

    def get_sample_questions(self, limit: int = 5) -> List[str]:
        df = model_loader.get_dataframe()
        samples = df["question"].dropna().sample(min(limit, len(df)), random_state=42).tolist()
        return samples

    def get_verification_items(self, limit: int = 20) -> List[Dict[str, Any]]:
        df_verif = model_loader.get_verification_df()
        if df_verif is not None:
            return df_verif.head(limit).to_dict(orient="records")
        return []

faq_service = FAQService()
