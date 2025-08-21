import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, ArrowLeft, CheckCircle } from "lucide-react"
import Sidebar from "../components/Sidebar.jsx"

const TeacherInstructions = () => {
  const navigate = useNavigate()

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
                  <h1 className="text-xl font-bold text-gray-900">Teacher Instructions</h1>
                  <p className="text-xs text-gray-500">How to use the Teacher Portal</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="h-8 w-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Teacher Portal Instructions</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3">Getting Started</h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Select your class from the dropdown menu on the dashboard</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>View the list of students in your selected class</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Upload photos for students who don't have photos yet</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-3">Photo Upload Process</h3>
                <ol className="space-y-2 text-green-800 list-decimal list-inside">
                  <li>Click on the "Take Photo" or "Choose File" button for a student</li>
                  <li>Ensure the photo is clear and shows the student's face properly</li>
                  <li>Click "Save" to upload the photo to the system</li>
                  <li>If the photo is not satisfactory, click "Retake" to try again</li>
                  <li>The status will change to "Submitted" once the photo is successfully uploaded</li>
                </ol>
              </div>

              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="font-semibold text-yellow-900 mb-3">Important Guidelines</h3>
                <ul className="space-y-2 text-yellow-800">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>Photos should be in JPG or PNG format</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>Ensure good lighting for clear photos</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>Student should be facing the camera directly</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>Remove any hats or accessories that cover the face</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>Use a neutral background when possible</span>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="font-semibold text-purple-900 mb-3">Troubleshooting</h3>
                <div className="space-y-3 text-purple-800">
                  <div>
                    <h4 className="font-medium">Photo not uploading?</h4>
                    <p className="text-sm">Check your internet connection and try again. If the problem persists, contact support.</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Camera not working?</h4>
                    <p className="text-sm">Make sure you've granted camera permissions to the website in your browser settings.</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Wrong student selected?</h4>
                    <p className="text-sm">Double-check the student name and photo ID before uploading.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
                <p className="text-gray-700 mb-3">
                  If you encounter any issues or need assistance, please contact the technical support team.
                </p>
                <button
                  onClick={() => navigate("/teacher/contact")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherInstructions

