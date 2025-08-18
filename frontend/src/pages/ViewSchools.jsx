import React, { useEffect, useState } from "react";
import { getSchools, getClasses, downloadExcel, downloadPhotos, getSchoolData, cropPhoto, deleteAllPhotos, deleteExcelData, deleteSchool } from "../services/adminService";
import Sidebar from "../components/Sidebar";
import { useNotification } from "../context/NotificationContext";


export default function ViewSchools() {
  const { showSuccess, showError, showWarning } = useNotification();
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schoolData, setSchoolData] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeletePhotosConfirmation, setShowDeletePhotosConfirmation] = useState(false);
  const [showDeleteExcelConfirmation, setShowDeleteExcelConfirmation] = useState(false);
  const [showDeleteSchoolConfirmation, setShowDeleteSchoolConfirmation] = useState(false);

  useEffect(() => {
    loadSchools();
  }, []);

  // Reset pagination when switching tabs
  useEffect(() => {
    setCurrentPage(1);
    setSelectedClass('all');
    setSearchTerm('');
  }, [activeTab]);

  const loadSchools = async () => {
    try {
      console.log("🔍 Attempting to load schools...");
      console.log("🔐 Current token:", localStorage.getItem('REACT_APP_JWT_STORAGE_KEY') ? "EXISTS" : "MISSING");
      console.log("🔐 Current role:", localStorage.getItem('role'));
      console.log("🔐 Token preview:", localStorage.getItem('REACT_APP_JWT_STORAGE_KEY')?.substring(0, 50) + "...");
      
      const res = await getSchools();
      console.log("🏫 Schools response:", res);
      console.log("🏫 Schools data:", res.data);
      
      // Handle different response structures
      let schoolsData = [];
      if (res.data && Array.isArray(res.data)) {
        schoolsData = res.data;
      } else if (res.data && res.data.schools && Array.isArray(res.data.schools)) {
        schoolsData = res.data.schools;
      } else if (res.data && res.data.success && Array.isArray(res.data.data)) {
        schoolsData = res.data.data;
      } else {
        console.warn("🏫 Unexpected schools response structure:", res.data);
        schoolsData = [];
      }
      
      console.log("🏫 Final schools data:", schoolsData);
      console.log("🏫 School IDs:", schoolsData.map(s => ({
        id: s.id || s._id || s.schoolId,
        name: s.name || s.schoolName || s.school_name
      })));
      setSchools(schoolsData);
    } catch (error) {
      console.error("❌ Error loading schools:", error);
      console.error("❌ Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      // Show more specific error message
      if (error.response?.status === 403) {
        alert("Access denied - check your admin permissions");
      } else if (error.response?.status === 404) {
        alert("Schools endpoint not found - backend may need configuration");
      } else {
        alert("Failed to load schools");
      }
    }
  };

  const handleSelectSchool = async (schoolId) => {
    setSelectedSchool(schoolId);
    setLoading(true);
    
    // Debug: Check authentication status
    const token = localStorage.getItem('REACT_APP_JWT_STORAGE_KEY');
    console.log("🔐 Authentication Debug:");
    console.log("Token exists:", !!token);
    console.log("Token length:", token ? token.length : 0);
    console.log("Token preview:", token ? token.substring(0, 50) + "..." : "No token");
    
    try {
      const res = await getClasses(schoolId);
      setClasses(res.data);
      
      // Load detailed school data
      await loadSchoolData(schoolId);
    } catch (error) {
      console.error("❌ Error loading school data:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error data:", error.response?.data);
              alert("Failed to load school data");
    } finally {
      setLoading(false);
    }
  };

  const loadSchoolData = async (schoolId) => {
    try {
      console.log("🔍 Attempting to load school data for schoolId:", schoolId);
      const response = await getSchoolData(schoolId);
      console.log("✅ School data response:", response.data);
      
      // Handle different response structures
      let schoolData = null;
      if (response.data && response.data.success && response.data.data) {
        schoolData = response.data.data;
      } else if (response.data && response.data.schoolInfo) {
        schoolData = response.data;
      } else {
        console.warn("🏫 Unexpected school data response structure:", response.data);
        schoolData = response.data;
      }
      
      console.log("🏫 Final school data:", schoolData);
      setSchoolData(schoolData);
    } catch (error) {
      console.error("❌ Error loading detailed school data:", error);
      console.error("❌ Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Fallback to mock data if API is not ready
      const mockData = {
        originalExcel: [
          { photoId: "ST001", fullName: "John Doe", className: "Class 10A", photoUploaded: false },
          { photoId: "ST002", fullName: "Jane Smith", className: "Class 10A", photoUploaded: true },
          { photoId: "ST003", fullName: "Mike Johnson", className: "Class 10B", photoUploaded: false },
        ],
        teacherUpdates: [
          { photoId: "ST001", fullName: "John Doe", className: "Class 10A", photoUploaded: true, updatedBy: "Teacher 1", updatedAt: "2024-01-15" },
          { photoId: "ST002", fullName: "Jane Smith", className: "Class 10A", photoUploaded: true, updatedBy: "Teacher 1", updatedAt: "2024-01-14" },
        ],
        schoolInfo: {
          id: schoolId,
          name: schools.find(s => (s.id || s._id || s.schoolId) === schoolId)?.name || "Unknown School",
          totalStudents: 3,
          photosUploaded: 2,
          pendingPhotos: 1,
          classes: ["Class 10A", "Class 10B"]
        }
      };
      setSchoolData(mockData);
              console.log("Using sample data - backend API not ready yet");
    }
  };

  const handleDownload = (fn, fileType = 'excel') => {
    try {
      const school = schools.find(s => (s.id || s._id || s.schoolId) === selectedSchool);
      if (!school) {
        alert("School not found");
        return;
      }
      
      // Get school name for download
      const schoolName = school.name || school.schoolName || school.school_name;
      console.log("🔍 Downloading for school:", { selectedSchool, schoolName, fileType });
      
      fn(schoolName).then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        
        // Set appropriate filename based on file type
        const filename = fileType === 'photos' 
          ? `${schoolName}_photos.zip` 
          : `${schoolName}_students.xlsx`;
        
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove(); // Clean up
      }).catch((error) => {
        console.error("Download error:", error);
        alert("Failed to download file");
      });
    } catch (error) {
      console.error("Download setup error:", error);
      alert("Failed to setup download");
    }
  };

    const handleDeleteAllPhotos = async () => {
    setShowDeletePhotosConfirmation(true);
  };

  const confirmDeleteAllPhotos = async () => {
    const schoolName = schools.find(s => (s.id || s._id || s.schoolId) === selectedSchool)?.name || selectedSchool;
    
    try {
      const response = await deleteAllPhotos(selectedSchool);
      
      if (response.data.success) {
        showSuccess("Success", "All photos deleted successfully");
        // Refresh the school data to show updated state
        if (selectedSchool) {
          loadSchoolData(selectedSchool);
        }
      } else {
        showError("Error", "Failed to delete photos");
      }
    } catch (error) {
      console.error("Error deleting photos:", error);
      showError("Error", "Failed to delete photos");
    } finally {
      setShowDeletePhotosConfirmation(false);
    }
  };

  const handleDeleteExcelData = async () => {
    setShowDeleteExcelConfirmation(true);
  };

  const confirmDeleteExcelData = async () => {
    const schoolName = schools.find(s => (s.id || s._id || s.schoolId) === selectedSchool)?.name || selectedSchool;
    
    try {
      const response = await deleteExcelData(selectedSchool);
      
      if (response.data.success) {
        showSuccess("Success", "Excel data deleted successfully");
        // Refresh the school data to show updated state
        if (selectedSchool) {
          loadSchoolData(selectedSchool);
        }
      } else {
        showError("Error", "Failed to delete Excel data");
      }
    } catch (error) {
      console.error("Error deleting Excel data:", error);
      showError("Error", "Failed to delete Excel data");
    } finally {
      setShowDeleteExcelConfirmation(false);
    }
  };

  const handleDeleteSchool = () => {
    setShowDeleteSchoolConfirmation(true);
  };

  const confirmDeleteSchool = async () => {
    const schoolName = schools.find(s => (s.id || s._id || s.schoolId) === selectedSchool)?.name || selectedSchool;
    
    try {
      const response = await deleteSchool(selectedSchool);
      
      if (response.data.success) {
        showSuccess("Success", `School "${schoolName}" deleted successfully`);
        // Refresh the schools list
        loadSchools();
        // Reset selection
        setSelectedSchool(null);
        setSchoolData({});
        setClasses([]);
      } else {
        showError("Error", "Failed to delete school");
      }
    } catch (error) {
      console.error("Error deleting school:", error);
      showError("Error", "Failed to delete school");
    } finally {
      setShowDeleteSchoolConfirmation(false);
    }
  };

  const getPhotoStatus = (student) => {
    return student.photoUploaded ? (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">✅ Uploaded</span>
    ) : (
      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">❌ Pending</span>
    );
  };

  // Pagination and filtering helpers
  const getFilteredData = (data) => {
    if (!data) return [];
    
    let filtered = data;
    
    // Filter by class
    if (selectedClass !== 'all') {
      filtered = filtered.filter(student => student.className === selectedClass);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.photoId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.className?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getPaginatedData = (data) => {
    const filtered = getFilteredData(data);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = (data) => {
    const filtered = getFilteredData(data);
    return Math.ceil(filtered.length / itemsPerPage);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleClassFilter = (className) => {
    setSelectedClass(className);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  const resetFilters = () => {
    setSelectedClass('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Photo editing functions
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [cropData, setCropData] = useState(null);

  const openPhotoEditor = (student) => {
    setSelectedPhoto(student);
    setCropData({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotation: 0
    });
  };

  const handleCropChange = (newCropData) => {
    setCropData(newCropData);
  };

  const saveCroppedPhoto = async () => {
    if (!selectedPhoto || !cropData) return;

    try {
      // Get the image element
      const imgElement = document.getElementById('cropImage');
      if (!imgElement) {
        alert("Image element not found");
        return;
      }

      // Create a canvas to crop the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Wait for image to load
      await new Promise((resolve) => {
        if (imgElement.complete) {
          resolve();
        } else {
          imgElement.onload = resolve;
        }
      });

      // Calculate crop dimensions in pixels
      const imgWidth = imgElement.naturalWidth;
      const imgHeight = imgElement.naturalHeight;
      
      const cropX = (cropData.x / 100) * imgWidth;
      const cropY = (cropData.y / 100) * imgHeight;
      const cropWidth = (cropData.width / 100) * imgWidth;
      const cropHeight = (cropData.height / 100) * imgHeight;

      // Set canvas size to crop dimensions
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      try {
        // Try to draw the cropped portion
        ctx.drawImage(
          imgElement,
          cropX, cropY, cropWidth, cropHeight,  // Source rectangle
          0, 0, cropWidth, cropHeight           // Destination rectangle
        );
      } catch (corsError) {
        console.warn("CORS error, trying base64 approach:", corsError);
        
        // Fallback: Convert image to base64 first
        const base64Image = await convertImageToBase64(selectedPhoto.photoUrl);
        const newImg = new Image();
        newImg.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          newImg.onload = resolve;
          newImg.onerror = reject;
          newImg.src = base64Image;
        });
        
        ctx.drawImage(
          newImg,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );
      }

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert("Failed to create cropped image");
          return;
        }

        // Create FormData with the cropped image
        const formData = new FormData();
        formData.append('photoId', selectedPhoto.photoId);
        formData.append('studentId', selectedPhoto._id || selectedPhoto.id);
        formData.append('file', blob, `${selectedPhoto.photoId}_cropped.jpg`);

        try {
          console.log("🎯 Uploading cropped photo:", {
            photoId: selectedPhoto.photoId,
            fileSize: blob.size,
            fileType: blob.type
          });

          const response = await cropPhoto(formData);
          console.log("✅ Crop response:", response);
          
          alert("Photo cropped and saved successfully!");
          setSelectedPhoto(null);
          setCropData(null);
          
          // Refresh the school data
          if (selectedSchool) {
            loadSchoolData(selectedSchool);
          }
        } catch (error) {
          console.error("Error uploading cropped photo:", error);
          alert("Failed to save cropped photo");
        }
      }, 'image/jpeg', 0.9);

    } catch (error) {
      console.error("Error cropping photo:", error);
              alert("Failed to crop photo");
    }
  };

  // Helper function to convert image to base64
  const convertImageToBase64 = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image to base64:", error);
      throw error;
    }
  };

  // Drag functionality for crop corners
  const handleCropDrag = (e, corner) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startCropData = { ...cropData };
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      // Convert pixel movement to percentage
      const imgElement = document.getElementById('cropImage');
      if (!imgElement) return;
      
      const rect = imgElement.getBoundingClientRect();
      const deltaXPercent = (deltaX / rect.width) * 100;
      const deltaYPercent = (deltaY / rect.height) * 100;
      
      let newCropData = { ...startCropData };
      
      switch (corner) {
        case 'topLeft':
          newCropData.x = Math.max(0, Math.min(startCropData.x + deltaXPercent, startCropData.x + startCropData.width - 10));
          newCropData.y = Math.max(0, Math.min(startCropData.y + deltaYPercent, startCropData.y + startCropData.height - 10));
          newCropData.width = startCropData.width - (newCropData.x - startCropData.x);
          newCropData.height = startCropData.height - (newCropData.y - startCropData.y);
          break;
        case 'topRight':
          newCropData.y = Math.max(0, Math.min(startCropData.y + deltaYPercent, startCropData.y + startCropData.height - 10));
          newCropData.width = Math.max(10, startCropData.width + deltaXPercent);
          newCropData.height = startCropData.height - (newCropData.y - startCropData.y);
          break;
        case 'bottomLeft':
          newCropData.x = Math.max(0, Math.min(startCropData.x + deltaXPercent, startCropData.x + startCropData.width - 10));
          newCropData.width = startCropData.width - (newCropData.x - startCropData.x);
          newCropData.height = Math.max(10, startCropData.height + deltaYPercent);
          break;
        case 'bottomRight':
          newCropData.width = Math.max(10, startCropData.width + deltaXPercent);
          newCropData.height = Math.max(10, startCropData.height + deltaYPercent);
          break;
      }
      
      setCropData(newCropData);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const downloadPhoto = async (student) => {
    if (!student.photoUrl) {
      alert("No photo available for download");
      return;
    }

    try {
      // Fetch the image as blob
      const response = await fetch(student.photoUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Create blob URL
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${student.photoId || student.fullName || 'student'}.jpg`;
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      window.URL.revokeObjectURL(blobUrl);
      
              alert("Photo download started!");
    } catch (error) {
      console.error("Download error:", error);
              alert("Failed to download photo. Please try right-clicking and 'Save image as'");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar role="ADMIN" />
      
      {/* Main Content Container - Fixed width and no extra spacing */}
      <div className="ml-0 md:ml-64 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Header Section - Compact and professional */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">View Schools</h1>
            <p className="text-sm text-gray-500">Manage and view school data</p>
          </div>
          
          {/* School Selection */}
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold mb-3">Select School</h2>
          <div className="max-w-md">
            <select
              value={selectedSchool}
              onChange={(e) => handleSelectSchool(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-base"
            >
              <option value="">Choose a school...</option>
              {Array.isArray(schools) && schools.map((s) => (
                <option key={s.id || s._id || s.schoolId} value={s.id || s._id || s.schoolId}>
                  {s.name || s.schoolName || s.school_name}
                </option>
              ))}
            </select>
          </div>
        </div>

          {selectedSchool && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* School Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                    {schools.find(s => (s.id || s._id || s.schoolId) === selectedSchool)?.name || selectedSchool}
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm">
                    {schoolData.schoolInfo?.classes?.length || classes.length} Classes • {schoolData.schoolInfo?.totalStudents || schoolData.originalExcel?.length || 0} Total Students
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleDownload(downloadExcel, 'excel')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    disabled={!selectedSchool}
                  >
                    📊 Download Excel
                  </button>
                  <button
                    onClick={() => handleDownload(downloadPhotos, 'photos')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                    disabled={!selectedSchool}
                  >
                    📦 Download Photos
                  </button>
                  <button
                    onClick={handleDeleteSchool}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                    disabled={!selectedSchool}
                  >
                    🏫 Delete School
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex flex-wrap gap-1 sm:gap-2 px-4 sm:px-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-3 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm ${
                    activeTab === 'overview'
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📋 Overview
                </button>
                <button
                  onClick={() => setActiveTab('original')}
                  className={`py-3 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm ${
                    activeTab === 'original'
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📄 Original Excel Data
                </button>
                <button
                  onClick={() => setActiveTab('updated')}
                  className={`py-3 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm ${
                    activeTab === 'updated'
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ✏️ Teacher Updates
                </button>
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'photos'
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📸 Photos
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6 ml-0 md:ml-64">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
                  <span className="ml-2 text-gray-600">Loading school data...</span>
                </div>
              ) : (
                <>
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-blue-800">Total Students</h3>
                          <p className="text-2xl font-bold text-blue-600">{schoolData.schoolInfo?.totalStudents || schoolData.originalExcel?.length || 0}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-green-800">Photos Uploaded</h3>
                          <p className="text-2xl font-bold text-green-600">
                            {schoolData.schoolInfo?.photosUploaded || schoolData.teacherUpdates?.length || 0}
                          </p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-yellow-800">Pending Photos</h3>
                          <p className="text-2xl font-bold text-yellow-600">
                            {schoolData.schoolInfo?.pendingPhotos || (schoolData.originalExcel?.length || 0) - (schoolData.teacherUpdates?.length || 0)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-3">Classes</h3>
                        <div className="flex gap-2 flex-wrap">
                          {Array.isArray(schoolData.schoolInfo?.classes || classes) && (schoolData.schoolInfo?.classes || classes).map((className, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white rounded-full text-sm border">
                              {className}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Original Excel Data Tab */}
                  {activeTab === 'original' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Original Excel Data</h3>
                        <div className="text-sm text-gray-600">
                          Total: {getFilteredData(schoolData.originalExcel).length} students
                        </div>
                      </div>

                      {/* Filters and Search */}
                      <div className="mb-4 flex flex-wrap gap-4 items-center">
                        {/* Class Filter */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700">Class:</label>
                          <select
                            value={selectedClass}
                            onChange={(e) => handleClassFilter(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                          >
                            <option value="all">All Classes</option>
                            {Array.isArray(schoolData.originalExcel) && Array.from(new Set(schoolData.originalExcel.map(s => s.className) || [])).map(className => (
                              <option key={className} value={className}>{className}</option>
                            ))}
                          </select>
                        </div>

                        {/* Search */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700">Search:</label>
                          <input
                            type="text"
                            placeholder="Search by name, ID, or class..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm w-64"
                          />
                        </div>

                        {/* Reset Filters */}
                        {(selectedClass !== 'all' || searchTerm) && (
                          <button
                            onClick={resetFilters}
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>

                      {/* Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-300">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border p-3 text-left">Photo ID</th>
                              <th className="border p-3 text-left">Full Name</th>
                              <th className="border p-3 text-left">Class</th>
                              <th className="border p-3 text-left">Status</th>
                              <th className="border p-3 text-left">Created At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.isArray(schoolData.originalExcel) && getPaginatedData(schoolData.originalExcel).map((student, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="border p-3 font-mono text-sm">{student.photoId}</td>
                                <td className="border p-3 font-medium">{student.fullName}</td>
                                <td className="border p-3">{student.className}</td>
                                <td className="border p-3">{getPhotoStatus(student)}</td>
                                <td className="border p-3 text-sm text-gray-600">
                                  {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {getTotalPages(schoolData.originalExcel) > 1 && (
                        <div className="mt-4 flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredData(schoolData.originalExcel).length)} of {getFilteredData(schoolData.originalExcel).length} students
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Previous
                            </button>
                            <span className="px-3 py-1 text-sm">
                              Page {currentPage} of {getTotalPages(schoolData.originalExcel)}
                            </span>
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === getTotalPages(schoolData.originalExcel)}
                              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Teacher Updates Tab */}
                  {activeTab === 'updated' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Teacher Updates</h3>
                        <div className="text-sm text-gray-600">
                          Total: {getFilteredData(schoolData.teacherUpdates).length} updates
                        </div>
                      </div>

                      {/* Filters and Search */}
                      <div className="mb-4 flex flex-wrap gap-4 items-center">
                        {/* Class Filter */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700">Class:</label>
                          <select
                            value={selectedClass}
                            onChange={(e) => handleClassFilter(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                          >
                            <option value="all">All Classes</option>
                            {Array.from(new Set(schoolData.teacherUpdates?.map(s => s.className) || [])).map(className => (
                              <option key={className} value={className}>{className}</option>
                            ))}
                          </select>
                        </div>

                        {/* Search */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700">Search:</label>
                          <input
                            type="text"
                            placeholder="Search by name, ID, or class..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm w-64"
                          />
                        </div>

                        {/* Reset Filters */}
                        {(selectedClass !== 'all' || searchTerm) && (
                          <button
                            onClick={resetFilters}
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>

                      {/* Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-300">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border p-3 text-left">Photo ID</th>
                              <th className="border p-3 text-left">Full Name</th>
                              <th className="border p-3 text-left">Class</th>
                              <th className="border p-3 text-left">Status</th>
                              <th className="border p-3 text-left">Updated By</th>
                              <th className="border p-3 text-left">Updated At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.isArray(schoolData.teacherUpdates) && getPaginatedData(schoolData.teacherUpdates).map((student, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="border p-3 font-mono text-sm">{student.photoId}</td>
                                <td className="border p-3 font-medium">{student.fullName}</td>
                                <td className="border p-3">{student.className}</td>
                                <td className="border p-3">{getPhotoStatus(student)}</td>
                                <td className="border p-3 text-sm">{student.updatedBy || 'N/A'}</td>
                                <td className="border p-3 text-sm text-gray-600">
                                  {student.updatedAt ? new Date(student.updatedAt).toLocaleDateString() : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {getTotalPages(schoolData.teacherUpdates) > 1 && (
                        <div className="mt-4 flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredData(schoolData.teacherUpdates).length)} of {getFilteredData(schoolData.teacherUpdates).length} updates
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Previous
                            </button>
                            <span className="px-3 py-1 text-sm">
                              Page {currentPage} of {getTotalPages(schoolData.teacherUpdates)}
                            </span>
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === getTotalPages(schoolData.teacherUpdates)}
                              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Photos Tab */}
                  {activeTab === 'photos' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Student Photos</h3>
                        <div className="text-sm text-gray-600">
                          Total: {getFilteredData(schoolData.teacherUpdates).length} photos uploaded
                        </div>
                      </div>

                      {/* Filters and Search */}
                      <div className="mb-4 flex flex-wrap gap-4 items-center">
                        {/* Class Filter */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700">Class:</label>
                          <select
                            value={selectedClass}
                            onChange={(e) => handleClassFilter(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                          >
                            <option value="all">All Classes</option>
                            {Array.from(new Set(schoolData.teacherUpdates?.map(s => s.className) || [])).map(className => (
                              <option key={className} value={className}>{className}</option>
                            ))}
                          </select>
                        </div>

                        {/* Search */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700">Search:</label>
                          <input
                            type="text"
                            placeholder="Search by name, ID, or class..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm w-64"
                          />
                        </div>

                        {/* Reset Filters */}
                        {(selectedClass !== 'all' || searchTerm) && (
                          <button
                            onClick={resetFilters}
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>

                      {/* Photos Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {getPaginatedData(schoolData.teacherUpdates).map((student, idx) => (
                          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                              {student.photoUrl ? (
                                <img
                                  src={student.photoUrl}
                                  alt={student.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-center text-gray-400">
                                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                                  <span className="text-sm">No Photo</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="text-center mb-3">
                              <p className="font-medium text-sm">{student.fullName}</p>
                              <p className="text-xs text-gray-500">{student.photoId}</p>
                              <p className="text-xs text-gray-500">{student.className}</p>
                            </div>
                            
                            <div className="flex space-x-2">
                              {student.photoUrl ? (
                                <>
                                  <button
                                    onClick={() => openPhotoEditor(student)}
                                    className="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                  >
                                    ✂️ Crop
                                  </button>
                                  <button
                                    onClick={() => downloadPhoto(student)}
                                    className="flex-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                  >
                                    📥 Download
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs text-gray-500 text-center w-full">No photo available</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {getTotalPages(schoolData.teacherUpdates) > 1 && (
                        <div className="mt-4 flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredData(schoolData.teacherUpdates).length)} of {getFilteredData(schoolData.teacherUpdates).length} photos
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Previous
                            </button>
                            <span className="px-3 py-1 text-sm">
                              Page {currentPage} of {getTotalPages(schoolData.teacherUpdates)}
                            </span>
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === getTotalPages(schoolData.teacherUpdates)}
                              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Photo Editor Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit Photo - {selectedPhoto.fullName}</h3>
                <button
                  onClick={() => {
                    setSelectedPhoto(null);
                    setCropData(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ❌ Cancel
                </button>
              </div>
              
              <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden mb-4">
                <img
                  src={selectedPhoto.photoUrl}
                  alt={selectedPhoto.fullName}
                  className="w-full h-auto"
                  id="cropImage"
                  crossOrigin="anonymous"
                />
                
                {/* Crop Overlay - Lines on All Sides */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    left: `${cropData?.x || 25}%`,
                    top: `${cropData?.y || 25}%`,
                    width: `${cropData?.width || 50}%`,
                    height: `${cropData?.height || 50}%`,
                    border: '2px solid #ffd700',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Vertical lines */}
                  <div className="absolute top-0 left-1/3 w-px h-full bg-yellow-400"></div>
                  <div className="absolute top-0 left-2/3 w-px h-full bg-yellow-400"></div>
                  
                  {/* Horizontal lines */}
                  <div className="absolute left-0 top-1/3 w-full h-px bg-yellow-400"></div>
                  <div className="absolute left-0 top-2/3 w-full h-px bg-yellow-400"></div>
                </div>
                
                {/* Draggable Corner Handles */}
                <div
                  className="absolute w-4 h-4 bg-yellow-500 border-2 border-white rounded-full cursor-nw-resize"
                  style={{
                    left: `${cropData?.x || 25}%`,
                    top: `${cropData?.y || 25}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onMouseDown={(e) => handleCropDrag(e, 'topLeft')}
                />
                <div
                  className="absolute w-4 h-4 bg-yellow-500 border-2 border-white rounded-full cursor-ne-resize"
                  style={{
                    left: `${cropData?.x + cropData?.width || 75}%`,
                    top: `${cropData?.y || 25}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onMouseDown={(e) => handleCropDrag(e, 'topRight')}
                />
                <div
                  className="absolute w-4 h-4 bg-yellow-500 border-2 border-white rounded-full cursor-sw-resize"
                  style={{
                    left: `${cropData?.x || 25}%`,
                    top: `${cropData?.y + cropData?.height || 75}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onMouseDown={(e) => handleCropDrag(e, 'bottomLeft')}
                />
                <div
                  className="absolute w-4 h-4 bg-yellow-500 border-2 border-white rounded-full cursor-se-resize"
                  style={{
                    left: `${cropData?.x + cropData?.width || 75}%`,
                    top: `${cropData?.y + cropData?.height || 75}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onMouseDown={(e) => handleCropDrag(e, 'bottomRight')}
                />
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setCropData({ x: 25, y: 25, width: 50, height: 50 })}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Reset
                </button>
                <button
                  onClick={saveCroppedPhoto}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Photos Confirmation Modal */}
        {showDeletePhotosConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete All Photos</h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete ALL photos for{" "}
                <strong>{schools.find(s => (s.id || s._id || s.schoolId) === selectedSchool)?.name || selectedSchool}</strong>.
                <br /><br />
                • All student photos will be deleted from Cloudinary<br />
                • All photo URLs will be removed from database<br />
                • This action cannot be undone!
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeletePhotosConfirmation(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAllPhotos}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete All Photos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Excel Confirmation Modal */}
        {showDeleteExcelConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Excel Data</h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete ALL Excel data for{" "}
                <strong>{schools.find(s => (s.id || s._id || s.schoolId) === selectedSchool)?.name || selectedSchool}</strong>.
                <br /><br />
                • All student records will be deleted from database<br />
                • All Excel data will be removed<br />
                • This action cannot be undone!
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteExcelConfirmation(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteExcelData}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete Excel Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete School Confirmation Modal */}
        {showDeleteSchoolConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
              <div className="text-red-500 text-6xl mb-4">🏫</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Entire School</h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete the entire school{" "}
                <strong>{schools.find(s => (s.id || s._id || s.schoolId) === selectedSchool)?.name || selectedSchool}</strong>.
                <br /><br />
                • All student records will be deleted<br />
                • All photos will be deleted from Cloudinary<br />
                • All teachers will be deleted<br />
                • The school itself will be deleted<br />
                • This action cannot be undone!
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteSchoolConfirmation(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteSchool}
                  className="px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                >
                  Delete Entire School
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}