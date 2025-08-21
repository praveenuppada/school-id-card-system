import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()

  // Detect mobile browser
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log("🔒 No user found, redirecting to login")
    if (isMobile) {
      // For mobile, use window.location
      window.location.href = "/login"
      return <div>Redirecting to login...</div>
    }
    return <Navigate to="/login" replace />
  }

  if (role) {
    const expectedRole = role === "admin" ? "ROLE_ADMIN" : "ROLE_TEACHER"
    if (user.role !== expectedRole) {
      console.log("🚫 Role mismatch:", { userRole: user.role, expectedRole, role })
      if (isMobile) {
        // For mobile, use window.location
        window.location.href = "/"
        return <div>Redirecting to home...</div>
      }
      return <Navigate to="/" replace />
    }
  }

  return children
}

export default ProtectedRoute
