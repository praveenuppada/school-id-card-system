import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";


export default function LoginAdmin() {
  const navigate = useNavigate();
  const { login: authLogin } = useContext(AuthContext);
  const { showError, showSuccess } = useNotification();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showError("Login Failed", "All fields are required");
      return;
    }
    try {
      const data = await login(username, password);
      authLogin(data.token, data.roles, data.user);
      showSuccess("Login Successful", "Welcome back!");
      navigate("/admin");
    } catch (err) {
      showError("Login Failed", "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Decorative yellow shape */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 border border-gray-100">
            {/* HARSHA ID SOLUTIONS Text */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-yellow-600 mb-2">HARSHA ID SOLUTIONS</h1>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Admin Login</h1>
            
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
                    onChange={(e) => setUsername(e.target.value)}
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
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-base"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full py-4 bg-yellow-400 text-white font-semibold rounded-xl shadow-lg hover:bg-yellow-500 transition-colors duration-200 text-base"
              >
                Login
              </button>
            </form>
            
            <div className="mt-6 text-center space-y-3">
              
              <button
                onClick={() => navigate("/")}
                className="block w-full text-gray-600 hover:text-yellow-400 transition-colors duration-200"
              >
                Back to Welcome
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}

    </div>
  );
}
