import React, {useState} from "react";
import Dropzone from "react-dropzone-uploader";
import "react-dropzone-uploader/dist/styles.css";
import axios from "axios";

function FileUpload() {
  const API_ENDPOINT = "https://qayqhdo8t3.execute-api.eu-west-1.amazonaws.com/default/getSignedURLforFileUpload"; // Replace with your actual API endpoint

  const handleChangeStatus = ({ meta }, status) => {
    console.log(`File status changed: ${status}`, meta);
  };

  const handleSubmit = async (files, allFiles) => {
    const fileWrapper = files[0];
    const file = fileWrapper.file;

    console.log("Selected file:", file.name, file.type, file.size);

    try {
      const presignedURL = `${API_ENDPOINT}?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`;

      const response = await axios.get(presignedURL);
      console.log("Got signed URL:", response.data);

      const { uploadURL, filename } = response.data;

      const result = await fetch(uploadURL, {
        method: "PUT",
        headers: {
          "Content-Type": file.type, // must match Lambda's ContentType
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

  // const [file, setFile] = useState(null);

  // const handleFileChange = (event) => {
  //   const selectedFile = event.target.files[0];
  //   if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.type === 'application/vnd.ms-excel')) {
  //     setFile(selectedFile);  // Store the file
  //   } else {
  //     alert('Please upload a CSV file.');
  //   }
  // };

  // const handleFileSubmit = async () => {
  //   if (!file) {
  //     alert('Please select a CSV file first.');
  //     return;
  //   }

  //   console.log("Selected file:", file.name, file.type, file.size);

  //   try {
  //     const presignedURL = `${API_ENDPOINT}?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`;

  //     const response = await axios.get(presignedURL);
  //     console.log("Got signed URL:", response.data);

  //     const { uploadURL, filename } = response.data;

  //     const result = await fetch(uploadURL, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": file.type, // Must match Lambda's ContentType
  //       },
  //       body: file,
  //     });

  //     if (result.ok) {
  //       alert(`File "${filename}" uploaded successfully!`);
  //     } else {
  //       alert("Upload failed.");
  //     }
  //   } catch (error) {
  //     console.error("Upload error:", error);
  //     alert("An error occurred during upload.");
  //   }
  // };

  // return (
  //   <div style={{ padding: '20px' }}>
  //     <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Upload a CSV File</h2>
  //     <div style={{ textAlign: 'center' }}>
  //       {/* Simple file input for CSV files */}
  //       <input
  //         type="file"
  //         accept=".csv"
  //         onChange={handleFileChange}
  //         style={{
  //           padding: '10px',
  //           marginBottom: '20px',
  //           border: '1px solid #ccc',
  //           borderRadius: '4px',
  //         }}
  //       />
  //       <br />
  //       <button
  //         onClick={handleFileSubmit}
  //         style={{
  //           padding: '10px 20px',
  //           backgroundColor: '#4CAF50',
  //           color: 'white',
  //           border: 'none',
  //           borderRadius: '4px',
  //           cursor: 'pointer',
  //         }}
  //       >
  //         Upload File
  //       </button>
  //     </div>
  //   </div>
  // );
  

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
