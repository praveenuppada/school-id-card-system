import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { uploadExcel, getSchools, checkBackendEndpoints } from "../services/adminService";
import * as XLSX from "xlsx";
import SuccessModal from "../components/SuccessModal";
import ErrorModal from "../components/ErrorModal";
import { clearUploadData } from "../utils/storage";
import Sidebar from "../components/Sidebar";

export default function UploadExcel() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState({});
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [currentPage, setCurrentPage] = useState({});
  const [itemsPerPage] = useState(10);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successData, setSuccessData] = useState({});
  const [errorData, setErrorData] = useState({});

  useEffect(() => {
    loadSchools();
    // Check backend endpoints on component mount
    checkBackendEndpoints();
  }, []);

  const loadSchools = async () => {
    try {
      const response = await getSchools();
      console.log("🏫 Schools response:", response);
      console.log("🏫 Schools data:", response.data);
      
      // Handle different response structures
      let schoolsData = [];
      if (response.data && Array.isArray(response.data)) {
        schoolsData = response.data;
      } else if (response.data && response.data.schools && Array.isArray(response.data.schools)) {
        schoolsData = response.data.schools;
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        schoolsData = response.data.data;
      } else {
        console.warn("🏫 Unexpected schools response structure:", response.data);
        schoolsData = [];
      }
      
      console.log("🏫 Final schools data:", schoolsData);
      setSchools(schoolsData);
    } catch (error) {
      console.error("Error loading schools:", error);
      setSchools([]); // Ensure schools is always an array
      setErrorData({
        title: "Failed to Load Schools",
        message: "Unable to load the list of schools. Please check your connection and try again."
      });
      setShowErrorModal(true);
    }
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    validateAndPreview(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndPreview(droppedFile);
  };

  const validateAndPreview = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".xlsx")) {
      alert("Only .xlsx files are allowed");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("File size must be under 5MB");
      return;
    }

    setFile(selectedFile);

    // Parse Excel
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetsPreview = {};
      const initialPages = {};
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        sheetsPreview[sheetName] = jsonData; // All data, not just first 5
        initialPages[sheetName] = 1; // Start at page 1 for each sheet
      });

      setPreviewData(sheetsPreview);
      setCurrentPage(initialPages);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an Excel file first");
      return;
    }

    if (!selectedSchool) {
      alert("Please select a school first");
      return;
    }

    setLoading(true);

    try {
      console.log("Uploading file:", file.name);
      console.log("School ID:", selectedSchool);
      
      const response = await uploadExcel(file, selectedSchool);
      console.log("Upload response:", response);
      
      // Show success modal
      const schoolName = schools.find(s => (s.id || s._id || s.schoolId) === selectedSchool)?.name || selectedSchool;
      setSuccessData({
        title: "Excel Uploaded Successfully! 📊",
        message: `File "${file.name}" has been uploaded for school "${schoolName}". ${response.data?.totalStudents || 'Students'} have been processed and the data has been sent to teachers for photo upload.`
      });
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Upload error:", err);
      console.error("Error response:", err.response);
      
      let errorMessage = "Failed to upload Excel file.";
      if (err.response?.status === 403) {
        errorMessage = "Access denied (403). This could be due to:\n\n" +
          "• Missing or invalid authentication token\n" +
          "• Insufficient admin permissions\n" +
          "• Backend endpoint not implemented\n" +
          "• CORS configuration issues\n\n" +
          "Please check your login status and try again.";
      } else if (err.response?.status === 400) {
        errorMessage = "Invalid file format or data. Please check your Excel file.";
      } else if (err.response?.status === 404) {
        errorMessage = "Upload endpoint not found. The backend may not be running or the endpoint is not implemented.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setErrorData({
        title: "Upload Failed",
        message: errorMessage
      });
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const getPageData = (sheetName) => {
    const data = previewData[sheetName] || [];
    const page = currentPage[sheetName] || 1;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (sheetName) => {
    const data = previewData[sheetName] || [];
    return Math.ceil(data.length / itemsPerPage);
  };

  const handlePageChange = (sheetName, newPage) => {
    setCurrentPage(prev => ({
      ...prev,
      [sheetName]: newPage
    }));
  };

  const getColumnHeaders = (data) => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar role="ADMIN" />
      
      {/* Main Content Container - Fixed width and no extra spacing */}
      <div className="ml-0 md:ml-64 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Header Section - Compact and professional */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">Upload Excel</h1>
            <p className="text-sm text-gray-500">Upload student data from Excel files</p>
          </div>

          {/* School Selection */}
          <div className="bg-white shadow-sm rounded-lg p-4 mb-4 border border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Select School</h2>
          <select
            value={selectedSchool}
            onChange={(e) => {
              console.log("School selected:", e.target.value);
              setSelectedSchool(e.target.value);
            }}
            className="w-full border border-yellow-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-base"
          >
            <option value="">Select a school</option>
            {Array.isArray(schools) && schools.map((school) => (
              <option key={school.id || school._id || school.schoolId} value={school.id || school._id || school.schoolId}>
                {school.name || school.schoolName || school.school_name}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-2">
            Selected School: {selectedSchool || "None"}
          </p>
        </div>

          {/* Drag and Drop */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white shadow-sm mb-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => document.getElementById("excelInput").click()}
          >
          <p className="text-base sm:text-lg text-gray-600">Drag & Drop your Excel file here</p>
          <p className="text-sm text-gray-500 mt-2">or click to select file</p>
          <input
            id="excelInput"
            type="file"
            className="hidden"
            accept=".xlsx"
            onChange={handleFileSelect}
          />
        </div>

          {/* Preview with Pagination */}
          {Object.keys(previewData).length > 0 && (
            <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
            {Object.keys(previewData).map((sheetName) => {
              const pageData = getPageData(sheetName);
              const totalPages = getTotalPages(sheetName);
              const currentPageNum = currentPage[sheetName] || 1;
              const headers = getColumnHeaders(previewData[sheetName]);
              const totalRows = previewData[sheetName].length;

              return (
                <div key={sheetName} className="mb-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-yellow-600 mb-2 sm:mb-0">
                      Sheet: {sheetName}
                    </h2>
                    <span className="text-sm text-gray-500">
                      Total Rows: {totalRows}
                    </span>
                  </div>
                  
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <table className="w-full border border-gray-200 text-left">
                      <thead>
                        <tr className="bg-gray-50">
                          {headers.map((header) => (
                            <th key={header} className="border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pageData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            {headers.map((header) => (
                              <td key={header} className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                                {row[header] || ""}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden">
                    {pageData.map((row, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 mb-3 bg-gray-50">
                        {headers.map((header) => (
                          <div key={header} className="mb-2">
                            <span className="font-semibold text-sm text-gray-700">{header}:</span>
                            <span className="ml-2 text-sm text-gray-600">{row[header] || ""}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-600">
                        Page {currentPageNum} of {totalPages} 
                        (Showing {((currentPageNum - 1) * itemsPerPage) + 1} to {Math.min(currentPageNum * itemsPerPage, totalRows)} of {totalRows} rows)
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePageChange(sheetName, currentPageNum - 1)}
                          disabled={currentPageNum === 1}
                          className={`px-3 py-1 rounded ${
                            currentPageNum === 1
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-yellow-500 text-white hover:bg-yellow-600"
                          }`}
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => handlePageChange(sheetName, currentPageNum + 1)}
                          disabled={currentPageNum === totalPages}
                          className={`px-3 py-1 rounded ${
                            currentPageNum === totalPages
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-yellow-500 text-white hover:bg-yellow-600"
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Upload Summary */}
        {file && selectedSchool && !loading && (
          <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              📋 Upload Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-green-700">
                  <strong>File:</strong> {file.name}
                </p>
                <p className="text-sm text-green-700">
                  <strong>School:</strong> {schools.find(s => (s.id || s._id || s.schoolId) === selectedSchool)?.name || selectedSchool}
                </p>
                <p className="text-sm text-green-700">
                  <strong>Total Sheets:</strong> {Object.keys(previewData).length}
                </p>
                <p className="text-sm text-green-700">
                  <strong>Total Students:</strong> {Object.values(previewData).reduce((total, sheet) => total + sheet.length, 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium mb-2">
                  After upload, the system will:
                </p>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✅ Process all student data</li>
                  <li>📧 Send data to teachers</li>
                  <li>📱 Teachers can upload photos</li>
                  <li>📊 Generate ID cards</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Upload and Clear Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleUpload}
            disabled={loading || !file || !selectedSchool}
            className={`px-6 py-3 rounded-lg text-white font-semibold ${
              loading || !file || !selectedSchool
                ? "bg-yellow-300 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600"
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading to Server...
              </div>
            ) : (
              "Upload Excel"
            )}
          </button>
          

        </div>
          
          {loading && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-blue-700 font-medium">
                  Processing upload... This may take a few moments.
                </span>
              </div>
              <p className="text-sm text-blue-600 mt-2">
                📤 Uploading file to server... 📊 Processing student data... 📧 Notifying teachers...
              </p>
            </div>
          )}
        
        {/* Debug Info */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
          <p>Debug Info:</p>
          <p>File selected: {file ? file.name : "None"}</p>
          <p>School selected: {selectedSchool || "None"}</p>
          <p>Loading: {loading ? "Yes" : "No"}</p>
          <p>Button disabled: {loading || !file || !selectedSchool ? "Yes" : "No"}</p>
        </div>
      </div>
    </div>
      
    {/* Success Modal */}
    <SuccessModal
      isOpen={showSuccessModal}
      onClose={() => setShowSuccessModal(false)}
      title={successData.title}
      message={successData.message}
      onConfirm={() => {
        setShowSuccessModal(false);
        navigate("/admin");
      }}
    />
    
    {/* Error Modal */}
    <ErrorModal
      isOpen={showErrorModal}
      onClose={() => setShowErrorModal(false)}
      title={errorData.title}
      message={errorData.message}
      onRetry={() => {
        setShowErrorModal(false);
        loadSchools();
      }}
    />
  </div>
);
