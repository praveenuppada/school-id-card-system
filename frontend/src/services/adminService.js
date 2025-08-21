import axios from 'axios'

// Get all schools
export const getSchools = () => axios.get("/admin/schools")

// Create new school
export const createSchool = (schoolData) => axios.post("/admin/school", schoolData)

// Get school data (students, photos, etc.)
export const getSchoolData = (schoolId) => axios.get(`/admin/school-data/${schoolId}`)

// Download Excel data for a school
export const downloadExcel = (schoolName) => {
  return axios.get(`/admin/download-excel/${encodeURIComponent(schoolName)}`, {
    responseType: 'blob'
  })
}

// Download photos as ZIP for a school (high quality)
export const downloadPhotos = (schoolName) => {
  return axios.get(`/admin/download-photos/${encodeURIComponent(schoolName)}?quality=high`, {
    responseType: 'blob'
  })
}

// Download single photo (high quality)
export const downloadSinglePhoto = (photoUrl, fileName) => {
  return axios.get(photoUrl, {
    responseType: 'blob',
    headers: {
      'Accept': 'image/jpeg,image/png,image/*'
    }
  })
}

// Crop and upload photo (high quality)
export const cropPhoto = (formData) => {
  return axios.post('/admin/crop-photo?quality=high', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// Delete entire school (school, students, photos, teachers)
export const deleteSchool = (schoolId) => axios.delete(`/admin/delete-school/${schoolId}`)

// Delete only Excel data for a school
export const deleteExcelData = (schoolId) => axios.delete(`/admin/delete-excel/${schoolId}`)

// Delete only photos for a school
export const deletePhotos = (schoolId) => axios.delete(`/admin/delete-photos/${schoolId}`)

// Upload Excel file
export const uploadExcel = (formData) => {
  return axios.post('/admin/upload-excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

