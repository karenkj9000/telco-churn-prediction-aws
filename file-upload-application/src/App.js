import React, { useState } from 'react';
import FileUpload from './FileUpload';
import PredictionsTab from './PredictionsTab';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <div className="app-container">
      {/* Centered Header Title */}
      <header className="app-header">
        <h1 className="header-content">Customer Churn Prediction</h1>
      </header>

      {/* Navigation Bar */}
      <div className="tab-bar">
        <button
          className={activeTab === "upload" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("upload")}
        >
          Upload CSV
        </button>
        <button
          className={activeTab === "predict" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("predict")}
        >
          View Predictions
        </button>
      </div>

      {/* Main Content */}
      <main className="app-main">
        {activeTab === "upload" ? <FileUpload /> : <PredictionsTab />}
      </main>

      <footer className="app-footer">
        <p>© 2025 MyCompany. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
