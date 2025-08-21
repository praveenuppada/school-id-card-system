import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { School, Download, Package, Trash2, FileText, Edit, Camera, ArrowLeft, Crop, Download as DownloadIcon } from "lucide-react"
import { getSchools, getSchoolData, downloadExcel, downloadPhotos, deleteSchool, downloadSinglePhoto, deleteSinglePhoto } from "../services/adminService"
import PhotoCropModal from "../components/PhotoCropModal"

const ViewSchools = () => {
  const navigate = useNavigate()
  const [schools, setSchools] = useState([])
  const [selectedSchool, setSelectedSchool] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [schoolData, setSchoolData] = useState(null)
  const [dataLoading, setDataLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("All Classes")
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  useEffect(() => {
    fetchSchools()
  }, [])

  useEffect(() => {
    if (selectedSchool) {
      fetchSchoolData()
    }
  }, [selectedSchool])

  const fetchSchools = async () => {
    try {
      const response = await getSchools()
      const schoolsData = response.data?.schools || []
      setSchools(schoolsData)
      if (schoolsData.length > 0) {
        setSelectedSchool(schoolsData[0]._id)
      }
    } catch (error) {

      setSchools([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSchoolData = async () => {
    if (!selectedSchool) return
    
    setDataLoading(true)
    try {
      const response = await getSchoolData(selectedSchool)
      setSchoolData(response.data?.data || null)
    } catch (error) {

      setSchoolData(null)
    } finally {
      setDataLoading(false)
    }
  }

  const selectedSchoolData = Array.isArray(schools) ? schools.find(school => school._id === selectedSchool) : null

  const handleBack = () => {
    navigate(-1)
  }

  const handleDownloadExcel = async () => {
    if (selectedSchoolData) {
      try {
        const response = await downloadExcel(selectedSchoolData.name || selectedSchoolData.schoolName || selectedSchoolData.username)
        
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${selectedSchoolData.name || selectedSchoolData.schoolName || selectedSchoolData.username}_students.xlsx`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        
        alert('Excel file downloaded successfully!')
      } catch (error) {
  
        alert('Failed to download Excel file. Please try again.')
      }
    }
  }

  const handleDownloadPhotos = async () => {
    if (selectedSchoolData) {
      try {
        const response = await downloadPhotos(selectedSchoolData.name || selectedSchoolData.schoolName || selectedSchoolData.username)
        
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${selectedSchoolData.name || selectedSchoolData.schoolName || selectedSchoolData.username}_photos.zip`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        
        alert('Photos ZIP file downloaded successfully!')
      } catch (error) {
  
        alert('Failed to download photos. Please try again.')
      }
    }
  }

  const handleDeleteSchool = async () => {
    if (selectedSchoolData) {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete ${selectedSchoolData.name || selectedSchoolData.schoolName || selectedSchoolData.username}? This will delete ALL data including students, photos, and teacher accounts. This action cannot be undone.`
      )
      if (confirmDelete) {
        try {
          await deleteSchool(selectedSchool)
          alert(`School ${selectedSchoolData.name || selectedSchoolData.schoolName || selectedSchoolData.username} deleted successfully`)
          // Remove from local state and refresh schools list
          setSchools(schools.filter(school => school._id !== selectedSchool))
          setSelectedSchool("")
          setSchoolData(null)
          await fetchSchools() // Refresh the list
        } catch (error) {
    
          alert('Failed to delete school. Please try again.')
        }
      }
    }
  }

  // Filter students based on search term and selected class
  const getFilteredStudents = (students) => {
    if (!students) return []
    
    let filtered = students
    
    // Filter by class
    if (selectedClass !== "All Classes") {
      filtered = filtered.filter(student => student.className === selectedClass)
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(student => 
        student.fullName?.toLowerCase().includes(term) ||
        student.photoId?.toLowerCase().includes(term) ||
        student.className?.toLowerCase().includes(term)
      )
    }
    
    return filtered
  }

  // Get unique classes from students
  const getUniqueClasses = (students) => {
    if (!students) return []
    return [...new Set(students.map(s => s.className))].sort()
  }

  const handleCropPhoto = (student) => {
    setSelectedStudent(student)
    setCropModalOpen(true)
  }

  const handleDownloadSinglePhoto = async (student) => {
    try {
      const response = await downloadSinglePhoto(student.photoUrl)
      
      // Create download link with high quality and proper naming
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'image/jpeg' }))
      const link = document.createElement('a')
      link.href = url
      
      // Use photo ID as filename for better organization
      const fileName = student.photoId ? `${student.photoId}.jpg` : `${student.fullName || 'photo'}.jpg`
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      alert('Photo downloaded successfully!')
    } catch (error) {

      alert('Failed to download photo. Please try again.')
    }
  }

  const handlePhotoUpdated = (newPhotoUrl) => {
    // Update the student's photo URL in the local state
    if (schoolData && selectedStudent) {
      const updatedStudents = schoolData.teacherUpdates.map(student => 
        student._id === selectedStudent._id 
          ? { ...student, photoUrl: newPhotoUrl }
          : student
      )
      setSchoolData({
        ...schoolData,
        teacherUpdates: updatedStudents
      })
    }
  }

  const handleDeletePhoto = async (student) => {
    if (!student || !student._id || !student.photoId) {
      alert('Cannot delete photo: Missing student information')
      return
    }

    if (!confirm(`Are you sure you want to delete the photo for ${student.fullName} (${student.photoId})?`)) {
      return
    }

    try {
      await deleteSinglePhoto(student._id, student.photoId)
      
      // Update local state to remove the photo
      if (schoolData) {
        const updatedStudents = schoolData.teacherUpdates.map(s => 
          s._id === student._id 
            ? { ...s, photoUrl: null, photoUploaded: false }
            : s
        )
        setSchoolData({
          ...schoolData,
          teacherUpdates: updatedStudents
        })
      }
      
      alert('Photo deleted successfully!')
    } catch (error) {
      let errorMessage = 'Failed to delete photo. Please try again.'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.status === 404) {
        errorMessage = 'Photo not found or already deleted.'
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to delete this photo.'
      }
      
      alert(errorMessage)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:pl-6 pl-16">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">View Schools</h1>
                <p className="text-xs text-gray-500">Manage and view school data.</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* School Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select School
          </label>
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a school</option>
            {Array.isArray(schools) && schools.map((school) => (
              <option key={school._id} value={school._id}>
                {school.name || school.schoolName || school.username || 'Unknown School'}
              </option>
            ))}
          </select>
        </div>

        {selectedSchoolData && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* School Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedSchoolData.name || selectedSchoolData.schoolName || selectedSchoolData.username || 'Unknown School'}
              </h2>
              {schoolData && (
                <p className="text-gray-600">
                  {schoolData.schoolInfo?.classes?.length || 0} Classes • {schoolData.schoolInfo?.totalStudents || 0} Total Students
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
              <button 
                onClick={handleDownloadExcel}
                disabled={dataLoading || !schoolData}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Download className="h-4 w-4" />
                <span>Download Excel</span>
              </button>
              <button 
                onClick={handleDownloadPhotos}
                disabled={dataLoading || !schoolData}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Package className="h-4 w-4" />
                <span>Download Photos</span>
              </button>
              <button 
                onClick={handleDeleteSchool}
                disabled={dataLoading}
                className="flex items-center justify-center space-x-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete School</span>
              </button>
            </div>

            {/* Loading State */}
            {dataLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading school data...</p>
              </div>
            )}

            {!dataLoading && schoolData && (
              <>
                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="flex flex-wrap gap-2 sm:gap-8">
                    {[
                      { id: "overview", label: "Overview", icon: FileText },
                      { id: "excel", label: "Original Excel Data", icon: FileText },
                      { id: "updates", label: "Teacher Updates", icon: Edit },
                      { id: "photos", label: "Photos", icon: Camera }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-1 sm:space-x-2 py-2 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                          activeTab === tab.id
                            ? "border-yellow-500 text-yellow-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <tab.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Search and Filter */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search:</label>
                    <input
                      type="text"
                      placeholder="Search by name, ID, or class..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="sm:w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class:</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="All Classes">All Classes</option>
                      {getUniqueClasses(schoolData.originalExcel).map((className) => (
                        <option key={className} value={className}>
                          {className}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="mb-6">
                  {activeTab === "overview" && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">School Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">School Information</h4>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p><strong>Name:</strong> {schoolData.schoolInfo?.name}</p>
                            <p><strong>ID:</strong> {schoolData.schoolInfo?.id}</p>
                            <p><strong>Total Students:</strong> {schoolData.schoolInfo?.totalStudents}</p>
                            <p><strong>Classes:</strong> {schoolData.schoolInfo?.classes?.join(', ')}</p>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Photo Statistics</h4>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p><strong>Photos Uploaded:</strong> {schoolData.teacherUpdates?.length || 0}</p>
                            <p><strong>Pending Photos:</strong> {(schoolData.schoolInfo?.totalStudents || 0) - (schoolData.teacherUpdates?.length || 0)}</p>
                            <p><strong>Upload Rate:</strong> {schoolData.schoolInfo?.totalStudents ? Math.round((schoolData.teacherUpdates?.length || 0) / schoolData.schoolInfo.totalStudents * 100) : 0}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === "excel" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Original Excel Data</h3>
                        <span className="text-sm text-gray-600">
                          Total: {getFilteredStudents(schoolData.originalExcel).length} students
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Photo ID</th>
                              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Full Name</th>
                              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Class</th>
                              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Status</th>
                              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Created At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredStudents(schoolData.originalExcel).map((student, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-2 border-b text-sm text-gray-900">{student.photoId}</td>
                                <td className="px-4 py-2 border-b text-sm text-gray-900">{student.fullName}</td>
                                <td className="px-4 py-2 border-b text-sm text-gray-900">{student.className}</td>
                                <td className="px-4 py-2 border-b text-sm">
                                  {student.photoUploaded ? (
                                    <span className="text-green-600">✅ Uploaded</span>
                                  ) : (
                                    <span className="text-red-600">❌ Pending</span>
                                  )}
                                </td>
                                <td className="px-4 py-2 border-b text-sm text-gray-900">
                                  {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === "updates" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Teacher Updates</h3>
                        <span className="text-sm text-gray-600">
                          Total: {getFilteredStudents(schoolData.teacherUpdates).length} updates
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Photo ID</th>
                              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Full Name</th>
                              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Class</th>
                              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Status</th>
                              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Updated By</th>
                              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Updated At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredStudents(schoolData.teacherUpdates).map((student, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-2 border-b text-sm text-gray-900">{student.photoId}</td>
                                <td className="px-4 py-2 border-b text-sm text-gray-900">{student.fullName}</td>
                                <td className="px-4 py-2 border-b text-sm text-gray-900">{student.className}</td>
                                <td className="px-4 py-2 border-b text-sm">
                                  <span className="text-green-600">✅ Uploaded</span>
                                </td>
                                <td className="px-4 py-2 border-b text-sm text-gray-900">{student.updatedBy || '-'}</td>
                                <td className="px-4 py-2 border-b text-sm text-gray-900">
                                  {student.updatedAt ? new Date(student.updatedAt).toLocaleDateString() : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                                     {activeTab === "photos" && (
                     <div>
                       <div className="flex justify-between items-center mb-4">
                         <h3 className="text-lg font-semibold">Student Photos</h3>
                         <span className="text-sm text-gray-600">
                           Total: {getFilteredStudents(schoolData.teacherUpdates).length} photos uploaded
                         </span>
                       </div>
                       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                         {getFilteredStudents(schoolData.teacherUpdates).map((student, index) => (
                           <div key={index} className="bg-gray-100 rounded-lg p-2 text-center">
                             {student.photoUrl ? (
                               <img 
                                 src={`${student.photoUrl}?quality=high`} 
                                 alt={student.fullName}
                                 className="w-16 h-20 object-cover rounded mx-auto mb-2"
                                 style={{ imageRendering: 'high-quality' }}
                                 onError={(e) => {
                                   e.target.style.display = 'none'
                                   e.target.nextSibling.style.display = 'flex'
                                 }}
                               />
                             ) : null}
                             <div 
                               className={`w-16 h-20 bg-gray-300 rounded mx-auto mb-2 flex items-center justify-center ${student.photoUrl ? 'hidden' : ''}`}
                             >
                               <Camera className="h-6 w-6 text-gray-500" />
                             </div>
                             <p className="text-xs text-gray-600 font-medium">{student.fullName}</p>
                             <p className="text-xs text-gray-500">{student.photoId}</p>
                             <p className="text-xs text-gray-500">{student.className}</p>
                             
                             {/* Action buttons */}
                             {student.photoUrl && (
                               <div className="flex space-x-1 mt-2">
                                 <button
                                   onClick={() => handleCropPhoto(student)}
                                   className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                                   title="Crop Photo"
                                 >
                                   <Crop className="h-3 w-3 mx-auto" />
                                 </button>
                                 <button
                                   onClick={() => handleDownloadSinglePhoto(student)}
                                   className="flex-1 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                                   title="Download Photo"
                                 >
                                   <DownloadIcon className="h-3 w-3 mx-auto" />
                                 </button>
                                 <button
                                   onClick={() => handleDeletePhoto(student)}
                                   className="flex-1 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                                   title="Delete Photo"
                                 >
                                   <Trash2 className="h-3 w-3 mx-auto" />
                                 </button>
                               </div>
                             )}
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <School className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600">Total Students</p>
                        <p className="text-2xl font-bold text-blue-900">{schoolData.schoolInfo?.totalStudents || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <Camera className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-600">Photos Uploaded</p>
                        <p className="text-2xl font-bold text-green-900">{schoolData.teacherUpdates?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <School className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-yellow-600">Pending Photos</p>
                        <p className="text-2xl font-bold text-yellow-900">
                          {(schoolData.schoolInfo?.totalStudents || 0) - (schoolData.teacherUpdates?.length || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!dataLoading && !schoolData && (
              <div className="text-center py-8">
                <p className="text-gray-600">No data available for this school.</p>
              </div>
            )}
          </div>
        )}

        {!selectedSchoolData && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schools Found</h3>
            <p className="text-gray-600">No schools have been registered yet.</p>
          </div>
        )}
      </div>

      {/* Photo Crop Modal */}
      <PhotoCropModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        student={selectedStudent}
        onPhotoUpdated={handlePhotoUpdated}
      />
    </div>
  )
}

export default ViewSchools
