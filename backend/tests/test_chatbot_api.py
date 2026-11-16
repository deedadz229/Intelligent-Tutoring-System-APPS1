from fastapi.testclient import TestClient

def test_api_process_cosine_success(client: TestClient):
    """Memeriksa POST /api/process berhasil menemukan jawaban via cosine similarity."""
    payload = {
        "question": "Bagaimana cara mengajukan cuti?"
    }
    response = client.post("/api/process", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert data["status"] == "answer_found"
    assert data["question"] == payload["question"]
    assert data["answer"] is not None
    assert data["category"] is not None
    assert data["match_method"] == "cosine_similarity"


def test_api_process_fuzzy_fallback_success(client: TestClient):
    """Memeriksa POST /api/process fallback ke fuzzy matching saat ada typo signifikan."""
    payload = {
        "question": "Apa visii uin sunan kalijaga?"
    }
    response = client.post("/api/process", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert data["status"] == "answer_found"
    assert data["answer"] is not None
    assert data["match_method"] in ["cosine_similarity", "fuzzy_matching"]


def test_api_process_no_answer(client: TestClient):
    """Memeriksa respons JSON ketika tidak ada FAQ yang cocok (contoh asli notebook)."""
    payload = {
        "question": "Bagaimana cara memasak nasi goreng enak?"
    }
    response = client.post("/api/process", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert data["status"] == "no_answer"
    assert data["answer"] is None
    assert data["category"] is None
    assert data["match_method"] is None


def test_empty_question_validation_error(client: TestClient):
    """
    Test Case 8: Pertanyaan kosong
    Memeriksa input string kosong ditolak dengan HTTP 422.
    """
    response = client.post("/api/process", json={"question": ""})
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert data["status"] == "validation_error"


def test_whitespace_only_question_validation_error(client: TestClient):
    """Memeriksa input hanya spasi ditolak dengan HTTP 422."""
    response = client.post("/api/process", json={"question": "     "})
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False


def test_missing_field_validation_error(client: TestClient):
    """
    Test Case 9: Missing field
    Memeriksa payload tanpa key 'question' ditolak dengan HTTP 422.
    """
    response = client.post("/api/process", json={})
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert data["status"] == "validation_error"


def test_invalid_type_validation_error(client: TestClient):
    """
    Test Case 10: Tipe input tidak sesuai
    Memeriksa input angka atau array bukannya string ditolak dengan HTTP 422.
    """
    response = client.post("/api/process", json={"question": 123456})
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False

    response_array = client.post("/api/process", json={"question": ["bukan", "string"]})
    assert response_array.status_code == 422


def test_question_too_long_validation_error(client: TestClient):
    """Memeriksa pertanyaan melebihi batas 1000 karakter ditolak dengan HTTP 422."""
    long_question = "a" * 1005
    response = client.post("/api/process", json={"question": long_question})
    assert response.status_code == 422


def test_get_categories_and_samples_api(client: TestClient):
    """Memeriksa endpoint daftar kategori FAQ dan contoh pertanyaan."""
    cat_resp = client.get("/api/faq/categories")
    assert cat_resp.status_code == 200
    categories = cat_resp.json()
    assert isinstance(categories, list)
    assert len(categories) > 0

    samples_resp = client.get("/api/faq/samples?limit=3")
    assert samples_resp.status_code == 200
    samples = samples_resp.json()
    assert isinstance(samples, list)
    assert len(samples) == 3
