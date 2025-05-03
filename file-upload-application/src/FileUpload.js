import React from "react";
import Dropzone from "react-dropzone-uploader";
import "react-dropzone-uploader/dist/styles.css";
import axios from "axios";

const API_ENDPOINT = `${process.env.REACT_APP_BASE_URL}/getSignedURLforFileUpload`;

function FileUpload() {
  const handleChangeStatus = ({ meta }, status) => {
    console.log(`File status changed: ${status}`, meta);
  };

  const handleSubmit = async (files, allFiles) => {
    const fileWrapper = files[0];
    const file = fileWrapper.file;

    try {
      const presignedURL = `${API_ENDPOINT}?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`;

      const response = await axios.get(presignedURL);

      const { uploadURL, filename } = response.data;

      const result = await fetch(uploadURL, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (result.ok) {
        alert(`File "${filename}" uploaded successfully!`);
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during upload.");
    }

    allFiles.forEach(f => f.remove());
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Upload a CSV File</h2>
      <Dropzone
        onChangeStatus={handleChangeStatus}
        onSubmit={handleSubmit}
        maxFiles={1}
        multiple={false}
        canCancel={true}
        inputContent="Drop a CSV File or Click to Browse"
        accept=".csv"
        styles={{
          dropzone: { width: 500, height: 200, border: '2px dashed #666' },
          dropzoneActive: { borderColor: 'green' },
        }}
      />
    </div>
  );
}

export default FileUpload;
