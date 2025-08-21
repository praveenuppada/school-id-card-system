import { useState, useRef, useEffect } from "react"
import { X, Save, RotateCcw, Download, CheckCircle } from "lucide-react"
import { cropPhoto, downloadSinglePhoto } from "../services/adminService"

const PhotoCropModal = ({ isOpen, onClose, student, onPhotoUpdated }) => {
  const [image, setImage] = useState(null)
  const [croppedImage, setCroppedImage] = useState(null)
  const [isCropping, setIsCropping] = useState(false)
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 200 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const canvasRef = useRef(null)
  const imageRef = useRef(null)

  useEffect(() => {
    if (isOpen && student?.photoUrl) {
      loadImage(student.photoUrl)
      setSaved(false) // Reset saved state when modal opens
    }
  }, [isOpen, student])

  const loadImage = (url) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      setImage(img)
      // Set initial crop area to center of image
      const canvas = canvasRef.current
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        const scaleX = img.width / rect.width
        const scaleY = img.height / rect.height
        
        setCropArea({
          x: (rect.width - 200) / 2,
          y: (rect.height - 200) / 2,
          width: 200,
          height: 200
        })
      }
    }
    img.src = url
  }

  const drawImage = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!canvas || !image) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    
    // Draw crop overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Clear crop area
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)
    ctx.globalCompositeOperation = 'source-over'
    
    // Draw crop border
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)
    
    // Draw resize handles
    const handleSize = 16  // Larger handles for better touch interaction
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    
    // Draw handles with border for better visibility
    const drawHandle = (x, y) => {
      ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize)
      ctx.strokeRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize)
    }
    
    drawHandle(cropArea.x, cropArea.y)  // top-left
    drawHandle(cropArea.x + cropArea.width, cropArea.y)  // top-right
    drawHandle(cropArea.x, cropArea.y + cropArea.height)  // bottom-left
    drawHandle(cropArea.x + cropArea.width, cropArea.y + cropArea.height)  // bottom-right
  }

  useEffect(() => {
    if (image) {
      drawImage()
    }
  }, [image, cropArea])

  const getCanvasCoordinates = (clientX, clientY) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = 400 / rect.width  // Canvas actual width / display width
    const scaleY = 400 / rect.height // Canvas actual height / display height
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    }
  }

  const handleMouseDown = (e) => {
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY)
    
    // Check if clicking on resize handles - make them larger for touch
    const handleSize = 16  // Increased from 8 for better touch interaction
    const handles = [
      { x: cropArea.x - handleSize/2, y: cropArea.y - handleSize/2, corner: 'top-left' },
      { x: cropArea.x + cropArea.width - handleSize/2, y: cropArea.y - handleSize/2, corner: 'top-right' },
      { x: cropArea.x - handleSize/2, y: cropArea.y + cropArea.height - handleSize/2, corner: 'bottom-left' },
      { x: cropArea.x + cropArea.width - handleSize/2, y: cropArea.y + cropArea.height - handleSize/2, corner: 'bottom-right' }
    ]
    
    const clickedHandle = handles.find(handle => 
      x >= handle.x && x <= handle.x + handleSize &&
      y >= handle.y && y <= handle.y + handleSize
    )
    
    if (clickedHandle) {
      setIsResizing(true)
      setResizeHandle(clickedHandle.corner)
    } else if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
               y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      setIsDragging(true)
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y })
    }
  }

  const handleMouseMove = (e) => {
    if (!isDragging && !isResizing) return
    
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY)
    
    if (isDragging) {
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(400 - prev.width, x - dragStart.x)),
        y: Math.max(0, Math.min(400 - prev.height, y - dragStart.y))
      }))
    } else if (isResizing) {
      setCropArea(prev => {
        let newArea = { ...prev }
        
        switch (resizeHandle) {
          case 'top-left':
            newArea.width = Math.max(50, prev.x + prev.width - x)
            newArea.height = Math.max(50, prev.y + prev.height - y)
            newArea.x = Math.max(0, x)
            newArea.y = Math.max(0, y)
            break
          case 'top-right':
            newArea.width = Math.max(50, Math.min(400 - prev.x, x - prev.x))
            newArea.height = Math.max(50, prev.y + prev.height - y)
            newArea.y = Math.max(0, y)
            break
          case 'bottom-left':
            newArea.width = Math.max(50, prev.x + prev.width - x)
            newArea.height = Math.max(50, Math.min(400 - prev.y, y - prev.y))
            newArea.x = Math.max(0, x)
            break
          case 'bottom-right':
            newArea.width = Math.max(50, Math.min(400 - prev.x, x - prev.x))
            newArea.height = Math.max(50, Math.min(400 - prev.y, y - prev.y))
            break
        }
        
        return newArea
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle(null)
  }

  const handleTouchStart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const touch = e.touches[0]
    handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY })
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.touches.length > 0) {
      const touch = e.touches[0]
      handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY })
    }
  }

  const handleTouchEnd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    handleMouseUp()
  }

  const cropImage = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!canvas || !image) return null
    
    // Create a new canvas for the cropped image with optimized size
    const croppedCanvas = document.createElement('canvas')
    const croppedCtx = croppedCanvas.getContext('2d')
    
    // Optimize canvas size for faster processing (max 800x800)
    const maxSize = 800
    let finalWidth = cropArea.width
    let finalHeight = cropArea.height
    
    if (finalWidth > maxSize || finalHeight > maxSize) {
      const ratio = Math.min(maxSize / finalWidth, maxSize / finalHeight)
      finalWidth = Math.round(finalWidth * ratio)
      finalHeight = Math.round(finalHeight * ratio)
    }
    
    croppedCanvas.width = finalWidth
    croppedCanvas.height = finalHeight
    
    // Calculate the scale factors
    const scaleX = image.width / canvas.width
    const scaleY = image.height / canvas.height
    
    // Draw the cropped portion with optimized quality
    croppedCtx.imageSmoothingEnabled = true
    croppedCtx.imageSmoothingQuality = 'high'
    croppedCtx.drawImage(
      image,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      finalWidth,
      finalHeight
    )
    
    return croppedCanvas.toDataURL('image/jpeg', 0.95) // High quality but slightly compressed for speed
  }

  const handleSave = async () => {
    if (!student) return
    
    setLoading(true)
    setUploadProgress(0)
    try {
      const croppedDataUrl = cropImage()
      if (!croppedDataUrl) return
      
      // Optimize blob creation for faster processing
      const base64Data = croppedDataUrl.split(',')[1]
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/jpeg' })
      
      // Create form data with optimized file
      const formData = new FormData()
      formData.append('file', blob, `${student.photoId}.jpg`)
      formData.append('photoId', student.photoId)
      formData.append('studentId', student._id)
      
      // Upload cropped photo with progress tracking
      const result = await cropPhoto(formData, (progress) => {
        setUploadProgress(progress)
      })
      
      if (result.data.success) {
        setCroppedImage(croppedDataUrl)
        setSaved(true)
        onPhotoUpdated && onPhotoUpdated(result.data.photoUrl)
        
        // Show success message and close after 500ms (faster)
        setTimeout(() => {
          onClose()
          setSaved(false)
        }, 500)
      }
    } catch (error) {
      console.error('Error saving cropped photo:', error)
      if (error.message === 'Upload timeout') {
        alert('Upload took too long. Please try again.')
      } else {
        alert('Failed to save cropped photo. Please try again.')
      }
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  const handleDownload = async () => {
    if (!student?.photoUrl) return
    
    try {
      const response = await downloadSinglePhoto(student.photoUrl)
      
      // Create download link with high quality and proper naming
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'image/jpeg' }))
      const link = document.createElement('a')
      link.href = url
      
      // Use photo ID as filename for better organization
      const fileName = student.photoId ? `${student.photoId}.jpg` : `${student.fullName || 'photo'}.jpg`
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      alert('Photo downloaded successfully!')
    } catch (error) {
      console.error('Error downloading photo:', error)
      alert('Failed to download photo. Please try again.')
    }
  }

  const handleReset = () => {
    if (image) {
      const canvas = canvasRef.current
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        setCropArea({
          x: (rect.width - 200) / 2,
          y: (rect.height - 200) / 2,
          width: 200,
          height: 200
        })
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Crop Photo - {student?.fullName} ({student?.photoId})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="border border-gray-300 rounded-lg cursor-crosshair w-full max-w-md mx-auto"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'none' }}
          />
        </div>

                                   {saved && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Photo cropped and saved successfully! Modal will close automatically...</span>
            </div>
          )}

          {loading && (
            <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Saving cropped photo...</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="text-xs mt-1">{uploadProgress}% complete</div>
            </div>
          )}

         <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
           <div className="flex flex-wrap gap-2">
             <button
               onClick={handleReset}
               className="flex items-center space-x-1 sm:space-x-2 bg-gray-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm"
             >
               <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
               <span>Reset</span>
             </button>
             <button
               onClick={handleDownload}
               className="flex items-center space-x-1 sm:space-x-2 bg-green-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
             >
               <Download className="h-3 w-3 sm:h-4 sm:w-4" />
               <span>Download</span>
             </button>
           </div>
           
           <button
             onClick={handleSave}
             disabled={loading || saved}
             className="flex items-center space-x-1 sm:space-x-2 bg-blue-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
           >
             {loading ? (
               <>
                 <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                 <span>Saving...</span>
               </>
             ) : saved ? (
               <>
                 <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                 <span>Saved!</span>
               </>
             ) : (
               <>
                 <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                 <span>Save Crop</span>
               </>
             )}
           </button>
         </div>

        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Instructions:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Move crop area:</strong> Touch/drag inside the white border</li>
            <li><strong>Resize crop area:</strong> Touch/drag the white corner squares</li>
            <li><strong>On mobile:</strong> Use your finger to touch and drag</li>
            <li><strong>Save:</strong> Click "Save Crop" to apply changes</li>
            <li><strong>Download:</strong> Click "Download" to get the original photo</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default PhotoCropModal
