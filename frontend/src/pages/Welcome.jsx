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
          <div className="text-center max-w-2xl mx-auto">
            {/* HARSHA ID SOLUTIONS Logo in Card */}
            <div className="bg-white shadow-xl rounded-2xl p-8 mb-8 border border-gray-100 transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-3">
                {/* HARSHA letters */}
                <div className="flex space-x-2">
                  <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">H</span>
                  </div>
                  <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">A</span>
                  </div>
                  <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">R</span>
                  </div>
                  <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">S</span>
                  </div>
                  <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">H</span>
                  </div>
                  <div className="w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">A</span>
                  </div>
                </div>
                
                {/* ID Card Icon */}
                <div className="relative ml-4">
                  <div className="w-20 h-16 bg-white border-2 border-black rounded-lg flex items-center justify-center relative">
                    <span className="text-orange-500 font-bold text-2xl">ID</span>
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-10 h-2 bg-black rounded-t-lg"></div>
                  </div>
                </div>
                
                {/* SOLUTIONS */}
                <div className="ml-4">
                  <span className="text-blue-500 font-bold text-3xl">SOLUTIONS</span>
                </div>
              </div>
            </div>
            
            {/* Tagline */}
            <div className="border-t-2 border-b-2 border-red-500 py-3 mt-6">
              <p className="text-2xl font-semibold text-gray-800 text-center">A COMPLETE ID WORLD.....</p>
            </div>
                </div>
              </div>
            </div>
            
            {/* Welcome Text */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Student ID Management</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Streamline your school's student identification process with our comprehensive digital platform. 
                Manage student records, track photo uploads, and generate ID cards efficiently.
              </p>
            </div>
            
            <p className="text-lg text-blue-600 font-medium mb-8 text-center">Welcome to the Students</p>

            {/* Login Buttons */}
            <div className="space-y-4 w-full max-w-sm mx-auto">
              <button
                onClick={() => navigate("/login-teacher")}
                className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-semibold rounded-xl shadow-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 transform hover:scale-105 text-base sm:text-lg"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Teacher Login</span>
                </div>
              </button>
              <button
                onClick={() => navigate("/login-admin")}
                className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-semibold rounded-xl shadow-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 transform hover:scale-105 text-base sm:text-lg"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Admin Login</span>
                </div>
              </button>
            </div>

            {/* WhatsApp Contact */}
            <div className="mt-8 w-full max-w-sm mx-auto">
              <a
                href="https://wa.me/918977219777"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white font-semibold rounded-xl shadow-lg hover:bg-green-600 transition-all duration-200 transform hover:scale-105 text-base sm:text-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <span>WhatsApp: +91 8977219777</span>
              </a>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full opacity-10 transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-300 rounded-full opacity-10 transform -translate-x-1/2 translate-y-1/2"></div>
      
      {/* Navigation Header */}
      <header className="relative z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
              </div>
              <span className="text-blue-500 font-bold text-lg">ARSHA ID SOLUTIONS</span>
              <div className="border-l border-r border-red-500 px-1">
                <p className="text-xs font-semibold text-gray-800">A COMPLETE ID WORLD.....</p>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveSection('home')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === 'home'
                    ? 'bg-yellow-400 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-yellow-50'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveSection('about')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === 'about'
                    ? 'bg-yellow-400 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-yellow-50'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveSection('contact')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === 'contact'
                    ? 'bg-yellow-400 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-yellow-50'
                }`}
              >
                Contact
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="px-3 py-2 bg-yellow-400 text-white rounded-md text-sm font-medium"
              >
                Menu
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => { setActiveSection('home'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  activeSection === 'home'
                    ? 'bg-yellow-400 text-white'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-yellow-50'
                }`}
              >
                🏠 Home
              </button>
              <button
                onClick={() => { setActiveSection('about'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  activeSection === 'about'
                    ? 'bg-yellow-400 text-white'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-yellow-50'
                }`}
              >
                ℹ️ About
              </button>
              <button
                onClick={() => { setActiveSection('contact'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  activeSection === 'contact'
                    ? 'bg-yellow-400 text-white'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-yellow-50'
                }`}
              >
                📞 Contact
              </button>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <button
                  onClick={() => navigate('/login-admin')}
                  className="w-full px-4 py-3 bg-yellow-400 text-white font-semibold rounded-lg hover:bg-yellow-500 transition-colors text-base"
                >
                  👨‍💼 Admin Login
                </button>
                <button
                  onClick={() => navigate('/login-teacher')}
                  className="w-full px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors text-base mt-2"
                >
                  👩‍🏫 Teacher Login
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
        {renderContent()}
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
