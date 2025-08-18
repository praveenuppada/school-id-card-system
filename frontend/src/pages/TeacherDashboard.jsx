import React, { useEffect, useState, useRef, useContext } from "react";
import { getProfile, getClasses, getStudentsByClass, uploadPhoto, submitUpdates, submitAllRecords, sendNotificationToAdmin } from "../services/teacherService";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../context/AuthContext";


export default function TeacherDashboard() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({});
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [studentPhotos, setStudentPhotos] = useState({});
  const [cameraStream, setCameraStream] = useState(null);
  const [activeCamera, setActiveCamera] = useState(null);
  const [showConfirmationCard, setShowConfirmationCard] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Load saved photos from localStorage on component mount
  useEffect(() => {
    const savedPhotos = localStorage.getItem('teacherStudentPhotos');
    console.log("🔍 Checking for saved photos in localStorage...");
    console.log("🔍 Raw savedPhotos:", savedPhotos);
    
    if (savedPhotos && savedPhotos !== '{}') {
      try {
        const parsedPhotos = JSON.parse(savedPhotos);
        console.log("📸 Loading saved photos from localStorage:", parsedPhotos);
        console.log("📸 Number of photos:", Object.keys(parsedPhotos).length);
        if (Object.keys(parsedPhotos).length > 0) {
          setStudentPhotos(parsedPhotos);
        } else {
          console.log("📸 Parsed photos is empty object, starting fresh");
          setStudentPhotos({});
        }
      } catch (error) {
        console.error("Error loading saved photos:", error);
        setStudentPhotos({});
      }
    } else {
      console.log("📸 No saved photos found in localStorage, starting with empty state");
      setStudentPhotos({});
    }
  }, []);

  // Save photos to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(studentPhotos).length > 0) {
      console.log("💾 Saving photos to localStorage:", studentPhotos);
      console.log("💾 Number of photos to save:", Object.keys(studentPhotos).length);
      localStorage.setItem('teacherStudentPhotos', JSON.stringify(studentPhotos));
      console.log("💾 Saved to localStorage successfully");
    } else {
      console.log("💾 No photos to save, studentPhotos is empty");
    }
  }, [studentPhotos]);

  useEffect(() => {
    loadProfile();
    loadClasses();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getProfile();
      console.log("📋 Teacher profile data:", res.data);
      console.log("📋 Profile data keys:", Object.keys(res.data));
      setProfile(res.data);
      
      // Try to get school name from profile
      const schoolName = res.data.schoolName || res.data.school?.name || res.data.schoolName;
      console.log("📋 School name from profile:", schoolName);
      console.log("📋 res.data.schoolName:", res.data.schoolName);
      console.log("📋 res.data.school:", res.data.school);
      
      if (schoolName) {
        localStorage.setItem('teacherSchoolName', schoolName);
        console.log("📋 Saved school name to localStorage:", schoolName);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      // For testing - set a default school name if profile fails
      if (!localStorage.getItem('teacherSchoolName')) {
        localStorage.setItem('teacherSchoolName', 'Test School');
      }
    }
  };

  const loadClasses = async () => {
    try {
      const res = await getClasses();
      console.log("📚 Classes response:", res);
      console.log("📚 Classes data:", res.data);
      
      // Handle different response structures
      let classesData = [];
      if (res.data && Array.isArray(res.data)) {
        classesData = res.data;
      } else if (res.data && res.data.classes && Array.isArray(res.data.classes)) {
        classesData = res.data.classes;
      } else if (res.data && res.data.success && Array.isArray(res.data.data)) {
        classesData = res.data.data;
      } else {
        console.warn("📚 Unexpected classes response structure:", res.data);
        classesData = [];
      }
      
      console.log("📚 Final classes data:", classesData);
      setClasses(classesData);
    } catch (error) {
      console.error("Error loading classes:", error);
      setClasses([]); // Ensure classes is always an array
    }
  };

  const handleClassChange = async (className) => {
    setSelectedClass(className);
    setCurrentPage(1);
    try {
      const res = await getStudentsByClass(className);
      console.log("👥 Students response:", res);
      console.log("👥 Students data:", res.data);
      
      // Handle different response structures
      let studentsData = [];
      if (res.data && Array.isArray(res.data)) {
        studentsData = res.data;
      } else if (res.data && res.data.students && Array.isArray(res.data.students)) {
        studentsData = res.data.students;
      } else if (res.data && res.data.success && Array.isArray(res.data.data)) {
        studentsData = res.data.data;
      } else {
        console.warn("👥 Unexpected students response structure:", res.data);
        studentsData = [];
      }
      
      console.log("👥 Final students data:", studentsData);
      setStudents(studentsData);
    } catch (error) {
      console.error("Error loading students:", error);
      setStudents([]); // Ensure students is always an array
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

  // Camera functions
  const startCamera = async (studentId) => {
    try {
      console.log("📸 Starting camera for student:", studentId);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      console.log("📸 Camera stream obtained:", stream);
      setCameraStream(stream);
      setActiveCamera(studentId);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("📸 Video element updated with stream");
      }
    } catch (error) {
      console.error("❌ Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions and try again.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setActiveCamera(null);
    }
  };

  const capturePhoto = (studentId) => {
    if (videoRef.current && canvasRef.current) {
      console.log("📸 Capturing photo for student:", studentId);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Wait for video to be ready
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        const updatedPhotos = {
          ...studentPhotos,
          [studentId]: {
            data: photoData,
            timestamp: new Date().toISOString(),
            status: 'captured'
          }
        };
        
        setStudentPhotos(updatedPhotos);
        console.log("📸 Photo captured successfully, updated studentPhotos:", updatedPhotos);
        
        // Force save to localStorage immediately
        localStorage.setItem('teacherStudentPhotos', JSON.stringify(updatedPhotos));
        console.log("💾 Immediately saved captured photo to localStorage");
        
        stopCamera();
        
        // Show success message
        alert("Photo captured successfully! Click 'Save' to upload it.");
      } else {
        console.log("❌ Video not ready, waiting...");
        setTimeout(() => capturePhoto(studentId), 100);
      }
    } else {
      console.error("❌ Video or canvas ref not available");
      alert("Camera not ready. Please try again.");
    }
  };

  const handleFileUpload = (studentId, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const updatedPhotos = {
        ...studentPhotos,
        [studentId]: {
          data: e.target.result,
          timestamp: new Date().toISOString(),
          status: 'uploaded',
          filename: file.name
        }
      };
      
      setStudentPhotos(updatedPhotos);
      console.log("📁 File uploaded, updated studentPhotos:", updatedPhotos);
      
      // Force save to localStorage immediately
      localStorage.setItem('teacherStudentPhotos', JSON.stringify(updatedPhotos));
      console.log("💾 Immediately saved uploaded file to localStorage");
    };
    reader.readAsDataURL(file);
  };

  const savePhoto = async (studentId) => {
    const photo = studentPhotos[studentId];
    if (!photo) return;

    try {
      // Convert base64 to blob
      const response = await fetch(photo.data);
      const blob = await response.blob();
      
      // Create a file from the blob
      const file = new File([blob], `${studentId}.jpg`, { type: 'image/jpeg' });
      
      // Find the student object to get photoId
      const student = students.find(s => (s._id || s.id) === studentId);
      if (!student) {
        throw new Error("Student not found");
      }
      
      console.log("🎯 Student found:", { 
        studentId, 
        photoId: student.photoId, 
        fullName: student.fullName 
      });
      
      // Upload to backend using the existing uploadPhoto function
      await uploadPhoto(student.photoId, file, studentId);
      
      const updatedPhotos = {
        ...studentPhotos,
        [studentId]: {
          ...studentPhotos[studentId],
          status: 'saved'
        }
      };
      
      setStudentPhotos(updatedPhotos);
      console.log("💾 Photo saved, updated studentPhotos:", updatedPhotos);
      
      // Force save to localStorage immediately
      localStorage.setItem('teacherStudentPhotos', JSON.stringify(updatedPhotos));
      console.log("💾 Immediately saved to localStorage");
    } catch (error) {
      console.error("Error saving photo:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: JSON.stringify(error.response?.data, null, 2),
        message: error.message,
        fullError: JSON.stringify(error, null, 2)
      });
      
      // Check if the photo was actually saved despite the error
      if (error.response?.data?.success) {
        console.log("✅ Photo was actually saved successfully!");
        return;
      }
    }
  };

  const retakePhoto = (studentId) => {
    setStudentPhotos(prev => ({
      ...prev,
      [studentId]: null
    }));
  };

  const handleDeleteAllRecords = async () => {
    try {
      // Clear local photos
      setStudentPhotos({});
      localStorage.removeItem('teacherStudentPhotos');
      
      // You can add API call here to delete records from backend
      // await deleteAllRecords();
      
      console.log("All records deleted successfully");
    } catch (error) {
      console.error("Error deleting records:", error);
    } finally {
      setShowDeleteConfirmation(false);
    }
  };



  const submitAllRecords = async () => {
    const savedPhotos = Object.entries(studentPhotos).filter(([_, photo]) => photo?.status === 'saved');
    
    if (savedPhotos.length === 0) {
      alert("No photos to submit. Please save at least one photo.");
      return;
    }

    try {
      // Submit all saved photos to admin using the existing endpoint
      await submitUpdates();
      
      // Send notification to admin
      await sendNotificationToAdmin(
        "Teacher Updates Submitted",
        `Teacher has submitted ${savedPhotos.length} updated student records with photos.`,
        "TEACHER_UPDATE"
      );
      
      // Show confirmation card instead of alert
      setShowConfirmationCard(true);
      
      // Keep ALL photos but mark saved ones as submitted
      const updatedPhotos = { ...studentPhotos };
      Object.entries(studentPhotos).forEach(([studentId, photo]) => {
        if (photo?.status === 'saved') {
          updatedPhotos[studentId] = {
            ...photo,
            status: 'submitted'
          };
        }
        // Keep all other photos as they are (captured, submitted, etc.)
      });
      setStudentPhotos(updatedPhotos);
      console.log("📤 After submission - photos:", updatedPhotos);
    } catch (error) {
      console.error("Error submitting records:", error);
    }
  };

  const PhotoUploadComponent = ({ student }) => {
    const studentId = student._id || student.id;
    const photo = studentPhotos[studentId];

    return (
      <div className="space-y-4">
        {activeCamera === studentId ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg border-2 border-gray-300"
              />
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => capturePhoto(studentId)}
                className="px-4 py-3 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 font-medium transition-colors"
              >
                📸 Capture
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-3 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 font-medium transition-colors"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        ) : photo ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={photo.data}
                alt="Student photo"
                className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg border-2 border-gray-300"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => savePhoto(studentId)}
                disabled={photo.status === 'saved'}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  photo.status === 'saved'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {photo.status === 'saved' ? '✅ Saved' : '💾 Save'}
              </button>
              <button
                onClick={() => retakePhoto(studentId)}
                className="px-4 py-3 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 font-medium transition-colors"
              >
                📷 Retake
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-sm text-center">No Photo</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => startCamera(studentId)}
                className="px-4 py-3 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 font-medium transition-colors"
              >
                📷 Take Photo
              </button>
              <label className="px-4 py-3 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 cursor-pointer font-medium text-center transition-colors">
                📁 Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files[0] && handleFileUpload(studentId, e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-yellow-50">
      <Sidebar role="TEACHER" />
      <div className="flex-1 p-4 sm:p-6 ml-0 md:ml-64">
        {/* Mobile Header */}
        <div className="block sm:hidden mb-4">
          <h1 className="text-xl font-bold text-yellow-600 mb-2">
            {(() => {
              const schoolName = user?.schoolName || user?.school?.name || 
                                profile?.schoolName || profile?.school?.name ||
                                localStorage.getItem('teacherSchoolName') || 
                                "Teacher Dashboard";
              return schoolName;
            })()}
          </h1>
          <button
            onClick={submitAllRecords}
            className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-base"
          >
            📤 Submit All Records
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-yellow-600">
              {(() => {
                const schoolName = user?.schoolName || user?.school?.name || 
                                  profile?.schoolName || profile?.school?.name ||
                                  localStorage.getItem('teacherSchoolName') || 
                                  "Teacher Dashboard";
                return schoolName;
              })()}
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={submitAllRecords}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              📤 Submit All Records
            </button>
          </div>
        </div>
        
        {/* Class Selection */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-base"
          >
            <option value="">Choose a class...</option>
            {Array.isArray(classes) && classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Students Table */}
        {Array.isArray(students) && students.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo Upload</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getPaginatedStudents().map((student) => (
                    <tr key={student._id || student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.photoId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.className}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PhotoUploadComponent student={student} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {studentPhotos[student._id || student.id]?.status === 'submitted' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            📤 Submitted
                          </span>
                        ) : studentPhotos[student._id || student.id]?.status === 'saved' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✅ Saved
                          </span>
                        ) : studentPhotos[student._id || student.id] ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            📸 Captured
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            ⏳ Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {getPaginatedStudents().map((student) => (
                <div key={student._id || student.id} className="border-b border-gray-200 p-4 bg-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{student.fullName}</h3>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">📋 ID: {student.photoId}</p>
                        <p className="text-sm text-gray-600">🏫 Class: {student.className}</p>
                      </div>
                    </div>
                    <div className="ml-3">
                      {studentPhotos[student._id || student.id]?.status === 'submitted' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          📤 Submitted
                        </span>
                      ) : studentPhotos[student._id || student.id]?.status === 'saved' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          ✅ Saved
                        </span>
                      ) : studentPhotos[student._id || student.id] ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          📸 Captured
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          ⏳ Pending
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <PhotoUploadComponent student={student} />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {getTotalPages() > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {currentPage} of {getTotalPages()}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === getTotalPages()}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedClass && students.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No students found in this class.</p>
          </div>
        )}

        {/* Confirmation Card */}
        {showConfirmationCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
              <div className="text-green-500 text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Data Sent Successfully!</h3>
              <p className="text-gray-600 mb-6">
                All student records have been successfully sent to the admin.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowConfirmationCard(false)}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Continue
                </button>

              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Card */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete All Records</h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete ALL records for this school!
                <br /><br />
                • All student photos will be deleted<br />
                • All Excel data will be removed<br />
                • This action cannot be undone!
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllRecords}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete All Records
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
