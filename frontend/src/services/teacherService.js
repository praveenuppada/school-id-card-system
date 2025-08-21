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

// Photo Upload
export const uploadPhoto = (formData) => {
  return axios.post("/teacher/upload-photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 5000, // 5 seconds for faster uploads
  })
}

// Photo Management
export const deletePhoto = (studentId) => axios.delete(`/teacher/photos/${studentId}`)
export const updatePhoto = (studentId, photoData) => axios.put(`/teacher/photos/${studentId}`, photoData)

// School Info
export const getSchoolInfo = () => axios.get("/teacher/school-info")

// Stats
export const getTeacherStats = () => axios.get("/teacher/stats")
