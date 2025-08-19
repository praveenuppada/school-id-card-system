import api from "./api";

export const getProfile = () => api.get("/teacher/profile");

export const getClasses = () => api.get("/teacher/classes");

export const getStudentsByClass = (className) =>
  api.get(`/teacher/students?className=${className}`);

export const uploadPhoto = (photoId, file, studentId = null) => {
  console.log("📸 uploadPhoto called with:", { 
    photoId, 
    photoIdType: typeof photoId,
    studentId,
    fileName: file.name, 
    fileSize: file.size,
    fileType: file.type 
  });
  
  // Validate file before creating FormData
  if (!file || file.size === 0) {
    throw new Error("File is empty or invalid");
  }
  
  const formData = new FormData();
  formData.append("photoId", photoId);
  if (studentId) {
    formData.append("studentId", studentId);
  }
  formData.append("file", file);
  
  // Try both field names to see which one works
  formData.append("photo", file); // Alternative field name
  
  // Verify FormData was created correctly
  console.log("📋 FormData created with file:", formData.has("file"));
  console.log("📋 FormData file size:", file.size);
  
  // Log FormData contents
  console.log("📋 FormData contents:");
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
    } else {
      console.log(`  ${key}: ${value}`);
    }
  }
  
  // Additional validation
  if (!formData.has('file')) {
    throw new Error("File not found in FormData");
  }
  
  const formDataFile = formData.get('file');
  if (!(formDataFile instanceof File)) {
    throw new Error("FormData file is not a File object");
  }
  
  if (formDataFile.size === 0) {
    throw new Error("File size is 0 bytes");
  }
  
  // Check if we have authentication token
  const token = localStorage.getItem('REACT_APP_JWT_STORAGE_KEY');
  console.log("🔐 Auth token present:", !!token);
  console.log("🔐 Token preview:", token ? token.substring(0, 50) + "..." : "No token");
  
  console.log("📤 Sending request to:", "/teacher/upload-photo");
  
  return api.post("/teacher/upload-photo", formData, {
    headers: { 
      // Don't set Content-Type for FormData - let browser set it with boundary
    },
    timeout: 30000, // 30 second timeout
  }).then(response => {
    console.log("✅ uploadPhoto success:", response.data);
    return response;
  }).catch(error => {
    console.error("❌ uploadPhoto API error:", {
      status: error.response?.status,
      data: JSON.stringify(error.response?.data, null, 2),
      message: error.message,
      fullError: JSON.stringify(error, null, 2)
    });
    
    // If we get a 400 but the response contains success data, treat it as success
    if (error.response?.status === 400 && error.response?.data?.success) {
      console.log("✅ Treating 400 as success due to success flag in response");
      return { data: error.response.data };
    }
    
    throw error;
  });
};

// Test function to check if endpoint exists
export const testPhotoUpload = () => {
  console.log("🧪 Testing photo upload endpoint...");
  
  // Create a simple test file
  const testData = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";
  
  return fetch(testData)
    .then(res => res.blob())
    .then(blob => {
      const testFile = new File([blob], "test.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("photoId", "TEST001");
      formData.append("file", testFile);
      
      return api.post("/teacher/upload-photo", formData, {
        headers: { 
          // Don't set Content-Type for FormData - let browser set it with boundary
        },
        timeout: 30000, // 30 second timeout
      });
    })
    .then(response => {
      console.log("✅ Test upload successful:", response.data);
      return response;
    })
    .catch(error => {
      console.error("❌ Test upload failed:", error.response?.data || error.message);
      throw error;
    });
};

export const submitUpdates = () => {
  return api.post("/teacher/send-updated", {}, {
    headers: { "Content-Type": "application/json" },
  });
};

// Submit all records to admin
export const submitAllRecords = () => {
  return api.post("/teacher/submit-all-records");
};

// Send notification to admin
export const sendNotificationToAdmin = (title, message, type) => {
  return api.post("/teacher/notify-admin", {
    title,
    message,
    type
  });
};
