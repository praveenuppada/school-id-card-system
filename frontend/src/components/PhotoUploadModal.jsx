import { useState, useRef, useEffect } from "react"
import { Camera, Upload, X, Save } from "lucide-react"

const PhotoUploadModal = ({ isOpen, onClose, onSave, student, uploading, mode = "file" }) => {
  // Store the student data when it's available
  const [currentStudent, setCurrentStudent] = useState(null)
  
  useEffect(() => {
    if (student) {
      setCurrentStudent(student)
      
      // Reset modal state when student changes
      setShowCamera(false)
      
      // Auto-start camera if mode is "retake" - no delay
      if (mode === "retake") {
        startCamera()
      }
    }
  }, [student, mode])
  
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  // Optimized image processing for high quality uploads
  const processImageForUpload = (file, callback) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate dimensions while maintaining aspect ratio
      const maxSize = 2000 // Increased to 2000x2000 for maximum quality preservation
      let { width, height } = img
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }
      
      // Set canvas size to calculated dimensions
      canvas.width = width
      canvas.height = height
      
      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high' // Use highest quality rendering
      
      // Draw image with high quality
      ctx.drawImage(img, 0, 0, width, height)
      
      // Convert to blob with maximum quality
      canvas.toBlob((blob) => {
        const optimizedFile = new File([blob], file.name || 'photo.jpg', { 
          type: 'image/jpeg' 
        })
        callback(optimizedFile)
      }, 'image/jpeg', 1.0) // Maximum quality (100%) for MB-level preservation
    }
    
    img.src = URL.createObjectURL(file)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    
    if (file && file.type.startsWith("image/")) {
      // Process image immediately without delay
      processImageForUpload(file, (optimizedFile) => {
        // Auto-save immediately without any preview or delay
        onSave(optimizedFile, currentStudent || student)
        // Close modal immediately
        setTimeout(() => onClose(), 50)
      })
    } else {
      alert("Please select a valid image file.")
    }
  }

  const startCamera = async () => {
    // Check if it's a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      // For mobile, use file input with camera capture - fastest method
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.capture = 'environment' // Use back camera
      
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (file) {
          // Process and upload immediately
          processImageForUpload(file, (optimizedFile) => {
            onSave(optimizedFile, currentStudent || student)
            setTimeout(() => onClose(), 50)
          })
        }
      }
      
      input.click()
    } else {
      // For desktop, use web camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setShowCamera(true)
        }
      } catch (error) {
        alert("Unable to access camera. Please use file upload instead.")
      }
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      // Set canvas size to video dimensions for maximum quality
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high' // Use highest quality rendering
      
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert to blob with maximum quality and upload immediately
      canvas.toBlob((blob) => {
        const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' })
        
        // Process and upload immediately with maximum quality
        processImageForUpload(file, (optimizedFile) => {
          onSave(optimizedFile, currentStudent || student)
          setTimeout(() => onClose(), 50)
        })
      }, 'image/jpeg', 1.0) // Maximum quality (100%) for MB-level preservation
      
      // Stop camera immediately
      const stream = video.srcObject
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      setShowCamera(false)
    }
  }

  const handleSave = () => {
    // This function is no longer needed since we auto-save
    onClose()
  }

  const handleClose = () => {
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
              {uploading ? "Uploading photo..." : "Photos will be saved instantly"}
            </span>
          </div>
        </div>

        {/* Photo Preview - Removed for faster uploads */}

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
        {!showCamera && (
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
                <span>Take Photo with Camera App</span>
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
