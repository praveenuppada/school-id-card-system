import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
                    {/* Mobile Hamburger Menu Button */}
              <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 bg-white rounded-lg shadow-lg border border-gray-200"
                >
                  <div className="w-6 h-6 flex flex-col justify-center items-center">
                    <div className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></div>
                    <div className={`w-5 h-0.5 bg-gray-600 my-1 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
                    <div className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></div>
                  </div>
                </button>
              </div>

              {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMobileMenu}></div>
        )}

              {/* Sidebar */}
        <div className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-100 transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full p-6">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Harsha ID Solutions</h2>
            <div className="w-12 h-1 bg-yellow-400 rounded-full"></div>
          </div>
          
          <nav className="space-y-2 flex-1">
            {role === "ADMIN" && (
              <>
                <Link 
                  to="/admin" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center p-3 rounded-xl transition-colors duration-200 ${
                    location.pathname === '/admin' 
                      ? 'bg-yellow-50 text-yellow-600' 
                      : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-600'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  Dashboard
                </Link>
                <Link 
                  to="/admin/register-teacher" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center p-3 rounded-xl transition-colors duration-200 ${
                    location.pathname === '/admin/register-teacher' 
                      ? 'bg-yellow-50 text-yellow-600' 
                      : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-600'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  Register Teacher
                </Link>
                <Link 
                  to="/admin/upload-excel" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center p-3 rounded-xl transition-colors duration-200 ${
                    location.pathname === '/admin/upload-excel' 
                      ? 'bg-yellow-50 text-yellow-600' 
                      : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-600'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Upload Excel
                </Link>
                <Link 
                  to="/admin/view-schools" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center p-3 rounded-xl transition-colors duration-200 ${
                    location.pathname === '/admin/view-schools' 
                      ? 'bg-yellow-50 text-yellow-600' 
                      : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-600'
                  }`}
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
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center p-3 rounded-xl transition-colors duration-200 ${
                    location.pathname === '/teacher' 
                      ? 'bg-yellow-50 text-yellow-600' 
                      : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-600'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  Dashboard
                </Link>
                <Link 
                  to="/teacher/instructions" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center p-3 rounded-xl transition-colors duration-200 ${
                    location.pathname === '/teacher/instructions' 
                      ? 'bg-yellow-50 text-yellow-600' 
                      : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-600'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Instructions
                </Link>
              </>
            )}
          </nav>
          
                            <div className="pt-6 space-y-3">
                    {/* Call Us Option - Only for Teachers */}
                    {role === "TEACHER" && (
                      <a
                        href="tel:+918977219777"
                        className="w-full flex items-center justify-center p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        Call Us Now +91 8977219777
                      </a>
                    )}
                    
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
      </div>
    </>
  );
}
