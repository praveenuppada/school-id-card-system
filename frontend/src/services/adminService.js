import axios from 'axios'

// Get all schools
export const getSchools = () => axios.get("/api/admin/schools")

// Create new school
export const createSchool = (schoolData) => axios.post("/api/admin/school", schoolData)

// Get school data (students, photos, etc.)
export const getSchoolData = (schoolId) => axios.get(`/api/admin/school-data/${schoolId}`)

// Download Excel data for a school
export const downloadExcel = (schoolName) => {
  return axios.get(`/api/admin/download-excel/${encodeURIComponent(schoolName)}`, {
    responseType: 'blob'
  })
}

// Download photos as ZIP for a school
export const downloadPhotos = (schoolName) => {
  return axios.get(`/api/admin/download-photos/${encodeURIComponent(schoolName)}`, {
    responseType: 'blob'
  })
}

// Download single photo
export const downloadSinglePhoto = (photoUrl, fileName) => {
  return axios.get(photoUrl, {
    responseType: 'blob'
  })
}

// Crop and upload photo
export const cropPhoto = (formData) => {
  return axios.post('/api/admin/crop-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// Delete entire school (school, students, photos, teachers)
export const deleteSchool = (schoolId) => axios.delete(`/api/admin/delete-school/${schoolId}`)

// Delete only Excel data for a school
export const deleteExcelData = (schoolId) => axios.delete(`/api/admin/delete-excel/${schoolId}`)

// Delete only photos for a school
export const deletePhotos = (schoolId) => axios.delete(`/api/admin/delete-photos/${schoolId}`)

// Upload Excel file
export const uploadExcel = (formData) => {
  return axios.post('/api/admin/upload-excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

