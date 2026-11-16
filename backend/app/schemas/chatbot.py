from typing import Optional
from pydantic import BaseModel, Field, field_validator

class ProcessRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Pertanyaan pengguna terkait informasi atau FAQ akademik",
        examples=["Bagaimana cara mengajukan cuti?"]
    )
    user_id: Optional[int] = Field(
        default=1,
        description="ID pengguna untuk mencatat histori dan quest akademik (default: 1)"
    )

    @field_validator("question")
    @classmethod
    def validate_not_blank(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("Pertanyaan tidak boleh kosong atau hanya berisi spasi.")
        return value.strip()


class ProcessResponse(BaseModel):
    success: bool = Field(..., description="Status keberhasilan pemrosesan API")
    status: str = Field(..., description="Status hasil pencarian: 'answer_found' atau 'no_answer'")
    question: str = Field(..., description="Pertanyaan yang diajukan oleh pengguna")
    answer: Optional[str] = Field(None, description="Jawaban FAQ dari dataset")
    category: Optional[str] = Field(None, description="Kategori pertanyaan FAQ")
    match_method: Optional[str] = Field(
        None,
        description="Metode pencocokan: 'cosine_similarity', 'fuzzy_matching', atau null"
    )
    score: Optional[float] = Field(None, description="Skor kemiripan yang diperoleh")
    matched_question: Optional[str] = Field(None, description="Pertanyaan FAQ terdekat yang cocok")
    execution_time_ms: Optional[float] = Field(None, description="Waktu eksekusi dalam milidetik")
    accuracy_level: Optional[str] = Field(
        None,
        description="Tingkat akurasi hasil pencarian: 'Tinggi' (>=0.70), 'Sedang' (0.35-0.69), atau 'Rendah' (<0.35)"
    )
    xp_earned: int = Field(
        default=0,
        description="XP yang diperoleh dari pertanyaan ini (berdasarkan aturan backend)"
    )
    level_up: bool = Field(
        default=False,
        description="Apakah aktivitas ini memicu kenaikan level pengguna"
    )
    new_total_xp: Optional[int] = Field(
        None,
        description="Total akumulasi XP pengguna terkini setelah aktivitas ini"
    )
    current_level: Optional[int] = Field(
        None,
        description="Tingkat level pengguna saat ini"
    )


class FeedbackRequest(BaseModel):
    chat_id: Optional[int] = Field(None, description="ID interaksi chat history")
    rating: int = Field(..., ge=1, le=5, description="Nilai rating bintang 1-5")
    comment: Optional[str] = Field(None, max_length=500, description="Komentar atau saran pengguna")
    user_id: Optional[int] = Field(default=1, description="ID pengguna")
