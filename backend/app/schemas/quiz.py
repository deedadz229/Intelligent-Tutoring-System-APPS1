from typing import List, Optional
from pydantic import BaseModel, Field

class QuizOption(BaseModel):
    id: str = Field(..., description="ID opsi jawaban (A, B, C, D)")
    text: str = Field(..., description="Teks opsi jawaban")


class QuizQuestion(BaseModel):
    id: str = Field(..., description="ID unik pertanyaan kuis")
    question: str = Field(..., description="Pertanyaan akademik seputar pedoman kampus")
    category: str = Field(..., description="Kategori akademik")
    options: List[QuizOption] = Field(..., description="Daftar 4 pilihan ganda")


class QuizAnswerSubmission(BaseModel):
    question_id: str = Field(..., description="ID pertanyaan yang dijawab")
    selected_option_id: str = Field(..., description="ID opsi yang dipilih oleh pengguna")


class QuizSubmitRequest(BaseModel):
    user_id: Optional[int] = Field(default=1, description="ID pengguna")
    answers: List[QuizAnswerSubmission] = Field(..., min_length=1, description="Daftar jawaban pengguna")


class QuizQuestionReview(BaseModel):
    question_id: str = Field(..., description="ID pertanyaan")
    question: str = Field(..., description="Teks pertanyaan")
    category: str = Field(..., description="Kategori pertanyaan")
    user_selected_option_id: str = Field(..., description="Opsi yang dipilih pengguna")
    correct_option_id: str = Field(..., description="Opsi jawaban yang benar")
    is_correct: bool = Field(..., description="Apakah jawaban pengguna benar")
    explanation: str = Field(..., description="Penjelasan pedoman dan regulasi akademik resmi")


class QuizSubmitResponse(BaseModel):
    success: bool = Field(..., description="Status keberhasilan pengiriman")
    total_questions: int = Field(..., description="Jumlah total soal kuis")
    correct_count: int = Field(..., description="Jumlah jawaban benar")
    score_percentage: float = Field(..., description="Persentase nilai akhir (0-100)")
    xp_earned: int = Field(..., description="XP reward yang berhasil didapatkan")
    level_up: bool = Field(default=False, description="Apakah reward memicu kenaikan level")
    new_total_xp: int = Field(..., description="Total akumulasi XP terkini")
    current_level: int = Field(..., description="Level pengguna terkini")
    review: List[QuizQuestionReview] = Field(..., description="Ulasan detail setiap soal beserta pembahasan")
