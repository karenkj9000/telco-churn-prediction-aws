import React, { useEffect, useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import "./PredictionsTab.css";

const LIST_API = `${process.env.REACT_APP_BASE_URL}/listPredictionFiles`;
const SIGNED_URL_API = `${process.env.REACT_APP_BASE_URL}/getSignedDownloadURLPredFile`;

function PredictionsTab() {
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState("");
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get(LIST_API);
        setFiles(res.data.files || []);
      } catch (err) {
        console.error("Error listing files:", err);
      }
    };

    fetchFiles();
  }, []);

  const handleFetchPrediction = async () => {
    if (!selected) return;

    const predictionFile = `inferences${selected}`;
    try {
      const res = await axios.get(`${SIGNED_URL_API}?filename=${encodeURIComponent(predictionFile)}`);
      const downloadURL = res.data.downloadURL;

      const csvRes = await fetch(downloadURL);
      const csvText = await csvRes.text();
      const parsed = Papa.parse(csvText, { header: true });
      setPredictions(parsed.data);
      console.log(parsed.data)
    } catch (err) {
      console.error("Error fetching predictions:", err);
    }
  };

  const getChurnColor = (churnValue) => {
    return churnValue === "1" 
      ? "#ffcccc"  // Lighter red
      : churnValue === "0" 
      ? "#ccffcc"  // Lighter green
      : "transparent";
  };

  const getChurnText = (churnValue) => {
    return churnValue === "1" ? "Yes" : churnValue === "0" ? "No" : churnValue;
  };

  return (
    <div className="predictions-container">
      <h2 className="centered">Select Uploaded File</h2>
      <div className="file-select-container">
        <select
          className="file-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">-- Select a file --</option>
          {files.map((f, idx) => (
            <option key={idx} value={f}>{f}</option>
          ))}
        </select>
        <button 
          className="fetch-btn" 
          onClick={handleFetchPrediction} 
          disabled={!selected}
        >
          Fetch Predictions
        </button>
      </div>

      {predictions.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Predictions</h3>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                {Object.keys(predictions[0]).map((col, idx) => (
                  <th key={idx}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {predictions.map((row, idx) => (
                <tr key={idx}>
                  {Object.keys(row).map((col, i) => (
                    <td
                      key={i}
                      style={col === "prediction" ? { backgroundColor: getChurnColor(row[col]) } : {}}
                    >
                      {col === "prediction" ? getChurnText(row[col]) : row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


export default PredictionsTab;
