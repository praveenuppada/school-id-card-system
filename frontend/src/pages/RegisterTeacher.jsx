import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerSchool } from "../services/adminService";
import { AuthContext } from "../context/AuthContext";
import SuccessModal from "../components/SuccessModal";
import { clearUserData } from "../utils/storage";
import Sidebar from "../components/Sidebar";

export default function RegisterSchool() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    schoolName: ""
  });
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({});

  useEffect(() => {
    // Check if user is authenticated as ADMIN
    const userRole = localStorage.getItem('role');
    if (!token || userRole !== 'ADMIN') {
      console.log("❌ Not authenticated as ADMIN:", { token: !!token, userRole });
      alert("Access denied. Admin privileges required.");
      navigate("/login-admin");
      return;
    }
    console.log("✅ Authenticated as ADMIN:", { token: !!token, userRole });
  }, [token, navigate]);

  const validateForm = () => {
    if (!form.username.trim()) {
      alert("Username is required");
      return false;
    }
    if (!form.password.trim()) {
      alert("Password is required");
      return false;
    }
    if (!form.confirmPassword.trim()) {
      alert("Confirm password is required");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return false;
    }
    if (!form.schoolName.trim()) {
      alert("School name is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log("🔐 Registering school with data:", form);
      
      const response = await registerSchool(form);
      console.log("✅ School registration successful:", response);
      
      // Show success modal
      setSuccessData({
        title: "School Registered Successfully! 🏫",
        message: `School "${form.schoolName}" has been registered with username "${form.username}". The teacher can now login and start managing student data.`
      });
      setShowSuccessModal(true);
      
      setForm({
        username: "",
        password: "",
        confirmPassword: "",
        schoolName: ""
      });
    } catch (error) {
      console.error("❌ School registration failed:", error);
      console.error("❌ Error response:", error.response);
      alert(error.response?.data?.message || "Failed to register school");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      <Sidebar role="ADMIN" />
      
      {/* Main Content Container - Proper layout */}
      <div className="flex-1 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 md:pt-6 pt-16 overflow-x-hidden">
          
          {/* Header Section - Compact and professional */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">Register School</h1>
            <p className="text-sm text-gray-500">Create a new school with teacher credentials</p>
          </div>
          
          <div className="max-w-2xl">
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Name *
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    value={form.schoolName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Enter school name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Enter password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Confirm password"
                  />
                </div>


              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registering...
                    </span>
                  ) : (
                    "🏫 Register School"
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate("/admin")}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate("/admin")}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                ← Back to Admin Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
      
    {/* Success Modal */}
    <SuccessModal
      isOpen={showSuccessModal}
      onClose={() => setShowSuccessModal(false)}
      title={successData.title}
      message={successData.message}
      onConfirm={() => {
        setShowSuccessModal(false);
        navigate("/admin");
      }}
    />
  </div>
);
}
