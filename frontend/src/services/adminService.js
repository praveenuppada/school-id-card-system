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
  // If the URL contains Cloudinary, add quality parameter for high quality
  let downloadUrl = photoUrl;
  if (photoUrl.includes('cloudinary.com')) {
    // Add quality parameter for high quality download
    const separator = photoUrl.includes('?') ? '&' : '?';
    downloadUrl = `${photoUrl}${separator}quality=auto:best&fetch_format=auto`;
  }
  
  return axios.get(downloadUrl, {
    responseType: 'blob',
    headers: {
      'Accept': 'image/jpeg,image/png,image/*'
    }
  })
}

// Crop and upload photo (high quality, optimized)
export const cropPhoto = (formData, onProgress) => {
  return axios.post('/admin/crop-photo?quality=high&optimize=true', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 3000, // 3 second timeout for ultra-fast processing
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)

      onProgress && onProgress(percentCompleted)
    }
  })
}

// Delete entire school (school, students, photos, teachers)
export const deleteSchool = (schoolId) => axios.delete(`/admin/delete-school/${schoolId}`)

// Delete only Excel data for a school
export const deleteExcelData = (schoolId) => axios.delete(`/admin/delete-excel/${schoolId}`)

// Delete only photos for a school
export const deletePhotos = (schoolId) => axios.delete(`/admin/delete-photos/${schoolId}`)

// Delete single photo for a student
export const deleteSinglePhoto = async (studentId, photoId) => {
  try {
    // Try the primary endpoint first
    return await axios.delete(`/admin/delete-photo/${studentId}/${photoId}`)
  } catch (error) {
    // If the primary endpoint fails, try the alternative endpoint
    if (error.response?.status === 404) {
      console.log('Primary endpoint failed, trying alternative endpoint')
      return await axios.delete(`/admin/delete-photo-by-id/${photoId}`)
    }
    throw error
  }
}

// Upload Excel file
export const uploadExcel = (formData) => {
  return axios.post('/admin/upload-excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

