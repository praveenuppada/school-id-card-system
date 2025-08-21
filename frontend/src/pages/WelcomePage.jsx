import { Link } from "react-router-dom"
import { Shield, Users, Camera, FileSpreadsheet, MessageCircle } from "lucide-react"

const WelcomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {/* H Logo */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Harsha ID Solutions</h1>
                <p className="text-xs text-gray-500">A Complete ID World...</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
              <div className="text-3xl font-bold text-purple-600 mb-2">50K+</div>
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
    </div>
  )
}

export default WelcomePage
