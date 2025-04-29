import React from 'react';
import FileUpload from './fileupload';
import './App.css';

function App() {
  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>Customer Churn Prediction</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <FileUpload />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2025 MyCompany. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;