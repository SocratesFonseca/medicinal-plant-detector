from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image

from app.main import DISCLAIMER, MAX_FILE_SIZE, app

client = TestClient(app)


def create_test_image() -> bytes:
    image = Image.new("RGB", (32, 32), color="green")
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def test_predict_accepts_valid_image() -> None:
    response = client.post(
        "/predict",
        files={"file": ("plant.png", create_test_image(), "image/png")},
    )

    assert response.status_code == 200
    assert response.json()["predictions"] == [
        {
            "label": "mock_plant",
            "confidence": 0.95,
            "bbox": None,
        }
    ]


def test_predict_rejects_invalid_file_type() -> None:
    response = client.post(
        "/predict",
        files={"file": ("notes.txt", b"not an image", "text/plain")},
    )

    assert response.status_code == 415
    assert response.json()["detail"] == (
        "Unsupported file type. Upload a JPEG, PNG, or WebP image."
    )


def test_predict_rejects_oversized_image() -> None:
    response = client.post(
        "/predict",
        files={"file": ("large.png", b"0" * (MAX_FILE_SIZE + 1), "image/png")},
    )

    assert response.status_code == 413
    assert response.json()["detail"] == (
        "Image is too large. Maximum file size is 5 MB."
    )


def test_predict_includes_disclaimer() -> None:
    response = client.post(
        "/predict",
        files={"file": ("plant.png", create_test_image(), "image/png")},
    )

    assert response.status_code == 200
    assert response.json()["disclaimer"] == DISCLAIMER
