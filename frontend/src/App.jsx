import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext.jsx"
import WelcomePage from "./pages/WelcomePage.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import AdminDashboard from "./pages/AdminDashboard.jsx"
import TeacherDashboard from "./pages/TeacherDashboard.jsx"
import RegisterSchool from "./pages/RegisterSchool.jsx"
import UploadExcel from "./pages/UploadExcel.jsx"
import ViewSchools from "./pages/ViewSchools.jsx"
import TeacherInstructions from "./pages/TeacherInstructions.jsx"
import TeacherContact from "./pages/TeacherContact.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import ErrorBoundary from "./components/ErrorBoundary.jsx"
import { isMobile } from "./utils/mobileDetection"

// 404 Page component
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-gray-600 mb-8">Page not found</p>
      <a href="/" className="text-blue-600 hover:text-blue-700">
        Go back home
      </a>
    </div>
  </div>
)

function App() {
  // Mobile-specific route handling
  React.useEffect(() => {
    console.log("🔍 App component mounted")
    console.log("📱 Mobile detection result:", isMobile())
    console.log("🌐 Current pathname:", window.location.pathname)
    console.log("🌐 Current href:", window.location.href)
    
    if (isMobile()) {
      console.log("📱 Mobile device detected")
      console.log("🌐 Current pathname:", window.location.pathname)
      
      // Handle mobile routing for protected routes
      const path = window.location.pathname
      if (path === "/admin" || path.startsWith("/admin/")) {
        console.log("📱 Mobile admin route detected")
        // Check if user is authenticated
        const token = localStorage.getItem("token")
        const user = localStorage.getItem("user")
        
        if (!token || !user) {
          console.log("📱 No auth found, redirecting to login")
          window.location.href = "/login"
          return
        }
        
        try {
          const userData = JSON.parse(user)
          if (userData.role !== "ROLE_ADMIN") {
            console.log("📱 Not admin, redirecting to home")
            window.location.href = "/"
            return
          }
        } catch (error) {
          console.log("📱 Error parsing user data, redirecting to login")
          window.location.href = "/login"
          return
        }
      }
      
      if (path === "/teacher" || path.startsWith("/teacher/")) {
        console.log("📱 Mobile teacher route detected")
        // Check if user is authenticated
        const token = localStorage.getItem("token")
        const user = localStorage.getItem("user")
        
        if (!token || !user) {
          console.log("📱 No auth found, redirecting to login")
          window.location.href = "/login"
          return
        }
        
        try {
          const userData = JSON.parse(user)
          if (userData.role !== "ROLE_TEACHER") {
            console.log("📱 Not teacher, redirecting to home")
            window.location.href = "/"
            return
          }
        } catch (error) {
          console.log("📱 Error parsing user data, redirecting to login")
          window.location.href = "/login"
          return
        }
      }
    }
  }, [])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login-teacher" element={<LoginPage role="teacher" />} />
            <Route path="/login-admin" element={<LoginPage role="admin" />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/schools"
              element={
                <ProtectedRoute role="admin">
                  <RegisterSchool />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/excel"
              element={
                <ProtectedRoute role="admin">
                  <UploadExcel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/view-schools"
              element={
                <ProtectedRoute role="admin">
                  <ViewSchools />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher"
              element={
                <ProtectedRoute role="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/instructions"
              element={
                <ProtectedRoute role="teacher">
                  <TeacherInstructions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/contact"
              element={
                <ProtectedRoute role="teacher">
                  <TeacherContact />
                </ProtectedRoute>
              }
            />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
