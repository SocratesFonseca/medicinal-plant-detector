import { useEffect, useRef, useState } from "react";
import "./App.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const uploadInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function selectImage(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError("");

    if (event.target === uploadInputRef.current) {
      cameraInputRef.current.value = "";
    } else {
      uploadInputRef.current.value = "";
    }
  }

  async function submitImage() {
    if (!selectedFile) {
      setError("Choose or take a photo before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsSubmitting(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "The image could not be analyzed.");
      }

      setResult(data);
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "Could not reach the prediction service. Check the backend URL and try again."
          : requestError.message,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="detector-card">
        <header className="intro">
          <p className="eyebrow">Plant identification</p>
          <h1>Medicinal Plant Detector</h1>
          <p className="intro-copy">
            Select a clear plant photo to receive a preliminary prediction.
          </p>
        </header>

        <div className="action-grid" aria-label="Choose an image source">
          <label className="image-action">
            <span className="action-icon" aria-hidden="true">↑</span>
            <span>Upload Image</span>
            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              onChange={selectImage}
            />
          </label>

          <label className="image-action secondary">
            <span className="action-icon camera-icon" aria-hidden="true" />
            <span>Take Photo</span>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={selectImage}
            />
          </label>
        </div>

        {previewUrl && (
          <section className="preview-section" aria-labelledby="preview-heading">
            <div className="section-heading">
              <h2 id="preview-heading">Selected image</h2>
              <span>{selectedFile.name}</span>
            </div>
            <img className="image-preview" src={previewUrl} alt="Selected plant preview" />
            <button
              className="submit-button"
              type="button"
              onClick={submitImage}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Analyzing..." : "Identify Plant"}
            </button>
          </section>
        )}

        {error && (
          <p className="status-message error-message" role="alert">
            {error}
          </p>
        )}

        {result && (
          <section className="results" aria-labelledby="results-heading">
            <p className="eyebrow">Prediction results</p>
            <h2 id="results-heading">Possible match</h2>
            <div className="prediction-list">
              {result.predictions.map((prediction, index) => (
                <article className="prediction" key={`${prediction.label}-${index}`}>
                  <span>{prediction.label.replaceAll("_", " ")}</span>
                  <strong>{Math.round(prediction.confidence * 100)}%</strong>
                </article>
              ))}
            </div>
            <p className="disclaimer">{result.disclaimer}</p>
          </section>
        )}
      </section>
    </main>
  );
}

export default App;
