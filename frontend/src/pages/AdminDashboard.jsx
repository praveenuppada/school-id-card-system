import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import NotificationBell from "../components/NotificationBell";
import { useNotification } from "../context/NotificationContext";
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
    const startCropData = { ...cropData };
    const startX = e.clientX;
    const startY = e.clientY;
    
    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // Convert pixel deltas to percentage
      const containerRect = e.target.getBoundingClientRect();
      const deltaXPercent = (deltaX / containerRect.width) * 100;
      const deltaYPercent = (deltaY / containerRect.height) * 100;
      
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 bg-yellow-500 text-white font-bold text-xl text-center">
          Harsha ID Solutions
        </div>
        <nav className="flex-1 px-4 py-6">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className="w-full text-left px-4 py-3 mb-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg"
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-yellow-200">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-yellow-600">Admin Dashboard</h1>
          <NotificationBell />
        </div>

        {/* ID Card Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg mb-6">
            <div className="text-white text-4xl font-bold">ID</div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Harsha ID Solutions</h1>
          <p className="text-lg text-gray-600">School ID Card Management System</p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.totalSchools}</div>
            <div className="text-gray-600">Total Schools</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalClasses}</div>
            <div className="text-gray-600">Total Classes</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalStudents}</div>
            <div className="text-gray-600">Total Students</div>
          </div>
        </div>

        {/* Students List */}
        {students.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Students</h3>
              <p className="text-sm text-gray-600">
                Showing {getPaginatedStudents().length} of {students.length} students
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Photo ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Photo Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getPaginatedStudents().map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.photoId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.className}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.photoUploaded ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">✅ Uploaded</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">❌ Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openPhotoEditor(student)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            ✂️ Crop
                          </button>
                          {student.photoUrl && (
                            <button
                              onClick={() => downloadPhoto(student)}
                              className="text-green-600 hover:text-green-900"
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
          </div>
        )}

        {/* Photo Editor Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Crop Photo for {selectedPhoto.fullName}</h3>
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
                  <div className="absolute left-0 top-2/3 w-full h-full h-px bg-yellow-400"></div>
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
      </main>
    </div>
  );
}
