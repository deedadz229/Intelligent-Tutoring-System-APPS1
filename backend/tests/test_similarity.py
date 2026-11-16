from app.services.cosine_service import cosine_service
from app.services.fuzzy_service import fuzzy_service
from app.services.chatbot_service import chatbot_service
from app.schemas.chatbot import ProcessRequest

def test_cosine_similarity_finds_answer():
    """
    Test Case 5: Cosine Similarity menemukan jawaban
    Memeriksa query akademik yang relevan mencapai threshold >= 0.35.
    """
    query = "Bagaimana cara mengajukan cuti?"
    result = cosine_service.match(query)

    assert result["matched"] is True
    assert result["score"] >= 0.35
    assert result["answer"] is not None
    assert len(result["answer"]) > 10
    assert "cuti" in result["answer"].lower() or "cuti" in result["question"].lower()


def test_fuzzy_matching_handles_typo():
    """
    Test Case 6: Fuzzy Matching menangani typo
    Memeriksa pertanyaan dengan saltik (typo) berhasil dicocokkan dengan threshold >= 75.
    """
    # Pertanyaan dengan typo sengaja: "visii" bukannya "visi"
    query_typo = "Apa visii uin sunan kalijaga?"
    fuzzy_res = fuzzy_service.match(query_typo)

    assert fuzzy_res["matched"] is True
    assert fuzzy_res["score"] >= 75.0
    assert fuzzy_res["answer"] is not None
    assert "visi" in fuzzy_res["question"].lower()


def test_valid_faq_question_full_pipeline():
    """
    Test Case 4: Pertanyaan FAQ valid
    Memeriksa alur menyeluruh chatbot pada pertanyaan panduan akademik.
    """
    request = ProcessRequest(
        question="Kapan Buku Pedoman Akademik Program Sarjana UIN Sunan Kalijaga ini diterbitkan?"
    )
    response = chatbot_service.process_query(request)

    assert response.success is True
    assert response.status == "answer_found"
    assert response.answer is not None
    assert response.match_method in ["cosine_similarity", "fuzzy_matching"]
    assert response.score is not None and response.score >= 0.35


def test_irrelevant_question_returns_no_answer():
    """
    Test Case 7: Pertanyaan tidak relevan
    Memeriksa pertanyaan di luar domain akademik menghasilkan status no_answer.
    """
    request = ProcessRequest(
        question="Bagaimana cara memasak rendang daging sapi pedas manis gurih di rumah?"
    )
    response = chatbot_service.process_query(request)

    assert response.success is True
    assert response.status == "no_answer"
    assert response.answer is None
    assert response.category is None
    assert response.match_method is None
