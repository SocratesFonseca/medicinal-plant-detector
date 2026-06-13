from fastapi import FastAPI

app = FastAPI(title="Medicinal Plant Detector API")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
