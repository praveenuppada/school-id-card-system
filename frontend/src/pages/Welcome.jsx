import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'about':
        return (
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-800 mb-8">ABOUT US</h2>
            <div className="space-y-6 text-gray-600 leading-relaxed text-left">
              <p className="text-lg">
                Our services begins in 2015, We have been leading ID manufacturers in the three Uttharandhra Districts .i.e., Srikakulam, vizianagaram and Visakhapatnam. We have successfully completed so many projects related to state government and central government including private sectors. We started our bussiness with STUDENT ID CARDS, TIES and BELTS. Within short time, Harsha ID Solutions developed the bussiness to small scale industry.
              </p>
              <p className="text-lg">
                We have been in the bussiness of ID CARDS, TIES, MULTI COLOUR BELTS, REPORT CARDS, DAIRIES, T-SHIRT PRINTING, MUG PRINTING, KEY CHAINS, LOGO BADGES and SCREEN PRINTING for the past 10+ Years catering various sectors i.e., Corporate, Industrial, Banks, Educational Institutions etc. taking on the challenges and fulfilling the customer expectations. The company has been providing solutions on technology, machinery, Raw materials to ID sellers across the state.
              </p>
              
              <div className="bg-yellow-50 p-6 rounded-xl border-l-4 border-yellow-400">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Our Strength:</h3>
                <p className="text-lg">
                  Maintaining good quality, providing latest models with in-time delivery, Committed and skilled manpower, fully automated advanced machinery, assured raw material support, resulting in excelling customer expectations.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-xl text-white">
                <h3 className="text-xl font-bold mb-2">SINGLE LINE ABOUT HARSHA ID SOLUTIONS:</h3>
                <p className="text-lg font-semibold">
                  I STARTED HARSHA ID SOLUTIONS WITH ZERO INVESTMENT. NOW, OUR TURNOVER IS ABOUT 50LAKHS PER ANNUM.
                </p>
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-yellow-600 mb-2">*** GET IDENTIFIED HERE ***</h3>
              </div>
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Contact Us</h2>
            <div className="space-y-6 text-gray-600">
              <p className="text-lg">
                Get in touch with our team for support, inquiries, or partnership opportunities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Email</h3>
                  <p className="text-sm">harshaidsolutions@gmail.com</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">GSTIN</h3>
                  <p className="text-sm font-mono">37CWUPM2873D1Z0</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Service Areas</h3>
                <p className="text-sm">Srikakulam, Vizianagaram and Visakhapatnam</p>
                <p className="text-sm text-gray-500">Three Uttharandhra Districts</p>
              </div>
            </div>
          </div>
        );
      default: // home
        return (
          <div className="text-center max-w-4xl mx-auto">
            {/* Welcome Text - Above Logo */}
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-4">Welcome to Student ID Management</h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                Streamline your school's student identification process with our comprehensive digital platform. 
                Manage student records, track photo uploads, and generate ID cards efficiently.
              </p>
            </div>
            
            {/* HARSHA ID SOLUTIONS Logo in Card - Exact as per image */}
            <div className="bg-white shadow-2xl rounded-3xl p-6 sm:p-8 mb-8 border border-gray-100 transform hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="flex flex-col items-center justify-center space-y-4">
                {/* HARSHA letters - Exact as per image */}
                <div className="flex justify-center space-x-2">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">H</span>
                  </div>
                  <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <div className="w-10 h-10 bg-green-400 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">R</span>
                  </div>
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">H</span>
                  </div>
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                </div>
                
                {/* ID SOLUTIONS section */}
                <div className="flex items-center justify-center space-x-3">
                  {/* ID Badge with ribbons */}
                  <div className="relative">
                    <div className="w-16 h-12 bg-white border-2 border-gray-800 rounded-lg flex items-center justify-center shadow-lg relative">
                      <span className="text-orange-600 font-bold text-lg">ID</span>
                      {/* Ribbons connecting to A and R */}
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-orange-500 rounded-t-lg"></div>
                    </div>
                  </div>
                  
                  {/* SOLUTIONS text */}
                  <span className="text-blue-500 font-bold text-xl">SOLUTIONS</span>
                </div>
                
                {/* Tagline with red lines */}
                <div className="text-center">
                  <div className="w-16 h-0.5 bg-red-500 mx-auto mb-2"></div>
                  <p className="text-black font-bold text-sm">A COMPLETE ID WORLD....</p>
                  <div className="w-16 h-0.5 bg-red-500 mx-auto mt-2"></div>
                </div>
              </div>
            </div>
            


            {/* Login Buttons */}
            <div className="space-y-4 w-full max-w-md mx-auto">
              <button
                onClick={() => navigate("/login-teacher")}
                className="w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-2xl shadow-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105 text-base sm:text-lg"
              >
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Teacher Login</span>
                </div>
              </button>
              <button
                onClick={() => navigate("/login-admin")}
                className="w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-2xl shadow-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105 text-base sm:text-lg"
              >
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Admin Login</span>
                </div>
              </button>
            </div>

            {/* WhatsApp Contact */}
            <div className="mt-6 w-full max-w-md mx-auto">
              <a
                href="https://wa.me/918977219777"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-2xl shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 text-base sm:text-lg"
              >
                <span className="text-lg mr-3">📱</span>
                <span>WhatsApp: +91 8977219777</span>
              </a>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white overflow-x-hidden welcome-page">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full opacity-10 transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-300 rounded-full opacity-10 transform -translate-x-1/2 translate-y-1/2"></div>
      
      {/* Navigation Header */}
      <header className="relative z-20 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <div className="flex flex-col">
                <span className="text-blue-600 font-bold text-sm leading-tight">Harsha ID Solutions</span>
                <span className="text-xs text-gray-500 font-medium">A Complete ID World</span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setActiveSection('home')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === 'home'
                    ? 'bg-yellow-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveSection('about')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === 'about'
                    ? 'bg-yellow-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveSection('contact')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === 'contact'
                    ? 'bg-yellow-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Contact
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-4 space-y-1">
              <button
                onClick={() => { setActiveSection('home'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === 'home'
                    ? 'bg-yellow-500 text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => { setActiveSection('about'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === 'about'
                    ? 'bg-yellow-500 text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                About
              </button>
              <button
                onClick={() => { setActiveSection('contact'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === 'contact'
                    ? 'bg-yellow-500 text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Contact
              </button>
              <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
                <button
                  onClick={() => navigate('/login-admin')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 text-sm shadow-sm"
                >
                  Admin Login
                </button>
                <button
                  onClick={() => navigate('/login-teacher')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm shadow-sm"
                >
                  Teacher Login
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:py-12 overflow-x-hidden">
        <div className="w-full max-w-4xl overflow-x-hidden" style={{ overflowX: 'hidden' }}>
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-300">
            © Harsha ID Solutions. A COMPLETE ID WORLD.....
          </p>
          <p className="text-xs text-gray-400 mt-2">
            GSTIN: 37CWUPM2873D1Z0 | Service Areas: Srikakulam, Vizianagaram, Visakhapatnam
          </p>
        </div>
      </footer>
    </div>
  );
}
