import api from "./api";

export const registerTeacher = (data) => {
  console.log("🔐 registerTeacher API call:");
  console.log("Data being sent:", data);
  console.log("Endpoint:", "/admin/teacher");
  return api.post("/admin/teacher", data, {
    headers: { "Content-Type": "application/json" },
  });
};

export const registerSchool = (data) => {
  console.log("🔐 registerSchool API call:");
  console.log("Data being sent:", data);
  return api.post("/admin/school", data, {
    headers: { "Content-Type": "application/json" },
  });
};

export const uploadExcel = (file, schoolId) => {
  console.log("📤 uploadExcel API call:");
  console.log("File:", file.name, file.size, file.type);
  console.log("SchoolId:", schoolId);
  
  // Check authentication
  const token = localStorage.getItem('REACT_APP_JWT_STORAGE_KEY');
  const userRole = localStorage.getItem('role');
  console.log("🔐 Auth check - Token exists:", !!token);
  console.log("🔐 Auth check - User role:", userRole);
  
  const formData = new FormData();
  formData.append("file", file);
  formData.append("schoolId", schoolId);
  
  // Log FormData contents
  for (let [key, value] of formData.entries()) {
    console.log("FormData:", key, value);
  }
  
  return api.post("/admin/upload-excel", formData, {
    headers: { 
      "Content-Type": "multipart/form-data",
      "Authorization": `Bearer ${token}`
    },
  }).catch(error => {
    console.error("❌ uploadExcel failed:", error.response?.status, error.response?.data);
    console.error("❌ Full error:", error);
    console.error("❌ Request config:", error.config);
    throw error;
  });
};

export const getStats = () => {
  console.log("📊 getStats API call - endpoint: /admin/stats");
  return api.get("/admin/stats");
};

export const getSchools = () => {
  console.log("🔍 getSchools API call - endpoint: /admin/schools");
  // Try alternative endpoints if the main one fails
  return api.get("/admin/schools").catch(error => {
    console.log("❌ /admin/schools failed, trying alternative endpoints...");
    console.log("❌ Error:", error.response?.status, error.response?.data);
    
    // Try alternative endpoints
    return api.get("/admin/view-schools").catch(error2 => {
      console.log("❌ /admin/view-schools also failed:", error2.response?.status);
      return api.get("/schools").catch(error3 => {
        console.log("❌ /schools also failed:", error3.response?.status);
        throw error; // Throw the original error
      });
    });
  });
};

export const getClasses = (schoolId) => {
  console.log("📚 getClasses for schoolId:", schoolId);
  return api.get(`/admin/view-classes/${schoolId}`);
};

export const getStudentsByClass = (className) => {
  console.log("👥 getStudentsByClass for className:", className);
  return api.get(`/admin/students-by-class/${className}`);
};

export const getSchoolData = (schoolId) => {
  console.log("🏫 getSchoolData for schoolId:", schoolId);
  return api.get(`/admin/school-data/${schoolId}`);
};

export const downloadExcel = (schoolName) => {
  console.log("📊 downloadExcel for school:", schoolName);
  return api.get(`/admin/download-excel/${schoolName}`, {
    responseType: 'blob'
  });
};

export const downloadPhotos = (schoolName) => {
  console.log("📸 downloadPhotos for school:", schoolName);
  return api.get(`/admin/download-photos/${schoolName}`, {
    responseType: 'blob'
  });
};

export const cropPhoto = (formData) => {
  console.log("✂️ cropPhoto:", formData);
  return api.post("/admin/crop-photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const resetAdminPassword = (data) => {
  console.log("🔐 resetAdminPassword:", data);
  // Send as JSON for complex objects
  return api.post("/admin/reset-password", data, {
    headers: { "Content-Type": "application/json" },
  });
};

// Add the missing function for NotificationBell
export const getTeacherUpdates = () => {
  console.log("🔔 getTeacherUpdates");
  return api.get("/admin/teacher-updates");
};

// Delete all photos for a school
export const deleteAllPhotos = (schoolId) => {
  console.log("🗑️ deleteAllPhotos for schoolId:", schoolId);
  return api.delete(`/admin/delete-photos/${schoolId}`);
};

// Delete Excel data for a school
export const deleteExcelData = (schoolId) => {
  console.log("🗑️ deleteExcelData for schoolId:", schoolId);
  return api.delete(`/admin/delete-excel/${schoolId}`);
};

// Delete entire school (school, Excel, photos, teachers)
export const deleteSchool = (schoolId) => {
  console.log("🗑️ deleteSchool for schoolId:", schoolId);
  return api.delete(`/admin/delete-school/${schoolId}`);
};

// Check if backend endpoints exist
export const checkBackendEndpoints = async () => {
  const endpoints = [
    '/admin/upload-excel',
    '/admin/schools',
    '/admin/school',
    '/admin/view-classes',
    '/admin/school-data',
    '/admin/download-excel',
    '/admin/download-photos',
    '/admin/crop-photo',
    '/admin/delete-photos',
    '/admin/delete-excel',
    '/admin/notifications'
  ];
  
  console.log("🔍 Checking backend endpoints...");
  
  for (const endpoint of endpoints) {
    try {
      const response = await api.options(endpoint);
      console.log(`✅ ${endpoint}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.response?.status || 'No response'}`);
    }
  }
};

// Get admin notifications
export const getAdminNotifications = () => {
  return api.get("/admin/notifications");
};

// Mark notification as read
export const markNotificationAsRead = (notificationId) => {
  return api.post(`/admin/notifications/${notificationId}/read`);
};


