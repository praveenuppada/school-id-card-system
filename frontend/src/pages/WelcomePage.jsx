import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Shield, Users, Camera, FileSpreadsheet, MessageCircle, Menu, X, Phone, Info } from "lucide-react"

const WelcomePage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showAboutUs, setShowAboutUs] = useState(false)
  const [showContactUs, setShowContactUs] = useState(false)

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Mobile hamburger menu button
  const MobileMenuButton = () => (
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-lg shadow-lg border"
    >
      {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {isMobile && <MobileMenuButton />}
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:pl-6 pl-16">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {/* H Logo */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <div>
                <h1 className="text-sm sm:text-lg font-bold text-blue-600">Harsha ID Solutions</h1>
                <p className="text-xs text-gray-500">A Complete ID World...</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => setShowAboutUs(true)}
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1"
                >
                  <Info className="h-4 w-4" />
                  <span>About Us</span>
                </button>
                
                <a
                  href="tel:+918977219777"
                  className="text-green-600 hover:text-green-700 transition-colors flex items-center space-x-1"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call Us</span>
                </a>
              </div>
              
              <Link
                to="/login"
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Logo Card */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-3xl">
            <div className="hanging-animation">
              <img
                src="/images/harsha-logo.jpeg"
                alt="Harsha ID Solutions"
                className="h-40 w-auto mx-auto drop-shadow-lg"
              />
            </div>
            <p className="text-center text-gray-600 text-base mt-3">Professional ID Card Solutions</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <Camera className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">ID Card Services</h3>
            <p className="text-gray-600">
              Professional ID card design and printing services. High-quality student identification cards.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <FileSpreadsheet className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Belt Services</h3>
            <p className="text-gray-600">
              School uniform belt manufacturing and supply. Quality belts for all students.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <Users className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Tie Services</h3>
            <p className="text-gray-600">School tie manufacturing and supply services. Professional uniform ties.</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-xl p-8 shadow-sm border mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Our Experience</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">2015</div>
              <div className="text-gray-600">Established Since</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Schools Served</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">1L+</div>
              <div className="text-gray-600">ID Cards Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">3</div>
              <div className="text-gray-600">Districts Covered</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of schools in Srikakulam, Vizianagaram, and Visakhapatnam who trust us for their ID card
            solutions.
          </p>
          <a
            href="https://wa.me/918977219777"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
          >
            <span>Contact on WhatsApp</span>
            <MessageCircle className="h-5 w-5" />
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img
                src="/images/harsha-logo.jpeg"
                alt="Harsha ID Solutions"
                className="h-12 w-auto filter brightness-0 invert"
              />
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">© Harsha ID Solutions. All rights reserved.</p>
              <p className="text-gray-400">Serving Srikakulam, Vizianagaram & Visakhapatnam</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu */}
          <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 md:hidden">
            <div className="p-6 pt-16">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">H</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Harsha ID Solutions</h2>
                  <p className="text-xs text-gray-500">A Complete ID World...</p>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => {
                    setShowAboutUs(true)
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full text-left"
                >
                  <Info className="h-5 w-5" />
                  <span className="font-medium">About Us</span>
                </button>
                
                <a
                  href="tel:+918977219777"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-green-600 hover:bg-green-50 hover:text-green-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Phone className="h-5 w-5" />
                  <span className="font-medium">Call Us</span>
                </a>
              </nav>
            </div>
          </div>
        </>
      )}

      {/* About Us Modal */}
      {showAboutUs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">ABOUT US</h3>
              <button
                onClick={() => setShowAboutUs(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="text-gray-700 space-y-4 text-sm leading-relaxed">
              <p>
                Our services begins in 2015, We have been leading ID manufacturers in the three Uttharandhra Districts .i.e., Srikakulam, vizianagaram and Visakhapatnam. We have successfully completed so many projects related to state government and central government including private sectors. We started our bussiness with STUDENT ID CARDS, TIES and BELTS. Within short time, Harsha ID Solutions developed the bussiness to small scale industry.
              </p>
              
              <p>
                We have been in the bussiness of ID CARDS, TIES, MULTI COLOUR BELTS, REPORT CARDS, DAIRIES, T-SHIRT PRINTING, MUG PRINTING, KEY CHAINS, LOGO BADGES and SCREEN PRINTING for the past 10+ Years catering various sectors i.e., Corporate, Industrial, Banks, Educational Institutions etc. taking on the challenges and fulfilling the customer expectations. The company has been providing solutions on technology, machinery, Raw materials to ID sellers across the state.
              </p>
              
              <div>
                <p className="font-semibold mb-2">Our Strength:</p>
                <p>Maintaining good quality, providing latest models with in-time delivery, Committed and skilled manpower, fully automated advanced machinery, assured raw material support, resulting in excelling customer expectations.</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold text-blue-800">SINGLE LINE ABOUT HARSHA ID SOLUTIONS:</p>
                <p className="text-blue-700">I STARTED HARSHA ID SOLUTIONS WITH ZERO INVESTMENT. NOW, OUR TURNOVER IS ABOUT 50LAKHS PER ANNUM.</p>
              </div>
              
              <div className="text-center font-bold text-lg text-green-600">
                *** GET IDENTIFIED HERE ***
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Us Modal */}
      {showContactUs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Contact Us</h3>
              <button
                onClick={() => setShowContactUs(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Get in touch with us for all your ID card needs</p>
                <a
                  href="tel:+918977219777"
                  className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  <span>Call +91 8977219777</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WelcomePage
