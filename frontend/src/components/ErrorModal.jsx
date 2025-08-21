import { useState } from "react"
import { XCircle } from "lucide-react"

const ErrorModal = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex items-center space-x-3 mb-4">
          <XCircle className="h-8 w-8 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Error</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  )
}

export default ErrorModal

