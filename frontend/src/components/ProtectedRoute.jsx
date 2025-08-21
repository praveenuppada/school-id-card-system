import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
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
