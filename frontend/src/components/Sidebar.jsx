import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { 
  Home, 
  School, 
  Users, 
  FileSpreadsheet, 
  Settings, 
  LogOut,
  UserPlus,
  ImageIcon,
  Phone
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

const Sidebar = () => {
  const location = useLocation()
  const { logout, user } = useAuth()

  const isActive = (path) => location.pathname === path

  const adminMenuItems = [
    { path: "/admin", icon: Home, label: "Dashboard" },
    { path: "/admin/schools", icon: School, label: "Register School" },
    { path: "/admin/excel", icon: FileSpreadsheet, label: "Upload Excel" },
    { path: "/admin/view-schools", icon: Users, label: "View Schools" },
  ]

  const teacherMenuItems = [
    { path: "/teacher", icon: Home, label: "Teacher Dashboard" },
    { path: "/teacher/instructions", icon: FileSpreadsheet, label: "Instructions" },
  ]

  const menuItems = user?.role === "ROLE_ADMIN" ? adminMenuItems : teacherMenuItems

  return (
    <div className="bg-white shadow-lg w-64 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">H</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">School ID System</h2>
            <p className="text-xs text-gray-500">{user?.role === "ROLE_ADMIN" ? "Admin" : "Teacher"}</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
          
          {/* Call Us Button for Teachers */}
          {user?.role === "ROLE_TEACHER" && (
            <a
              href="tel:+918977219777"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-green-600 hover:bg-green-50 hover:text-green-700"
            >
              <Phone className="h-5 w-5" />
              <span className="font-medium">Call Us</span>
            </a>
          )}
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
