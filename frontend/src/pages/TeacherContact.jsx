import { useState, useEffect } from "react"
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react"
import Sidebar from "../components/Sidebar.jsx"
import { getSchoolInfo } from "../services/teacherService"

const TeacherContact = () => {
  const [schoolName, setSchoolName] = useState('School Campus')

  useEffect(() => {
    const fetchSchoolName = async () => {
      try {
        const response = await getSchoolInfo()
        if (response.data && response.data.schoolName) {
          setSchoolName(response.data.schoolName)
        }
      } catch (error) {
        // Fallback to localStorage if API fails
        const storedSchoolName = localStorage.getItem('teacherSchoolName')
        if (storedSchoolName) {
          setSchoolName(storedSchoolName)
        }
      }
    }
    
    fetchSchoolName()
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Call Us</h1>
                  <p className="text-xs text-gray-500">Contact Support Team</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center space-x-3 mb-6">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Contact Support</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-4">Technical Support</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Phone</p>
                        <span 
                          className="text-blue-700 hover:text-blue-900 cursor-pointer"
                          onClick={() => {
                            navigator.clipboard.writeText('+91 8977219777');
                            alert('Phone number copied to clipboard!');
                          }}
                        >
                          +91 8977219777
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Email</p>
                        <p className="text-blue-700">support@schoolid.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Support Hours</p>
                        <p className="text-blue-700">Mon-Fri: 9:00 AM - 6:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="font-semibold text-green-900 mb-4">School Administration</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Office Phone</p>
                        <p className="text-green-700">+91 98765 43211</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Email</p>
                        <p className="text-green-700">admin@navodhaya.edu</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Address</p>
                        <p className="text-green-700">
                          {schoolName}, Main Campus
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Send us a Message</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>Select a subject</option>
                      <option>Technical Issue</option>
                      <option>Photo Upload Problem</option>
                      <option>Account Access</option>
                      <option>General Inquiry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe your issue or inquiry..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mt-8 bg-red-50 rounded-lg p-6">
              <h3 className="font-semibold text-red-900 mb-3">Emergency Contact</h3>
              <p className="text-red-700 mb-3">
                For urgent technical issues that require immediate attention, please call our emergency support line.
              </p>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-red-600" />
                <div className="font-semibold text-red-900">
                  Emergency: +91 8977219777
                </div>
              </div>
              <div className="mt-2 text-sm text-red-700">
                Click to copy: <span 
                  className="cursor-pointer underline hover:text-red-500"
                  onClick={() => {
                    navigator.clipboard.writeText('+91 8977219777');
                    alert('Phone number copied to clipboard!');
                  }}
                >
                  +91 8977219777
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherContact
