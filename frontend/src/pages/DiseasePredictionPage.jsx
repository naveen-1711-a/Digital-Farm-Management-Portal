import React, { useState } from 'react';
import axios from 'axios';
import { FaCloudUploadAlt, FaStethoscope, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaBug, FaChartPie, FaHeartbeat, FaRobot, FaBolt, FaLock, FaLightbulb } from 'react-icons/fa';
import '../styles/disease-prediction.css'; // We'll create this or use styled components

const DiseasePredictionPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handlePredict = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.post(`${backendUrl}/api/disease/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setResult(response.data);
      } else {
        setError(response.data.message || 'Prediction failed.');
      }
    } catch (err) {
      console.error('Prediction Error:', err);
      setError(err.response?.data?.message || 'An error occurred while connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="disease-prediction-page fade-in">

      {/* Hero Section */}
      <section className="fp-hero">
        <div className="fp-hero-inner">
          <div className="fp-badge">
            <FaRobot className="fp-badge-icon" />
            <span>AI-Powered Diagnostics</span>
          </div>
          <h1>Poultry Disease <span className="highlight">Prediction</span></h1>
          <p>
            Upload a clear photo of the suspected bird or droppings for AI-assisted disease screening and actionable recommendations.
          </p>
          
          <div className="fp-hero-stats">
            <div className="fp-stat">
              <span className="fp-stat-num">94%+</span>
              <span className="fp-stat-label">Test Accuracy</span>
            </div>
            <div className="fp-stat">
              <span className="fp-stat-num">&lt;2s</span>
              <span className="fp-stat-label">Detection</span>
            </div>
            <div className="fp-stat">
              <span className="fp-stat-num">4</span>
              <span className="fp-stat-label">Conditions</span>
            </div>
            <div className="fp-stat">
              <span className="fp-stat-num"><FaBolt style={{ color: '#fbbf24' }} /></span>
              <span className="fp-stat-label">Instant Analysis</span>
            </div>
          </div>

          <div className="supported-conditions">
            <span className="conditions-label">Supported Conditions:</span>
            <div className="condition-badges">
              <span className="condition-badge">🐔 Coccidiosis</span>
              <span className="condition-badge">🐔 Newcastle Disease</span>
              <span className="condition-badge">🐔 Salmonella</span>
              <span className="condition-badge">✅ Healthy</span>
            </div>
          </div>
        </div>
      </section>

      <div className="prediction-content-wrapper">
        <div className="prediction-content">
          
          {/* AI Features Highlight */}
          <div className="ai-features-grid">
            <div className="ai-feature">
              <FaLock className="ai-feature-icon" style={{ color: '#10b981' }} />
              <div className="ai-feature-text">
                <h4>Secure & Private</h4>
                <p>Uploaded images are processed securely.</p>
              </div>
            </div>
            <div className="ai-feature">
              <FaBolt className="ai-feature-icon" style={{ color: '#fbbf24' }} />
              <div className="ai-feature-text">
                <h4>Instant Results</h4>
                <p>Get prediction results within seconds.</p>
              </div>
            </div>
            <div className="ai-feature">
              <FaChartPie className="ai-feature-icon" style={{ color: '#3b82f6' }} />
              <div className="ai-feature-text">
                <h4>Confidence Score</h4>
                <p>View probability for each detected condition.</p>
              </div>
            </div>
            <div className="ai-feature">
              <FaLightbulb className="ai-feature-icon" style={{ color: '#f59e0b' }} />
              <div className="ai-feature-text">
                <h4>Actionable Guidance</h4>
                <p>Receive recommended next steps after prediction.</p>
              </div>
            </div>
          </div>

          <div className="upload-section">
            <div className="upload-box" onClick={() => document.getElementById('fileInput').click()}>
              <input
                type="file"
                id="fileInput"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="image-preview" />
              ) : (
                <div className="upload-placeholder">
                  <FaCloudUploadAlt className="upload-icon" />
                  <h3>Click to Upload Image</h3>
                  <p>Supports JPG, PNG, WEBP (Max 10MB)</p>
                </div>
              )}
            </div>

            <button
              className={`btn-predict ${loading || !selectedFile ? 'disabled' : ''}`}
              onClick={handlePredict}
              disabled={loading || !selectedFile}
            >
              {loading ? (
                <><FaSpinner className="spinner-icon" /> Analyzing Image...</>
              ) : (
                <><FaStethoscope /> Analyze Disease</>
              )}
            </button>

            {error && <div className="error-message"><FaExclamationTriangle /> {error}</div>}
          </div>

          {result && (
            <div className="results-grid fade-in">

              <div className={`feature-card ${result.severity === 'Low' ? 'card-green' : 'card-red'}`}>
                <div className="icon-wrapper">
                  {result.severity === 'Low' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                </div>
                <h3 className="card-title">Prediction Status</h3>
                <p className="card-text"><b>{result.status}</b></p>
              </div>

              <div className="feature-card card-red">
                <div className="icon-wrapper">
                  <FaBug />
                </div>
                <h3 className="card-title">Detected Condition</h3>
                <p className="card-text"><b>{result.disease.replace('_', ' ')}</b></p>
              </div>

              <div className="feature-card card-blue">
                <div className="icon-wrapper">
                  <FaChartPie />
                </div>
                <h3 className="card-title">Confidence Level</h3>
                <p className="card-text"><b>{result.confidence}%</b></p>
              </div>

              <div className="feature-card card-yellow">
                <div className="icon-wrapper">
                  <FaHeartbeat />
                </div>
                <h3 className="card-title">Severity Status</h3>
                <p className="card-text"><b>{result.severity}</b></p>
              </div>

              <div className="feature-card card-green card-span-2">
                <div className="icon-wrapper">
                  <FaStethoscope />
                </div>
                <h3 className="card-title">Actionable Recommendations</h3>
                <ul className="card-list">
                  {result.recommendation.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="feature-card card-red card-span-2">
                <div className="icon-wrapper">
                  <FaExclamationTriangle />
                </div>
                <h3 className="card-title">Important Warning</h3>
                <ul className="card-list warning-list">
                  <li>Consult a veterinarian.</li>
                  <li>Do not make treatment decisions from the image prediction alone.</li>
                </ul>
              </div>

              <div className="feature-card card-blue card-span-4">
                <div className="icon-wrapper">
                  <FaChartPie />
                </div>
                <h3 className="card-title">Class Probabilities</h3>
                <div className="prob-bars">
                  {Object.entries(result.probabilities).map(([className, prob]) => (
                    <div key={className} className="prob-bar-container">
                      <div className="prob-label">
                        <span>{className.replace('_', ' ')}</span>
                        <span>{prob}%</span>
                      </div>
                      <div className="prob-track">
                        <div
                          className="prob-fill"
                          style={{ width: `${prob}%`, backgroundColor: prob > 50 ? 'var(--danger)' : 'var(--primary)' }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseasePredictionPage;
