import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerSchool } from "../services/adminService";
import { AuthContext } from "../context/AuthContext";
import SuccessModal from "../components/SuccessModal";
import { clearUserData } from "../utils/storage";

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
    <div className="min-h-screen bg-white">
      {/* Decorative yellow shape */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Register School</h1>
              <p className="text-gray-600">Create a new school with teacher credentials</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-yellow-400 text-white font-semibold rounded-xl shadow-lg hover:bg-yellow-500 transition-colors duration-200 disabled:opacity-50"
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
                  className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
              

            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/admin")}
                className="text-gray-600 hover:text-yellow-400 transition-colors duration-200"
              >
                ← Back to Admin Dashboard
              </button>
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
