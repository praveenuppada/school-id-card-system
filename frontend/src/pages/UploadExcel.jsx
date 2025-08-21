import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FileSpreadsheet, Upload, ArrowLeft, Download, Trash2 } from "lucide-react"
import { getSchools, uploadExcel } from "../services/adminService"
import * as XLSX from 'xlsx'

const UploadExcel = () => {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedSchool, setSelectedSchool] = useState("")
  const [schools, setSchools] = useState([])
  const [excelData, setExcelData] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Fetch schools on component mount
  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      const response = await getSchools()
      const schoolsData = response.data?.schools || []
      setSchools(schoolsData)
      if (schoolsData.length > 0) {
        setSelectedSchool(schoolsData[0]._id)
      }
    } catch (error) {

      setError("Failed to fetch schools")
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      setError("")
      setSuccess("")
      readExcelFile(file)
    }
  }

  const readExcelFile = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        
        const allData = []
        
        // Process each sheet
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          
          // Skip header row and process data
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i]
            if (row[0] && row[1]) { // Check if photoId and fullName exist
              allData.push({
                photoId: String(row[0]).trim(),
                fullName: String(row[1]).trim(),
                className: sheetName,
                sheetName: sheetName
              })
            }
          }
        })
        
        setExcelData(allData)
      } catch (error) {
  
        setError("Failed to read Excel file. Please check the file format.")
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedSchool) {
      setError("Please select both a file and a school")
      return
    }

    setUploading(true)
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('schoolId', selectedSchool)

      const response = await uploadExcel(formData)
      
      setSuccess(`Excel uploaded successfully! ${response.data.totalStudents} students added.`)
      setSelectedFile(null)
      setExcelData([])
      
      // Reset file input
      const fileInput = document.getElementById('file-input')
      if (fileInput) fileInput.value = ''
      
    } catch (error) {

      setError(error.response?.data?.message || "Failed to upload Excel file")
    } finally {
      setUploading(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  const selectedSchoolData = schools.find(school => school._id === selectedSchool)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <h1 className="text-xl font-bold text-gray-900">Upload Excel</h1>
                <p className="text-xs text-gray-500">Upload student data from Excel files.</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <FileSpreadsheet className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Upload Student Data</h2>
          </div>

          {/* School Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select School
            </label>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a school</option>
              {schools.map((school) => (
                <option key={school._id} value={school._id}>
                  {school.name || school.schoolName || school.username || 'Unknown School'}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Excel File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drag & Drop your Excel file here
                </p>
                <p className="text-sm text-gray-600">
                  or click to browse files
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: .xlsx, .xls
                </p>
              </label>
            </div>
            {selectedFile && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Selected file:</strong> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              </div>
            )}
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {/* Upload Button */}
          <div className="mb-6">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || !selectedSchool || uploading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>Upload Excel</span>
                </>
              )}
            </button>
          </div>

          {/* Data Preview */}
          {excelData.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Data Preview ({excelData.length} students)
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Photo ID</th>
                      <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Full Name</th>
                      <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Class</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.slice(0, 10).map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 border-b text-sm text-gray-900">{row.photoId}</td>
                        <td className="px-4 py-2 border-b text-sm text-gray-900">{row.fullName}</td>
                        <td className="px-4 py-2 border-b text-sm text-gray-900">{row.className}</td>
                      </tr>
                    ))}
                    {excelData.length > 10 && (
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-sm text-gray-500 text-center">
                          ... and {excelData.length - 10} more students
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Excel file should have columns: Photo ID, Full Name (in that order)</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Each sheet name will be used as the class name for students in that sheet</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>First row should contain headers (Photo ID, Full Name)</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Students will be automatically assigned to the selected school</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadExcel
