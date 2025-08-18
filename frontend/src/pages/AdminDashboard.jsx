import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import NotificationBell from "../components/NotificationBell";
import { useNotification } from "../context/NotificationContext";
import Sidebar from "../components/Sidebar";
import { 
  getSchools, 
  getClasses, 
  getStudentsByClass, 
  cropPhoto, 
  getStats,
  deleteExcelData,
  deleteAllPhotos,
  deleteSchool
} from "../services/adminService";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { showSuccess, showError, showWarning } = useNotification();
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [cropData, setCropData] = useState(null);
  const [stats, setStats] = useState({ totalSchools: 0, totalStudents: 0, totalClasses: 0 });

  const canvasRef = useRef(null);

  useEffect(() => {
    loadSchools();
    loadStats();
  }, []);

  const loadSchools = async () => {
    try {
      const res = await getSchools();
      setSchools(res.data);
    } catch (error) {
      console.error("Error loading schools:", error);
      showError("Error", "Failed to load schools");
    }
  };

  const loadStats = async () => {
    try {
      const res = await getStats();
      setStats(res.data.stats);
    } catch (error) {
      console.error("Error loading stats:", error);
      showError("Error", "Failed to load dashboard stats");
    }
  };

  const handleSchoolChange = async (schoolId) => {
    setSelectedSchool(schoolId);
    setSelectedClass("");
    setStudents([]);
    setCurrentPage(1);
    try {
      const res = await getClasses(schoolId);
      setClasses(res.data);
    } catch (error) {
      console.error("Error loading classes:", error);
    }
  };

  const handleClassChange = async (className) => {
    setSelectedClass(className);
    setCurrentPage(1);
    try {
      const res = await getStudentsByClass(className);
      setStudents(res.data);
    } catch (error) {
      console.error("Error loading students:", error);
      showError("Error", "Failed to load students");
    }
  };

  // Pagination helpers
  const getPaginatedStudents = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return students.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(students.length / itemsPerPage);
  };

  // Download functions
  const handleDownloadAllPhotos = async () => {
    try {
      showSuccess("Success", "Downloading all photos...");
      // Add your download logic here
      console.log("Downloading all photos");
    } catch (error) {
      console.error("Error downloading photos:", error);
      showError("Error", "Failed to download photos");
    }
  };

  const handleDownloadExcel = async () => {
    try {
      showSuccess("Success", "Downloading Excel file...");
      // Add your download logic here
      console.log("Downloading Excel file");
    } catch (error) {
      console.error("Error downloading Excel:", error);
      showError("Error", "Failed to download Excel file");
    }
  };

  // Photo cropping functions
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
        showError("Error", "Image element not found");
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
          showError("Error", "Failed to create cropped image");
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
          
          showSuccess("Success", "Photo cropped and saved successfully!");
          setSelectedPhoto(null);
          setCropData(null);
          // Refresh the students list
          if (selectedClass) {
            handleClassChange(selectedClass);
          }
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          showError("Error", "Failed to upload cropped photo");
        }
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error("Crop error:", error);
      showError("Error", "Failed to crop photo");
    }
  };

  // Delete functions
  const handleDeleteExcel = async (schoolId) => {
    if (!window.confirm("Are you sure you want to delete all Excel data for this school? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteExcelData(schoolId);
      showSuccess("Success", "Excel data deleted successfully");
      loadStats(); // Refresh stats
    } catch (error) {
      console.error("Delete Excel error:", error);
      showError("Error", "Failed to delete Excel data");
    }
  };

  const handleDeletePhotos = async (schoolId) => {
    if (!window.confirm("Are you sure you want to delete all photos for this school? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteAllPhotos(schoolId);
      showSuccess("Success", "Photos deleted successfully");
      loadStats(); // Refresh stats
    } catch (error) {
      console.error("Delete photos error:", error);
      showError("Error", "Failed to delete photos");
    }
  };

  const handleDeleteSchool = async (schoolId) => {
    if (!window.confirm("Are you sure you want to delete this entire school? This will delete the school, all students, all photos, and all teachers. This action cannot be undone.")) {
      return;
    }

    try {
      await deleteSchool(schoolId);
      showSuccess("Success", "School deleted successfully");
      loadSchools(); // Refresh schools list
      loadStats(); // Refresh stats
    } catch (error) {
      console.error("Delete school error:", error);
      showError("Error", "Failed to delete school");
    }
  };

  const handleCropDrag = (e, corner) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startCropData = { ...cropData };
    const startX = e.clientX;
    const startY = e.clientY;
    
    const handleMouseMove = (e) => {
      e.preventDefault();
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // Get the image container
      const imageContainer = document.querySelector('.crop-container');
      if (!imageContainer) return;
      
      const containerRect = imageContainer.getBoundingClientRect();
      const deltaXPercent = (deltaX / containerRect.width) * 100;
      const deltaYPercent = (deltaY / containerRect.height) * 100;
      
      let newCropData = { ...startCropData };
      
      switch (corner) {
        case 'move':
          // Move the entire crop area
          newCropData.x = Math.max(0, Math.min(100 - newCropData.width, startCropData.x + deltaXPercent));
          newCropData.y = Math.max(0, Math.min(100 - newCropData.height, startCropData.y + deltaYPercent));
          break;
        case 'topLeft':
          newCropData.x = Math.max(0, Math.min(startCropData.x + startCropData.width - 10, startCropData.x + deltaXPercent));
          newCropData.y = Math.max(0, Math.min(startCropData.y + startCropData.height - 10, startCropData.y + deltaYPercent));
          newCropData.width = startCropData.width - (newCropData.x - startCropData.x);
          newCropData.height = startCropData.height - (newCropData.y - startCropData.y);
          break;
        case 'topRight':
          newCropData.y = Math.max(0, Math.min(startCropData.y + startCropData.height - 10, startCropData.y + deltaYPercent));
          newCropData.width = Math.max(10, startCropData.width + deltaXPercent);
          newCropData.height = startCropData.height - (newCropData.y - startCropData.y);
          break;
        case 'bottomLeft':
          newCropData.x = Math.max(0, Math.min(startCropData.x + startCropData.width - 10, startCropData.x + deltaXPercent));
          newCropData.width = startCropData.width - (newCropData.x - startCropData.x);
          newCropData.height = Math.max(10, startCropData.height + deltaYPercent);
          break;
        case 'bottomRight':
          newCropData.width = Math.max(10, startCropData.width + deltaXPercent);
          newCropData.height = Math.max(10, startCropData.height + deltaYPercent);
          break;
        case 'top':
          newCropData.y = Math.max(0, Math.min(startCropData.y + startCropData.height - 10, startCropData.y + deltaYPercent));
          newCropData.height = startCropData.height - (newCropData.y - startCropData.y);
          break;
        case 'bottom':
          newCropData.height = Math.max(10, startCropData.height + deltaYPercent);
          break;
        case 'left':
          newCropData.x = Math.max(0, Math.min(startCropData.x + startCropData.width - 10, startCropData.x + deltaXPercent));
          newCropData.width = startCropData.width - (newCropData.x - startCropData.x);
          break;
        case 'right':
          newCropData.width = Math.max(10, startCropData.width + deltaXPercent);
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
      showError("Error", "No photo available for download");
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
      
      showSuccess("Success", "Photo download started!");
    } catch (error) {
      console.error("Download error:", error);
      showError("Error", "Failed to download photo. Please try right-clicking and 'Save image as'");
    }
  };

  const replacePhoto = (student) => {
    // This would open a file picker and upload new photo
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Handle photo replacement
        showSuccess("Success", "Photo replaced successfully!");
      }
    };
    input.click();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { label: "Register School", path: "/admin/register-school" },
    { label: "Upload Excel", path: "/admin/upload-excel" },
    { label: "View Schools", path: "/admin/view-schools" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      <Sidebar role="ADMIN" />
      
      {/* Main Content Container - Proper layout */}
      <div className="flex-1 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 md:pt-6 pt-16 overflow-x-hidden" style={{ overflowX: 'hidden' }}>
          
          {/* Header Section - Compact and professional */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-3 sm:mb-0">
                <h1 className="text-xl font-bold text-gray-900">HARSHA ID SOLUTIONS</h1>
                <p className="text-sm text-gray-500">A Complete ID World</p>
              </div>
              
              {/* Action Buttons - Compact spacing */}
              <div className="flex flex-col sm:flex-row gap-2">
                {/* No action buttons needed - all functions available in sidebar */}
              </div>
            </div>
          </div>

          {/* Quick Stats - Compact spacing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                      <dd className="text-lg font-medium text-gray-900">{students.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Photos Uploaded</dt>
                      <dd className="text-lg font-medium text-gray-900">{students.filter(s => s.photoUploaded).length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Photos</dt>
                      <dd className="text-lg font-medium text-gray-900">{students.filter(s => !s.photoUploaded).length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Students Content - Like Amazon's product listings */}
          {Array.isArray(students) && students.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              
              {/* Desktop Table - Like Amazon's product tables */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo ID</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getPaginatedStudents().map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {student.photoId}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {student.fullName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {student.className}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {student.photoUploaded ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✅ Uploaded
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              ❌ Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openPhotoEditor(student)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              ✂️ Crop
                            </button>
                            {student.photoUrl && (
                              <button
                                onClick={() => downloadPhoto(student)}
                                className="text-green-600 hover:text-green-900 font-medium"
                              >
                                📥 Download
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards - Like Amazon's mobile product cards */}
              <div className="md:hidden">
                {getPaginatedStudents().map((student) => (
                  <div key={student.id} className="border-b border-gray-200 p-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{student.fullName}</h3>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">📋 ID: {student.photoId}</p>
                          <p className="text-sm text-gray-600">🏫 Class: {student.className}</p>
                        </div>
                      </div>
                      <div className="ml-4">
                        {student.photoUploaded ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✅ Uploaded
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ❌ Pending
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openPhotoEditor(student)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 font-medium transition-colors"
                      >
                        ✂️ Crop Photo
                      </button>
                      {student.photoUrl && (
                        <button
                          onClick={() => downloadPhoto(student)}
                          className="px-4 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 font-medium transition-colors"
                        >
                          📥 Download
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination - Like Amazon's pagination */}
              {getTotalPages() > 1 && (
                <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))}
                      disabled={currentPage === getTotalPages()}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === getTotalPages()
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, students.length)}
                        </span>{' '}
                        of <span className="font-medium">{students.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                            currentPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          Previous
                        </button>
                        {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))}
                          disabled={currentPage === getTotalPages()}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                            currentPage === getTotalPages()
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State - Like Amazon's empty states */}
          {Array.isArray(students) && students.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">No students have been registered yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Photo Editor Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Crop Photo - {selectedPhoto.fullName}</h3>
                <button
                  onClick={closePhotoEditor}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Drag the corners to crop the photo. Click and drag the center to move the crop area.</p>
                <div className="text-xs text-gray-500">
                  Crop: {Math.round(cropData?.x || 25)}x{Math.round(cropData?.y || 25)} - {Math.round(cropData?.width || 50)}x{Math.round(cropData?.height || 50)}
                </div>
              </div>

              <div className="relative crop-container mb-6">
                <img
                  src={selectedPhoto.photoUrl}
                  alt="Student photo"
                  className="max-w-full h-auto"
                  style={{ maxHeight: '400px' }}
                  id="cropImage"
                  crossOrigin="anonymous"
                />
                <div
                  className="absolute border-2 border-yellow-400 cursor-move"
                  style={{
                    left: `${cropData?.x || 25}%`,
                    top: `${cropData?.y || 25}%`,
                    width: `${cropData?.width || 50}%`,
                    height: `${cropData?.height || 50}%`,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                  }}
                  onMouseDown={handleCropDrag}
                >
                  <div className="absolute -top-3 -left-3 w-6 h-6 bg-yellow-400 rounded-full cursor-nw-resize shadow-lg hover:bg-yellow-300 transition-colors" data-handle="top-left"></div>
                  <div className="absolute -top-3 -right-3 w-6 h-6 bg-yellow-400 rounded-full cursor-ne-resize shadow-lg hover:bg-yellow-300 transition-colors" data-handle="top-right"></div>
                  <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-yellow-400 rounded-full cursor-sw-resize shadow-lg hover:bg-yellow-300 transition-colors" data-handle="bottom-left"></div>
                  <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-yellow-400 rounded-full cursor-se-resize shadow-lg hover:bg-yellow-300 transition-colors" data-handle="bottom-right"></div>
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-yellow-400 rounded-full cursor-n-resize shadow-lg hover:bg-yellow-300 transition-colors" data-handle="top"></div>
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-yellow-400 rounded-full cursor-s-resize shadow-lg hover:bg-yellow-300 transition-colors" data-handle="bottom"></div>
                  <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-yellow-400 rounded-full cursor-w-resize shadow-lg hover:bg-yellow-300 transition-colors" data-handle="left"></div>
                  <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-yellow-400 rounded-full cursor-e-resize shadow-lg hover:bg-yellow-300 transition-colors" data-handle="right"></div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closePhotoEditor}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCroppedPhoto}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Save Cropped Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
