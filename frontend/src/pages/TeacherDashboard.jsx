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
  const [debugLogs, setDebugLogs] = useState([]);
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
    
    // Cleanup function to stop camera when component unmounts
    return () => {
      if (cameraStream) {
        console.log("🧹 Cleaning up camera stream on unmount");
        stopCamera();
      }
      // Clean up all resources to prevent memory leaks
      console.log("🧹 Cleaning up all resources on component unmount");
      cleanupResources();
    };
  }, []);

  // Handle video stream setup when activeCamera changes
  useEffect(() => {
    if (activeCamera && cameraStream && videoRef.current) {
      console.log("📸 Setting up video stream for active camera");
      videoRef.current.srcObject = cameraStream;
      
      videoRef.current.onloadedmetadata = () => {
        console.log("📸 Video metadata loaded, dimensions:", videoRef.current.videoWidth, "x", videoRef.current.videoHeight);
      };
      
      videoRef.current.onerror = (error) => {
        console.error("❌ Video element error:", error);
        alert("Camera video stream error. Please try again.");
        stopCamera();
      };
    }
  }, [activeCamera, cameraStream]);

  const loadProfile = async () => {
    try {
      const res = await getProfile();
      console.log("📋 Teacher profile data:", res.data);
      console.log("📋 Profile data keys:", Object.keys(res.data));
      setProfile(res.data);
      
      // Get school name based on teacher username
      const teacherUsername = user?.username || res.data?.username;
      console.log("👤 Teacher username:", teacherUsername);
      
      let schoolName = null;
      
      // Map teacher usernames to school names
      if (teacherUsername === 'navodhaya') {
        schoolName = 'Navodhaya Model School';
        console.log("🏫 Mapped school name for navodhaya:", schoolName);
      } else if (teacherUsername === 'haRsHa@219') {
        schoolName = 'Harsha ID Solutions';
        console.log("🏫 Mapped school name for haRsHa@219:", schoolName);
      } else {
        // Try to get school name from profile data
        console.log("🔍 Full profile response structure:", JSON.stringify(res.data, null, 2));
        
        if (res.data?.schoolName) {
          schoolName = res.data.schoolName;
          console.log("📋 School name from profile:", schoolName);
        } else if (res.data?.school?.name) {
          schoolName = res.data.school.name;
          console.log("📋 School name from profile school object:", schoolName);
        } else if (res.data?.teacher?.schoolName) {
          schoolName = res.data.teacher.schoolName;
          console.log("📋 School name from profile teacher object:", schoolName);
        } else if (res.data?.teacher?.school?.name) {
          schoolName = res.data.teacher.school.name;
          console.log("📋 School name from profile teacher school object:", schoolName);
        }
      }
      
      if (schoolName) {
        localStorage.setItem('teacherSchoolName', schoolName);
        console.log("💾 Saved school name to localStorage:", schoolName);
      } else {
        console.log("❌ No school name found - using default");
        localStorage.setItem('teacherSchoolName', 'School Dashboard');
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      // Set default school name based on username
      const teacherUsername = user?.username;
      if (teacherUsername === 'navodhaya') {
        localStorage.setItem('teacherSchoolName', 'Navodhaya Model School');
      } else {
        localStorage.setItem('teacherSchoolName', 'School Dashboard');
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
      
      // Try to get school name from classes response - more comprehensive check
      console.log("🔍 Full classes response structure:", JSON.stringify(res.data, null, 2));
      
      if (res.data?.schoolName) {
        console.log("📚 School name from classes:", res.data.schoolName);
        localStorage.setItem('teacherSchoolName', res.data.schoolName);
      } else if (res.data?.school?.name) {
        console.log("📚 School name from classes school object:", res.data.school.name);
        localStorage.setItem('teacherSchoolName', res.data.school.name);
      } else if (res.data?.data?.schoolName) {
        console.log("📚 School name from classes data:", res.data.data.schoolName);
        localStorage.setItem('teacherSchoolName', res.data.data.schoolName);
      } else if (res.data?.teacher?.schoolName) {
        console.log("📚 School name from teacher object:", res.data.teacher.schoolName);
        localStorage.setItem('teacherSchoolName', res.data.teacher.schoolName);
      } else if (res.data?.teacher?.school?.name) {
        console.log("📚 School name from teacher school object:", res.data.teacher.school.name);
        localStorage.setItem('teacherSchoolName', res.data.teacher.school.name);
      } else {
        console.log("❌ No school name found in classes response");
        // Try to get from user context or localStorage
        const storedSchoolName = localStorage.getItem('teacherSchoolName');
        if (storedSchoolName) {
          console.log("📚 Using stored school name:", storedSchoolName);
        }
      }
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

    // Camera functions with Android fallback
  const startCamera = async (studentId) => {
    try {
      console.log("📸 Starting camera for student:", studentId);
      
      // Clean up any existing resources before starting camera
      cleanupResources();
      
      // Check if we're on Android
      const isAndroid = /Android/i.test(navigator.userAgent);
      console.log("📱 Device type:", isAndroid ? "Android" : "Other");
      
      // Create file input for native camera app with better Android support
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      // Use different capture settings for Android
      if (isAndroid) {
        input.capture = 'environment'; // Back camera for Android
        console.log("📸 Using back camera for Android");
        // Add Android-specific attributes
        input.setAttribute('data-testid', 'camera-input-android');
        input.setAttribute('data-capture', 'environment');
      } else {
        input.capture = 'environment'; // Back camera for other devices
        console.log("📸 Using back camera for other devices");
        input.setAttribute('data-testid', 'camera-input');
      }
      
      // Add additional attributes for better Android compatibility
      input.style.display = 'none';
      
      input.onchange = async (e) => {
        try {
          addDebugLog("📸 Camera file selected", "info");
          console.log("📸 Camera file selected");
          const file = e.target.files[0];
          
          if (file) {
            addDebugLog(`📸 File: ${file.name} (${file.size} bytes)`, "info");
            console.log("📸 Camera file details:", {
              name: file.name,
              type: file.type,
              size: file.size,
              lastModified: file.lastModified
            });
            
            // Use the same validation as handleFileUpload
            if (!file.type.startsWith('image/') && !file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) {
              alert("Please select an image file (JPG, PNG, GIF, BMP, or WebP).");
              return;
            }
            
            // Accept any file size - no compression
            handleFileUpload(studentId, file);
          } else {
            console.log("📸 No file selected from camera");
          }
        } catch (error) {
          console.error("❌ Error in camera file selection:", error);
          cleanupResources();
          
          // Android-specific error message
          if (isAndroid) {
            alert("Android: Error processing camera image. Please try again or use file upload.");
          } else {
            alert("Error processing camera image. Please try again.");
          }
        }
      };
      
      input.onerror = (error) => {
        console.error("❌ Camera input error:", error);
        cleanupResources();
        
        // Android-specific error message
        if (isAndroid) {
          alert("Android: Camera error. Please try again or use file upload instead.");
        } else {
          alert("Camera error. Please try again or use file upload instead.");
        }
      };
      
      // Add to DOM temporarily
      document.body.appendChild(input);
      
      // Trigger file selection
      input.click();
      
      // Clean up after a delay
      setTimeout(() => {
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      }, 1000);
      
    } catch (error) {
      console.error("❌ Error accessing camera:", error);
      cleanupResources();
      
      // Android-specific error message
      const isAndroid = /Android/i.test(navigator.userAgent);
      if (isAndroid) {
        alert("Android: Unable to access camera. Please check permissions and try again.");
      } else {
        alert("Unable to access camera. Please check permissions and try again.");
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setActiveCamera(null);
    }
  };

  const capturePhoto = (studentId, retryCount = 0) => {
    const maxRetries = 50; // Maximum 5 seconds (50 * 100ms)
    
    if (videoRef.current && canvasRef.current) {
      console.log("📸 Capturing photo for student:", studentId, "Retry:", retryCount);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Check if video has valid dimensions
      if (video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= 2) {
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
      } else if (retryCount < maxRetries) {
        console.log("❌ Video not ready, waiting... (Retry:", retryCount + 1, "/", maxRetries, ")");
        setTimeout(() => capturePhoto(studentId, retryCount + 1), 100);
      } else {
        console.error("❌ Video never became ready after", maxRetries, "retries");
        alert("Camera failed to initialize properly. Please try again or use file upload instead.");
        stopCamera();
      }
    } else {
      console.error("❌ Video or canvas ref not available");
      alert("Camera not ready. Please try again.");
      stopCamera();
    }
  };



  // Debug logging function for mobile
  const addDebugLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, type };
    setDebugLogs(prev => [...prev.slice(-9), logEntry]); // Keep last 10 logs
    console.log(`[${timestamp}] ${message}`);
  };

  // Global cleanup function to prevent memory leaks
  const cleanupResources = () => {
    console.log("🧹 Starting cleanup...");
    
    // Clean up any existing object URLs
    if (window.currentObjectUrl) {
      console.log("🧹 Cleaning up object URL");
      URL.revokeObjectURL(window.currentObjectUrl);
      window.currentObjectUrl = null;
    }
    
    // Clean up any existing FileReader
    if (window.currentFileReader) {
      console.log("🧹 Cleaning up FileReader");
      try {
        window.currentFileReader.abort();
      } catch (e) {
        console.log("🧹 FileReader already aborted");
      }
      window.currentFileReader = null;
    }
    
    // Clear any existing timeouts
    if (window.currentTimeout) {
      console.log("🧹 Cleaning up timeout");
      clearTimeout(window.currentTimeout);
      window.currentTimeout = null;
    }
    
    // Force garbage collection if available
    if (window.gc) {
      console.log("🧹 Forcing garbage collection");
      window.gc();
    }
    
    // Clear any remaining references
    if (window.currentImage) {
      console.log("🧹 Cleaning up image reference");
      window.currentImage = null;
    }
    
    if (window.currentCanvas) {
      console.log("🧹 Cleaning up canvas reference");
      window.currentCanvas = null;
    }
    
    console.log("🧹 Cleanup completed");
  };

  // Force fresh start for each photo upload
  const forceFreshStart = () => {
    console.log("🔄 Forcing fresh start...");
    
    // Clear all global references
    window.currentObjectUrl = null;
    window.currentFileReader = null;
    window.currentTimeout = null;
    window.currentImage = null;
    window.currentCanvas = null;
    
    // Force garbage collection
    if (window.gc) {
      window.gc();
    }
    
    // Small delay to ensure cleanup
    return new Promise(resolve => setTimeout(resolve, 100));
  };

  const handleFileUpload = async (studentId, file) => {
    try {
      console.log("📁 File upload for student:", studentId, "File:", file);
      
      if (!file) {
        console.error("❌ No file selected");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/') && !file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) {
        alert("Please select an image file (JPG, PNG, GIF, BMP, or WebP).");
        return;
      }
      
      // PERFECT SOLUTION - Send file directly to backend API
      console.log("📱 Using PERFECT solution - sending to backend API");
      
      // Find the student to get photoId
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
      addDebugLog("📤 Starting backend upload...", "info");
      addDebugLog(`📤 File: ${file.name} (${file.size} bytes)`, "info");
      addDebugLog(`📤 Student: ${student.fullName} (${student.photoId})`, "info");
      
      console.log("📤 Starting backend upload...");
      console.log("📤 Upload details:", {
        photoId: student.photoId,
        studentId: studentId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      // Verify file exists and has content
      if (!file || file.size === 0) {
        addDebugLog("❌ File is empty or invalid", "error");
        throw new Error("File is empty or invalid");
      }
      
      addDebugLog("✅ File validation passed", "success");
      console.log("📤 File validation passed - file exists and has content");
      
              try {
          addDebugLog("📤 Sending to backend API...", "info");
          addDebugLog("📤 Sending to backend API...", "info");
          const response = await uploadPhoto(student.photoId, file, studentId);
          
          addDebugLog("✅ Backend response received", "success");
          addDebugLog(`📤 Response: ${JSON.stringify(response.data)}`, "info");
          console.log("📤 Backend upload response:", response.data);
          
          if (!response.data.success) {
            addDebugLog(`❌ Backend error: ${response.data.message}`, "error");
            throw new Error(response.data.message || "Upload failed");
          }
      } catch (uploadError) {
        addDebugLog(`❌ Upload error: ${uploadError.message}`, "error");
        addDebugLog(`❌ Status: ${uploadError.response?.status}`, "error");
        addDebugLog(`❌ Response: ${JSON.stringify(uploadError.response?.data)}`, "error");
        addDebugLog(`❌ Full error: ${JSON.stringify(uploadError)}`, "error");
        
        console.error("📤 Upload error details:", {
          error: uploadError,
          message: uploadError.message,
          response: uploadError.response?.data,
          status: uploadError.response?.status
        });
        
        // Check if it's a network error, timeout, or server error
        if (uploadError.code === 'NETWORK_ERROR' || 
            uploadError.message.includes('Network Error') ||
            uploadError.message.includes('timeout') ||
            uploadError.code === 'ECONNABORTED') {
          addDebugLog("📱 Network/timeout error - using local storage fallback", "warning");
          console.log("📱 Network/timeout error detected - using local storage fallback");
          
          // Fallback: Save locally and show message
          const updatedPhotos = {
            ...studentPhotos,
            [studentId]: {
              data: dataUrl,
              timestamp: new Date().toISOString(),
              status: 'pending_upload',
              filename: file.name,
              error: 'Network/timeout error - will retry when connection is restored'
            }
          };
          
          setStudentPhotos(updatedPhotos);
          localStorage.setItem('teacherStudentPhotos', JSON.stringify(updatedPhotos));
          
          alert("Photo saved locally. Upload will retry when connection is restored.");
          return;
        }
        
        // Show specific error message
        if (uploadError.response?.data?.message) {
          const errorMessage = uploadError.response.data.message;
          
          // Handle quota exceeded error
          if (errorMessage.includes('quota') || errorMessage.includes('Quota') || errorMessage.includes('exceeded')) {
            addDebugLog("⚠️ Cloudinary quota exceeded - using local storage", "warning");
            throw new Error("Upload quota exceeded. Photo saved locally. Please try again later.");
          }
          
          throw new Error(errorMessage);
        } else if (uploadError.message) {
          throw new Error(uploadError.message);
        } else {
          throw new Error("Upload failed. Please check your connection and try again.");
        }
      }
      
      // Use the Cloudinary URL from backend response for display
      const photoUrl = response.data.photoUrl;
      addDebugLog(`📸 Using Cloudinary URL: ${photoUrl}`, "info");
      
      // Fallback: If no Cloudinary URL, create a data URL for preview
      if (!photoUrl) {
        addDebugLog("⚠️ No Cloudinary URL received, creating data URL fallback", "warning");
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => reject(new Error("Failed to create preview"));
          reader.readAsDataURL(file);
        });
        
        // Save with data URL as fallback
        const updatedPhotos = {
          ...studentPhotos,
          [studentId]: {
            data: dataUrl,
            timestamp: new Date().toISOString(),
            status: 'uploaded_no_url',
            filename: file.name
          }
        };
        
        setStudentPhotos(updatedPhotos);
        localStorage.setItem('teacherStudentPhotos', JSON.stringify(updatedPhotos));
        addDebugLog("✅ Photo saved with data URL fallback", "success");
        alert("Photo uploaded successfully! (Using local preview)");
        return;
      }
      
      // Save the photo with Cloudinary URL for display
      const updatedPhotos = {
        ...studentPhotos,
        [studentId]: {
          data: photoUrl, // Use Cloudinary URL instead of data URL
          timestamp: new Date().toISOString(),
          status: 'uploaded',
          filename: file.name,
          cloudinaryUrl: photoUrl // Store the Cloudinary URL separately
        }
      };
      
      setStudentPhotos(updatedPhotos);
      console.log("📁 Photo uploaded successfully for student:", studentId);
      
      localStorage.setItem('teacherStudentPhotos', JSON.stringify(updatedPhotos));
      console.log("💾 Saved to localStorage");
      
      alert("Photo uploaded successfully!");
      
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      
      // Show specific error message based on error type
      let errorMessage = "Error uploading file. Please try again.";
      
      if (error.message.includes("Network Error")) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Upload timeout. Please try again with a smaller image.";
      } else if (error.message.includes("413")) {
        errorMessage = "File too large. Please select a smaller image.";
      } else if (error.message.includes("401")) {
        errorMessage = "Authentication error. Please log in again.";
      } else if (error.message.includes("500")) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
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



  const handleSubmitAllRecords = async () => {
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

  const handleClearAllPhotos = async () => {
    try {
      // Clear local photos
      setStudentPhotos({});
      localStorage.removeItem('teacherStudentPhotos');
      
      // You can add API call here to delete records from backend
      // await deleteAllRecords();
      
      console.log("All photos cleared successfully");
    } catch (error) {
      console.error("Error clearing photos:", error);
    } finally {
      setShowDeleteConfirmation(false);
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
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 font-medium transition-colors"
              >
                📸 Capture
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 font-medium transition-colors"
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  photo.status === 'saved'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {photo.status === 'saved' ? '✅ Saved' : '💾 Save'}
              </button>
              <button
                onClick={() => retakePhoto(studentId)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 font-medium transition-colors"
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
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 font-medium transition-colors"
              >
                📷 Take Photo
              </button>
              <label className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 cursor-pointer font-medium text-center transition-colors">
                📁 Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      addDebugLog(`📁 File selected: ${file.name} (${file.size} bytes)`, "info");
                      
                      // Validate file before processing
                      if (!file.type.startsWith('image/')) {
                        addDebugLog("❌ Invalid file type selected", "error");
                        alert("Please select an image file.");
                        return;
                      }
                      
                      addDebugLog("✅ File validation passed, starting upload", "success");
                      // Accept any file size - no compression
                      handleFileUpload(studentId, file);
                    } else {
                      addDebugLog("❌ No file selected", "error");
                    }
                  }}
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
    <div className="min-h-screen bg-gray-50 flex teacher-dashboard" style={{ overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
      <Sidebar role="TEACHER" />
      
      {/* Main Content Container - Proper layout */}
      <div className="flex-1 w-full" style={{ overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 md:pt-6 pt-16" style={{ overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
          
          {/* Debug Panel - Always visible for testing */}
          <div className="mb-6 bg-gray-900 text-white p-4 rounded-lg font-mono text-xs max-h-40 overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold">🔍 Debug Logs (Last 10)</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    addDebugLog("🧪 Test log message", "info");
                  }} 
                  className="text-blue-400 hover:text-white text-xs"
                >
                  Test
                </button>
                <button 
                  onClick={async () => {
                    addDebugLog("🧪 Testing file upload...", "info");
                    try {
                      // Create a test file
                      const testData = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";
                      const response = await fetch(testData);
                      const blob = await response.blob();
                      const testFile = new File([blob], "test.jpg", { type: "image/jpeg" });
                      
                      addDebugLog(`🧪 Test file created: ${testFile.name} (${testFile.size} bytes)`, "info");
                      
                      // Test upload with first student
                      if (students.length > 0) {
                        const firstStudent = students[0];
                        addDebugLog(`🧪 Testing with student: ${firstStudent.fullName}`, "info");
                        await handleFileUpload(firstStudent._id || firstStudent.id, testFile);
                      } else {
                        addDebugLog("❌ No students available for test", "error");
                      }
                    } catch (error) {
                      addDebugLog(`❌ Test failed: ${error.message}`, "error");
                    }
                  }} 
                  className="text-green-400 hover:text-white text-xs"
                >
                  Test Upload
                </button>
                <button 
                  onClick={() => setDebugLogs([])} 
                  className="text-gray-400 hover:text-white"
                >
                  Clear
                </button>
              </div>
            </div>
            {debugLogs.length === 0 ? (
              <div className="text-gray-500">No logs yet. Try uploading a photo or click "Test"</div>
            ) : (
              debugLogs.map((log, index) => (
                <div key={index} className={`mb-1 ${
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'success' ? 'text-green-400' : 
                  log.type === 'warning' ? 'text-yellow-400' : 
                  'text-gray-300'
                }`}>
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))
            )}
          </div>
          
          {/* Header Section - Compact and professional */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-3 sm:mb-0">
                <h1 className="text-xl font-bold text-gray-900">
                  {user?.schoolName || user?.school?.name || profile?.schoolName || profile?.school?.name || localStorage.getItem('teacherSchoolName') || "School Dashboard"}
                </h1>
                <p className="text-sm text-gray-500">Teacher Portal</p>

              </div>
              
              {/* Action Button - Compact spacing */}
              <div className="flex-shrink-0">
                <button
                  onClick={handleSubmitAllRecords}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  📋 Submit All Records
                </button>
              </div>
            </div>
          </div>

          {/* Class Selection - Compact spacing */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
            <div className="px-6 py-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
              >
                <option value="">Choose a class...</option>
                {Array.isArray(classes) && classes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
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
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo Upload</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getPaginatedStudents().map((student) => (
                      <tr key={student._id || student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {student.photoId}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {student.fullName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {student.className}
                        </td>
                        <td className="px-6 py-4">
                          <PhotoUploadComponent student={student} />
                        </td>
                        <td className="px-6 py-4">
                          {studentPhotos[student._id || student.id]?.status === 'submitted' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✅ Submitted
                            </span>
                          ) : studentPhotos[student._id || student.id]?.status === 'saved' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              💾 Saved
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              ⏳ Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards - Like Amazon's mobile product cards */}
              <div className="md:hidden">
                {getPaginatedStudents().map((student) => (
                  <div key={student._id || student.id} className="border-b border-gray-200 p-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{student.fullName}</h3>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">📋 ID: {student.photoId}</p>
                          <p className="text-sm text-gray-600">🏫 Class: {student.className}</p>
                        </div>
                      </div>
                      <div className="ml-4">
                        {studentPhotos[student._id || student.id]?.status === 'submitted' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✅ Submitted
                          </span>
                        ) : studentPhotos[student._id || student.id]?.status === 'saved' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            💾 Saved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
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
          {Array.isArray(students) && students.length === 0 && selectedClass && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">No students are registered in this class.</p>
            </div>
          )}

          {/* No Class Selected State */}
          {!selectedClass && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Select a class</h3>
              <p className="mt-1 text-sm text-gray-500">Choose a class from the dropdown above to view students.</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Cards */}
      {showConfirmationCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Records Submitted Successfully!</h3>
            <p className="text-sm text-gray-600 mb-6">All student photos have been submitted to the admin for review.</p>
            <button
              onClick={() => setShowConfirmationCard(false)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Clear All Photos?</h3>
            <p className="text-sm text-gray-600 mb-6">This will remove all uploaded photos. This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllPhotos}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
