import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { AuthContext } from "../context/AuthContext";

export default function LoginTeacher() {
  const navigate = useNavigate();
  const { login: authLogin } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showSavePassword, setShowSavePassword] = useState(false);

  // Load saved credentials on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('teacherUsername');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("All fields are required");
      return;
    }
    try {
      console.log("🔐 Teacher login attempt:", { username, password });
      console.log("🌐 API URL:", import.meta.env.VITE_API_URL || 'http://localhost:8081/api');
      const data = await login(username, password);
      console.log("✅ Teacher login successful:", data);
      
      // Show save password prompt on successful login
      setShowSavePassword(true);
      
      authLogin(data.token, data.roles, data.user);
      navigate("/teacher");
    } catch (err) {
      console.error("❌ Teacher login error:", err);
      console.error("❌ Error response:", err.response);
      console.error("❌ Error message:", err.message);
      console.error("❌ Error status:", err.response?.status);
      console.error("❌ Error data:", err.response?.data);
      setError("Invalid credentials");
    }
  };

  const handleSavePassword = () => {
    localStorage.setItem('teacherUsername', username);
    localStorage.setItem('teacherPassword', password);
    setShowSavePassword(false);
    alert("Password saved successfully! Next time you enter your username, the password will be auto-filled.");
  };

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    
    // Check if we have saved credentials for this username
    const savedUsername = localStorage.getItem('teacherUsername');
    const savedPassword = localStorage.getItem('teacherPassword');
    
    if (savedUsername === newUsername && savedPassword) {
      if (confirm("Found saved password for this username. Would you like to auto-fill it?")) {
        setPassword(savedPassword);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ overflowX: 'hidden', maxWidth: '100vw' }}>
      {/* Decorative yellow shape */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
            {/* HARSHA ID SOLUTIONS Text */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-yellow-600 mb-2">HARSHA ID SOLUTIONS</h1>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Teacher Login</h1>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={handleUsernameChange}
                    className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-base"
                  />
                </div>
              </div>
              
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full py-4 bg-yellow-400 text-white font-semibold rounded-xl shadow-lg hover:bg-yellow-500 transition-colors duration-200 text-base"
              >
                Login
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-yellow-400 transition-colors duration-200"
              >
                Back to Welcome
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Password Modal */}
      {showSavePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Save Password?</h3>
            <p className="text-gray-600 mb-6">
              Would you like to save your password for automatic login next time?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleSavePassword}
                className="flex-1 px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Save Password
              </button>
              <button
                onClick={() => setShowSavePassword(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Don't Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
