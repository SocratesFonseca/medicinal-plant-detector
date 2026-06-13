from io import BytesIO

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile, status
from PIL import Image, ImageOps, UnidentifiedImageError

app = FastAPI(title="Medicinal Plant Detector API")

MAX_FILE_SIZE = 5 * 1024 * 1024
SUPPORTED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
DISCLAIMER = (
    "Predictions are for educational use only and should not be used as a "
    "guaranteed plant identification or safety decision."
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> dict[str, object]:
    if file.content_type not in SUPPORTED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file type. Upload a JPEG, PNG, or WebP image.",
        )

    contents = await file.read(MAX_FILE_SIZE + 1)
    await file.close()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="Image is too large. Maximum file size is 5 MB.",
        )

    try:
        with Image.open(BytesIO(contents)) as image:
            image.load()
            rgb_image = ImageOps.exif_transpose(image).convert("RGB")
            image_array = np.asarray(rgb_image)
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file could not be read as an image.",
        ) from None

    bgr_image = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
    cv2.resize(bgr_image, (224, 224), interpolation=cv2.INTER_AREA)

    return {
        "predictions": [
            {
                "label": "mock_plant",
                "confidence": 0.95,
                "bbox": None,
            }
        ],
        "disclaimer": DISCLAIMER,
    }
