import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()

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
    return <Navigate to="/login" replace />
  }

  if (role) {
    const expectedRole = role === "admin" ? "ROLE_ADMIN" : "ROLE_TEACHER"
    if (user.role !== expectedRole) {
      console.log("🚫 Role mismatch:", { userRole: user.role, expectedRole, role })
      return <Navigate to="/" replace />
    }
  }

  return children
}

export default ProtectedRoute
