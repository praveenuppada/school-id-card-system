// Placeholder for Sidebar.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="w-64 bg-white min-h-screen p-6 border-r border-gray-100 shadow-sm">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Harsha ID Solutions</h2>
        <div className="w-12 h-1 bg-yellow-400 rounded-full"></div>
      </div>
      
      <nav className="space-y-2">
        {role === "ADMIN" && (
          <>
            <Link 
              to="/admin" 
              className="flex items-center p-3 rounded-xl text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Dashboard
            </Link>
            <Link 
              to="/admin/register-teacher" 
              className="flex items-center p-3 rounded-xl text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Register Teacher
            </Link>
            <Link 
              to="/admin/upload-excel" 
              className="flex items-center p-3 rounded-xl text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Upload Excel
            </Link>
            <Link 
              to="/admin/view-schools" 
              className="flex items-center p-3 rounded-xl text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
              View Schools
            </Link>
          </>
        )}
        {role === "TEACHER" && (
          <>
            <Link 
              to="/teacher" 
              className="flex items-center p-3 rounded-xl text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Dashboard
            </Link>

          </>
        )}
      </nav>
      
      <div className="mt-auto pt-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}
