import React, { useState } from 'react';
import { FaSeedling, FaSyringe } from 'react-icons/fa';
import FeedPredictionPage from './FeedPredictionPage';
import MedicinePredictionPage from './MedicinePredictionPage';
import '../styles/ai-prediction-hub.css';

const tabs = [
  {
    id: 'feed',
    label: 'Feed Cost Prediction',
    icon: <FaSeedling />,
    color: '#10b981',
    activeGrad: 'linear-gradient(135deg, #10b981, #059669)',
    desc: 'Forecast next month feed expenditure',
  },
  {
    id: 'medicine',
    label: 'Medicine Cost Prediction',
    icon: <FaSyringe />,
    color: '#dc2626',
    activeGrad: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    desc: 'Forecast next month medicine expenditure',
  },
];

const AIPredictionHub = () => {
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <div className="ai-hub">
      {/* Internal Tab Navbar */}
      <div className="ai-hub-navbar">
        <div className="ai-hub-navbar-inner">
          <div className="ai-hub-title">
            <span className="ai-hub-title-icon">🤖</span>
            <div>
              <h2>AI Prediction Suite</h2>
              <p>Poultry Farm Intelligence — powered by XGBoost</p>
            </div>
          </div>

          <div className="ai-hub-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`ai-hub-tab ${activeTab === tab.id ? `active ${tab.id === 'medicine' ? 'medicine-active' : ''}` : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="ai-hub-tab-icon">{tab.icon}</span>
                <div className="ai-hub-tab-text">
                  <span className="ai-hub-tab-label">{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="ai-hub-content">
        {activeTab === 'feed' && (
          <div className="ai-hub-panel fade-in">
            <FeedPredictionPage onNavigateToMedicine={() => setActiveTab('medicine')} />
          </div>
        )}
        {activeTab === 'medicine' && (
          <div className="ai-hub-panel fade-in">
            <MedicinePredictionPage onNavigateBack={() => setActiveTab('feed')} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPredictionHub;
