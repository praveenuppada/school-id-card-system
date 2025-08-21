import React from "react";
import Sidebar from "../components/Sidebar";

export default function TeacherInstructions() {
  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      <Sidebar role="TEACHER" />
      
      {/* Main Content Container */}
      <div className="flex-1 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 md:pt-6 pt-16 overflow-x-hidden" style={{ overflowX: 'hidden' }}>
          
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-3 sm:mb-0">
                <h1 className="text-xl font-bold text-gray-900">Teacher Instructions</h1>
                <p className="text-sm text-gray-500">How to use the photo upload system</p>
              </div>
            </div>
          </div>

          {/* Instructions Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              
              {/* Step 1 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Class</h3>
                  <p className="text-gray-600">
                    Choose a class from the dropdown menu in the Teacher Dashboard. This will load all students for that class.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Student Photos</h3>
                  <p className="text-gray-600 mb-3">
                    For each student, you have two options to upload photos:
                  </p>
                  <div className="ml-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="text-gray-600"><strong>Take Photo:</strong> Click "Take Photo" to open your device camera and capture a photo</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="text-gray-600"><strong>Choose File:</strong> Click "Choose File" to select an existing photo from your device</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Photos</h3>
                  <p className="text-gray-600">
                    After capturing or selecting a photo, click "Save" to upload it to the system. The photo will be marked as "Saved" once uploaded successfully.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit All Records</h3>
                  <p className="text-gray-600">
                    Once you have uploaded photos for all students, click "Submit All Records" to send the photos to the admin for review and processing.
                  </p>
                </div>
              </div>

              {/* Tips Section */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips for Best Results</h3>
                <ul className="space-y-2 text-blue-800">
                  <li>• Ensure good lighting when taking photos</li>
                  <li>• Make sure the student's face is clearly visible</li>
                  <li>• Use high-quality photos for better ID card results</li>
                  <li>• Save photos immediately after capturing to avoid losing them</li>
                  <li>• You can retake photos if needed by clicking "Retake"</li>
                </ul>
              </div>

              {/* Support Section */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-gray-600 mb-3">
                  If you encounter any issues or need assistance, please contact support:
                </p>
                <div className="flex items-center space-x-2 text-blue-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>Call: +91 8977219777</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
