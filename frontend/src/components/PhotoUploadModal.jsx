import { useState, useRef, useEffect } from "react"
import { Camera, Upload, X, Save } from "lucide-react"

const PhotoUploadModal = ({ isOpen, onClose, onSave, student, uploading, mode = "file" }) => {
  // Store the student data when it's available
  const [currentStudent, setCurrentStudent] = useState(null)
  
  useEffect(() => {
    if (student) {
      setCurrentStudent(student)
      
      // Reset modal state when student changes
      setSelectedFile(null)
      setPreviewUrl(null)
      setCapturedImage(null)
      setShowCamera(false)
      
      // Auto-start camera if mode is "retake"
      if (mode === "retake") {
        setTimeout(() => startCamera(), 100)
      }
    }
  }, [student, mode])
  
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setCapturedImage(null)
      
      // Auto-save the photo instantly
      onSave(file, currentStudent || student)
    } else {
      alert("Please select a valid image file.")
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setShowCamera(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Unable to access camera. Please use file upload instead.")
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        const file = new File([blob], "captured-photo.jpg", { type: "image/jpeg" })
        setSelectedFile(file)
        setCapturedImage(canvas.toDataURL())
        setPreviewUrl(canvas.toDataURL())
        
        // Auto-save the captured photo instantly
        onSave(file, currentStudent || student)
      }, "image/jpeg")
      
      // Stop camera
      const stream = video.srcObject
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      setShowCamera(false)
    }
  }

  const handleSave = () => {
    if (selectedFile) {
      // Pass both file and student data to onSave
      onSave(selectedFile, currentStudent || student)
    } else {
      alert("Please select a file first.")
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setCapturedImage(null)
    setShowCamera(false)
    
    // Stop camera if running
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject
      stream.getTracks().forEach(track => track.stop())
    }
    
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Upload Photo for {(currentStudent || student)?.name || (currentStudent || student)?.fullName}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Status Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-700">
              {uploading ? "Uploading photo..." : "Ready to upload photo"}
            </span>
          </div>
          {selectedFile && (
            <p className="text-xs text-blue-600 mt-1">
              File: {selectedFile.name} ({selectedFile.size} bytes)
            </p>
          )}
        </div>

        {/* Photo Preview */}
        {previewUrl && (
          <div className="mb-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Camera View */}
        {showCamera && (
          <div className="mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-48 object-cover rounded-lg"
            />
            <canvas ref={canvasRef} className="hidden" />
            <button
              onClick={capturePhoto}
              className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Capture Photo
            </button>
          </div>
        )}

        {/* Upload Options */}
        {!previewUrl && !showCamera && (
          <div className="space-y-3 mb-4">
            <div className="text-center mb-3">
              <p className="text-sm text-gray-600">Photos will be saved automatically</p>
            </div>
            
            {mode !== "retake" && (
              <button
                onClick={startCamera}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Camera className="h-5 w-5" />
                <span>Take Photo (Auto-save)</span>
              </button>
            )}
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Upload className="h-5 w-5" />
              <span>Choose File (Auto-save)</span>
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Close"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PhotoUploadModal
