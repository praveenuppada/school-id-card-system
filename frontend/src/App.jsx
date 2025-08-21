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

function App() {
  return (
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
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
