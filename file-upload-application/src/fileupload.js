// fileupload.js
import React from "react";
import Dropzone from "react-dropzone-uploader";
import "react-dropzone-uploader/dist/styles.css";
import axios from "axios";

function FileUpload() {
  const API_ENDPOINT = "https://your-api-id.execute-api.region.amazonaws.com/dev/upload"; // Replace with your actual API endpoint

  const handleChangeStatus = ({ meta }, status) => {
    console.log(`File status changed: ${status}`, meta);
  };

  const handleSubmit = async (files, allFiles) => {
    const fileWrapper = files[0];
    const file = fileWrapper.file;

    try {
      // Step 1: Get pre-signed URL
      const response = await axios.post(API_ENDPOINT, {
        filename: file.name,
        contentType: file.type,
      });

      // Step 2: Upload to S3 using the URL
      const result = await fetch(response.data.uploadURL, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (result.ok) {
        alert(`File "${file.name}" uploaded successfully!`);
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
      <h2>Upload a CSV File</h2>
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
