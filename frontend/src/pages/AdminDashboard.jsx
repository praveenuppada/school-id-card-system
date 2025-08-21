import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Users, School, FileSpreadsheet } from "lucide-react"
import Sidebar from "../components/Sidebar.jsx"
import { getSchools } from "../services/adminService"

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalSchools: 0, totalClasses: 0, totalStudents: 0 })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const schoolsRes = await getSchools()
      // The response structure is: { schools: [...], success: true }
      const schoolsData = schoolsRes.data?.schools || []
      setSchools(schoolsData)
      
      // Calculate stats from schools data
      const totalSchools = schoolsData.length || 0
      const totalClasses = 5 // Default value for now
      const totalStudents = 155 // Default value for now
      
      setStats({ totalSchools, totalClasses, totalStudents })
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }



  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
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
                  <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-xs text-gray-500">Welcome, {user?.name}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <School className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Schools</p>
                <p className="text-2xl font-bold text-gray-900">{schools.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClasses || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents || 0}</p>
              </div>
            </div>
          </div>
        </div>


      </div>
      </div>
    </div>
  )
}

export default AdminDashboard
