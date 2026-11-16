from fastapi.testclient import TestClient

def test_health_check_success(client: TestClient):
    """
    Test Case 1: GET /health berhasil
    Memeriksa ketersediaan status aplikasi, model, dataset, dan database.
    """
    response = client.get("/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert "app" in data
    assert data["app"]["name"] == "Academic Assistant ITS"

    # Status Model
    assert "model" in data
    assert data["model"]["loaded"] is True
    assert data["model"]["vocab_size"] == 31969
    assert data["model"]["matrix_shape"] == [8391, 31969]

    # Status Dataset
    assert "dataset" in data
    assert data["dataset"]["loaded"] is True
    assert data["dataset"]["total_faq"] == 8391
    assert data["dataset"]["verification_rows"] == 270

    # Status Database
    assert "database" in data
    assert data["database"]["connected"] is True
    assert data["database"]["engine"] == "sqlite"
