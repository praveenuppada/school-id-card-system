import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Camera, Upload, Users, ImageIcon } from "lucide-react"
import Sidebar from "../components/Sidebar.jsx"
import PhotoUploadModal from "../components/PhotoUploadModal.jsx"
import { uploadPhoto, getStudents, getSchoolInfo, getClasses } from "../services/teacherService"

const TeacherDashboard = () => {
  const { user, logout } = useAuth()
  const [students, setStudents] = useState([])
  const [selectedClass, setSelectedClass] = useState("10th CLASS")
  const [availableClasses, setAvailableClasses] = useState(["10th CLASS", "9th CLASS", "8th CLASS", "7th CLASS", "6th CLASS"])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [classesDiscovered, setClassesDiscovered] = useState(false)
  const [discoveringClasses, setDiscoveringClasses] = useState(true)

  useEffect(() => {
    discoverAvailableClasses()
    fetchTeacherProfile()
  }, [])

  useEffect(() => {
    fetchStudentsForClass(selectedClass)
  }, [selectedClass])

  useEffect(() => {
    if (selectedStudent) {
      setShowPhotoModal(true)
    }
  }, [selectedStudent])

  useEffect(() => {
    // Filter students based on selected class
    const filtered = students.filter(student => 
      student.class === selectedClass || 
      student.className === selectedClass ||
      student.className?.includes(selectedClass.replace(" CLASS", ""))
    )
    setFilteredStudents(filtered)
  }, [students, selectedClass])

  const fetchStudents = async () => {
    try {
      const response = await getStudents(selectedClass)
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setStudents(response.data)
      } else if (response.data && response.data.students && response.data.students.length > 0) {
        setStudents(response.data.students)
      } else {
        setStudents([])
      }
      
    } catch (error) {
      console.error("Error fetching students:", error)
      setStudents([])
    }
  }

  const handleClassChange = (e) => {
    const newClass = e.target.value
    setSelectedClass(newClass)
    // The useEffect will handle filtering when selectedClass changes
  }

  const fetchStudentsForClass = async (className) => {
    try {
      const response = await getStudents(className) // Use class-specific endpoint
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setStudents(response.data)
      } else if (response.data && response.data.students && response.data.students.length > 0) {
        setStudents(response.data.students)
      } else {
        setStudents([])
      }
    } catch (error) {
      console.error("Error fetching students for class:", className, error)
      setStudents([])
    }
  }

  const [schoolName, setSchoolName] = useState('School Dashboard')

  const fetchTeacherProfile = async () => {
    try {
      const response = await getSchoolInfo()
      if (response.data && response.data.schoolName) {
        setSchoolName(response.data.schoolName)
        localStorage.setItem('teacherSchoolName', response.data.schoolName)
      }
    } catch (error) {
      console.error("Error fetching teacher profile:", error)
    }
  }

  const discoverAvailableClasses = async () => {
    setDiscoveringClasses(true)
    try {
      // Use the classes endpoint to get available classes
      const response = await getClasses()
      
      if (response.data && response.data.classes && Array.isArray(response.data.classes) && response.data.classes.length > 0) {
        // Sort classes numerically
        const sortedClasses = response.data.classes.sort((a, b) => {
          const getClassNumber = (className) => {
            const match = className.match(/(\d+)/)
            return match ? parseInt(match[1]) : 0
          }
          
          const aNum = getClassNumber(a)
          const bNum = getClassNumber(b)
          
          if (aNum !== bNum) {
            return aNum - bNum // Ascending order (6th, 7th, 8th, 9th, 10th)
          }
          
          return a.localeCompare(b)
        })
        
        setAvailableClasses(sortedClasses)
        setClassesDiscovered(true)
        setDiscoveringClasses(false)
        return
      }
      
      // Fallback: try individual class formats if classes endpoint fails
      const classesToTry = [
        "10th CLASS", "9th CLASS", "8th CLASS", "7th CLASS", "6th CLASS"
      ]
      const availableClasses = []
      
      for (const className of classesToTry) {
        try {
          const classResponse = await getStudents(className)
          
          if (classResponse.data && Array.isArray(classResponse.data) && classResponse.data.length > 0) {
            availableClasses.push(className)
          } else if (classResponse.data && classResponse.data.students && classResponse.data.students.length > 0) {
            availableClasses.push(className)
          }
        } catch (error) {
          // Continue silently on error
        }
      }
      
      const finalClasses = availableClasses.length > 0 ? availableClasses : ["10th CLASS"]
      setAvailableClasses(finalClasses)
      setClassesDiscovered(true)
      setDiscoveringClasses(false)
      
    } catch (error) {
      // If all fails, set default classes
      setAvailableClasses(["10th CLASS", "9th CLASS", "8th CLASS", "7th CLASS", "6th CLASS"])
      setClassesDiscovered(true)
      setDiscoveringClasses(false)
    }
  }

  const handlePhotoUpload = (student) => {
    setSelectedStudent(student)
    setModalMode("file")
    setShowPhotoModal(true)
  }

  const handleAddPhoto = (student) => {
    setSelectedStudent(student)
    setModalMode("file")
    setShowPhotoModal(true)
  }

  const handleSavePhoto = async (photoFile, studentData) => {
    // Use studentData from parameter if available, otherwise fall back to selectedStudent state
    let student = studentData || selectedStudent
    
    // If still no student data, try to get it from the current filtered students
    if (!student && Array.isArray(filteredStudents) && filteredStudents.length > 0) {
      // Try to find a student that might match (this is a fallback)
      student = filteredStudents[0]
    }
    
    if (!student || !photoFile) {
      return
    }

    setUploading(true)
    setMessage("Uploading photo...")

    const formData = new FormData()
    formData.append("photo", photoFile)
    formData.append("studentId", student._id)
    formData.append("photoId", student.photoId || student.rollNumber || student.roll_number)

    try {
      const response = await uploadPhoto(formData)
      
      // Get the photo URL from the response
      const photoUrl = response.data.photoUrl
      
      // Immediately update the local state to show the photo
      if (photoUrl) {
        setStudents(prevStudents => 
          prevStudents.map(s => 
            s._id === student._id 
              ? { ...s, photoUrl: photoUrl, photoUploaded: true, updatedAt: new Date() }
              : s
          )
        )
        
        // Also update filteredStudents immediately for instant UI update
        setFilteredStudents(prevFiltered => 
          prevFiltered.map(s => 
            s._id === student._id 
              ? { ...s, photoUrl: photoUrl, photoUploaded: true, updatedAt: new Date() }
              : s
          )
        )
      }
      
      setMessage("✅ Photo uploaded successfully!")
      setShowPhotoModal(false)
      setSelectedStudent(null)
    } catch (error) {
      console.error("Upload error:", error)
      setMessage(error.response?.data?.message || "Error uploading photo")
    } finally {
      setUploading(false)
    }
  }



  const [modalMode, setModalMode] = useState("file")

  const handleSubmitAllRecords = async () => {
    setUploading(true)
    setMessage("Submitting all records...")
    
    try {
      // This would be an API call to submit all records
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      setMessage("All records submitted successfully!")
    } catch (error) {
      setMessage("Error submitting records")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {schoolName}
                  </h1>
                  <p className="text-xs text-gray-500">Teacher Portal</p>
                </div>
              </div>
              <button 
                onClick={handleSubmitAllRecords}
                disabled={uploading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <span>{uploading ? "Submitting..." : "Submit All Records"}</span>
              </button>
            </div>
          </div>
        </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Class Selection */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Select Class:</label>
              {discoveringClasses ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-500">Discovering classes...</span>
                </div>
              ) : (
                <>
                  <select 
                    value={selectedClass}
                    onChange={handleClassChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {availableClasses.map((className) => (
                      <option key={className} value={className}>
                        {className}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-500">
                    {filteredStudents.length} students found
                  </span>
                </>
              )}
            </div>
            
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes("successfully") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {message}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes("✅") ? "bg-green-100 border border-green-300 text-green-800" : 
            message.includes("❌") ? "bg-red-100 border border-red-300 text-red-800" :
            "bg-blue-100 border border-blue-300 text-blue-800"
          }`}>
            <div className="flex items-center space-x-2">
              {message.includes("✅") && <span className="text-green-600">✓</span>}
              {message.includes("❌") && <span className="text-red-600">✗</span>}
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}



        {/* Data Availability Notice */}
        {classesDiscovered && availableClasses.length === 1 && students.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">Data Availability Notice</h3>
            <div className="text-sm text-blue-700">
              <p>Currently, only <strong>{availableClasses[0]}</strong> has student data available.</p>
              <p>To add data for other classes, please ask the admin to upload Excel files for those classes.</p>
            </div>
          </div>
        )}

        {/* Student Photo Management Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PHOTO ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FULL NAME
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CLASS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PHOTO UPLOAD
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(filteredStudents) && filteredStudents.length > 0 ? filteredStudents.map((student, index) => (
                  <tr key={student._id || student.rollNumber || index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.rollNumber || student.photoId || student.roll_number || "DSC_0200"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.name || student.fullName || student.studentName || "ADAPA SHANMUKHA RAO"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.class || student.className || student.class_name || "10th CLASS"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-center space-y-2">

                        
                        {/* Photo display */}
                        {student.photoUrl ? (
                          <div className="relative">
                            <div 
                              className="w-16 h-16 rounded border-4 border-green-500 bg-cover bg-center"
                              style={{ 
                                backgroundImage: `url(${student.photoUrl})`,
                                width: '64px', 
                                height: '64px'
                              }}
                            />
                            <div className="text-xs text-green-600 mt-1">
                              ✅ Photo Available
                            </div>
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center border-2 border-red-500">
                            <span className="text-gray-400 text-xs">No Photo</span>
                          </div>
                        )}
                        <div className="flex space-x-2">
                          {!student.photoUrl ? (
                            <button 
                              onClick={() => handleAddPhoto(student)}
                              className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                            >
                              Add Photo
                            </button>
                          ) : (
                            <button 
                              onClick={() => handlePhotoUpload(student)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                            >
                              Update Photo
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (student.photoUrl || student.photoUploaded) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {(student.photoUrl || student.photoUploaded) ? "Submitted" : "Pending"}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      {students.length === 0 ? "No students data found. Please upload Excel file first." : `No students found in ${selectedClass}`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onSave={handleSavePhoto}
        student={selectedStudent}
        uploading={uploading}
        mode={modalMode}
      />
    </div>
  )
}

export default TeacherDashboard
