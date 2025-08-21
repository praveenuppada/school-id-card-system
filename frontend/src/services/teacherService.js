import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://web-production-6c52b.up.railway.app"

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL

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
    return axios.get(`/api/teacher/students?className=${encodeURIComponent(className)}`)
  } else {
    return axios.get("/api/teacher/students")
  }
}
export const getStudentsByClass = (className) => axios.get(`/api/teacher/students/class/${className}`)
export const getAllStudents = () => axios.get("/api/teacher/students")
export const getStudentsBySchool = (schoolId) => axios.get(`/api/admin/students/school/${schoolId}`)
export const getClasses = () => axios.get("/api/teacher/classes")

// Photo Upload
export const uploadPhoto = (formData) => {
  return axios.post("/api/teacher/upload-photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 180000, // 3 minutes
  })
}

// Photo Management
export const deletePhoto = (studentId) => axios.delete(`/api/teacher/photos/${studentId}`)
export const updatePhoto = (studentId, photoData) => axios.put(`/api/teacher/photos/${studentId}`, photoData)

// School Info
export const getSchoolInfo = () => axios.get("/api/teacher/school-info")

// Stats
export const getTeacherStats = () => axios.get("/api/teacher/stats")
