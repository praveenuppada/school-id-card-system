import axios from "axios"

// Use the baseURL already configured in AuthContext

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Students
export const getStudents = (className = null) => {
  if (className) {
    return axios.get(`/teacher/students?className=${encodeURIComponent(className)}`)
  } else {
    return axios.get("/teacher/students")
  }
}
export const getStudentsByClass = (className) => axios.get(`/teacher/students/class/${className}`)
export const getAllStudents = () => axios.get("/teacher/students")
export const getStudentsBySchool = (schoolId) => axios.get(`/admin/students/school/${schoolId}`)
export const getClasses = () => axios.get("/teacher/classes")

// Optimized Photo Upload for Concurrent Uploads
export const uploadPhoto = async (formData, retryCount = 0) => {
  const maxRetries = 2
  const baseTimeout = 15000 // 15 seconds for high quality uploads
  
  try {
    const response = await axios.post("/teacher/upload-photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: baseTimeout + (retryCount * 3000), // Increase timeout for retries
      // Optimize for concurrent uploads
      maxRedirects: 0,
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors
    })
    
    return response
  } catch (error) {
    // Retry logic for network errors or timeouts
    if (retryCount < maxRetries && (
      error.code === 'ECONNABORTED' || 
      error.code === 'NETWORK_ERROR' ||
      error.message.includes('timeout') ||
      error.response?.status >= 500
    )) {
      console.log(`🔄 Retrying upload (attempt ${retryCount + 1}/${maxRetries})`)
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))) // Exponential backoff
      return uploadPhoto(formData, retryCount + 1)
    }
    
    throw error
  }
}

// Batch Upload for Multiple Photos (for future use)
export const uploadMultiplePhotos = async (photosData) => {
  const uploadPromises = photosData.map(({ formData, studentId }) => 
    uploadPhoto(formData).catch(error => ({
      studentId,
      error: error.message,
      success: false
    }))
  )
  
  return Promise.allSettled(uploadPromises)
}

// Photo Management
export const deletePhoto = (studentId) => axios.delete(`/teacher/photos/${studentId}`)
export const updatePhoto = (studentId, photoData) => axios.put(`/teacher/photos/${studentId}`, photoData)

// School Info
export const getSchoolInfo = () => axios.get("/teacher/school-info")

// Stats
export const getTeacherStats = () => axios.get("/teacher/stats")
