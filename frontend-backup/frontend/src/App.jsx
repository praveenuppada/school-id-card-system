import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Welcome from "./pages/Welcome";
import LoginAdmin from "./pages/LoginAdmin";
import LoginTeacher from "./pages/LoginTeacher";
import AdminDashboard from "./pages/AdminDashboard";
import RegisterSchool from "./pages/RegisterTeacher";
import UploadExcel from "./pages/UploadExcel";
import ViewSchools from "./pages/ViewSchools";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherInstructions from "./pages/TeacherInstructions";
import SubmitUpdates from "./pages/SubmitUpdates";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <div className="overflow-x-hidden">
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login-admin" element={<LoginAdmin />} />
          <Route path="/login-teacher" element={<LoginTeacher />} />

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/register-school" element={<RegisterSchool />} />
            <Route path="/admin/register-teacher" element={<RegisterSchool />} />
            <Route path="/admin/upload-excel" element={<UploadExcel />} />
            <Route path="/admin/view-schools" element={<ViewSchools />} />
          </Route>

          {/* Teacher Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["TEACHER"]} />}>
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/teacher/instructions" element={<TeacherInstructions />} />
            <Route path="/teacher/submit-updates" element={<SubmitUpdates />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </div>
  );
}
