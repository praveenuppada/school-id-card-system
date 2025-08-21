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
    const handleSize = 8
    ctx.fillStyle = '#fff'
    ctx.fillRect(cropArea.x - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize)
    ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize)
    ctx.fillRect(cropArea.x - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize)
    ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize)
  }

  useEffect(() => {
    if (image) {
      drawImage()
    }
  }, [image, cropArea])

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Check if clicking on resize handles
    const handleSize = 8
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
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    if (isDragging) {
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(rect.width - prev.width, x - dragStart.x)),
        y: Math.max(0, Math.min(rect.height - prev.height, y - dragStart.y))
      }))
    } else if (isResizing) {
      setCropArea(prev => {
        let newArea = { ...prev }
        
        switch (resizeHandle) {
          case 'top-left':
            newArea.width = Math.max(50, prev.x + prev.width - x)
            newArea.height = Math.max(50, prev.y + prev.height - y)
            newArea.x = x
            newArea.y = y
            break
          case 'top-right':
            newArea.width = Math.max(50, x - prev.x)
            newArea.height = Math.max(50, prev.y + prev.height - y)
            newArea.y = y
            break
          case 'bottom-left':
            newArea.width = Math.max(50, prev.x + prev.width - x)
            newArea.height = Math.max(50, y - prev.y)
            newArea.x = x
            break
          case 'bottom-right':
            newArea.width = Math.max(50, x - prev.x)
            newArea.height = Math.max(50, y - prev.y)
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
    const touch = e.touches[0]
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    })
    handleMouseDown(mouseEvent)
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    })
    handleMouseMove(mouseEvent)
  }

  const handleTouchEnd = (e) => {
    e.preventDefault()
    handleMouseUp()
  }

  const cropImage = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!canvas || !image) return null
    
    // Create a new canvas for the cropped image
    const croppedCanvas = document.createElement('canvas')
    const croppedCtx = croppedCanvas.getContext('2d')
    
    croppedCanvas.width = cropArea.width
    croppedCanvas.height = cropArea.height
    
    // Calculate the scale factors
    const scaleX = image.width / canvas.width
    const scaleY = image.height / canvas.height
    
    // Draw the cropped portion
    croppedCtx.drawImage(
      image,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      cropArea.width,
      cropArea.height
    )
    
    return croppedCanvas.toDataURL('image/jpeg', 0.9)
  }

  const handleSave = async () => {
    if (!student) return
    
    setLoading(true)
    try {
      const croppedDataUrl = cropImage()
      if (!croppedDataUrl) return
      
      // Convert data URL to blob
      const response = await fetch(croppedDataUrl)
      const blob = await response.blob()
      
      // Create form data
      const formData = new FormData()
      formData.append('file', blob, `${student.photoId}.jpg`)
      formData.append('photoId', student.photoId)
      formData.append('studentId', student._id)
      
      // Upload cropped photo
      const result = await cropPhoto(formData)
      
             if (result.data.success) {
         setCroppedImage(croppedDataUrl)
         setSaved(true)
         onPhotoUpdated && onPhotoUpdated(result.data.photoUrl)
         
         // Show success message and close after 2 seconds
         setTimeout(() => {
           onClose()
           setSaved(false)
         }, 2000)
       }
    } catch (error) {
      console.error('Error saving cropped photo:', error)
      alert('Failed to save cropped photo. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!student?.photoUrl) return
    
    try {
      const response = await downloadSinglePhoto(student.photoUrl)
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${student.photoId}_${student.fullName}.jpg`)
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
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
            className="border border-gray-300 rounded-lg cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </div>

                 {saved && (
           <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center space-x-2">
             <CheckCircle className="h-5 w-5" />
             <span>Photo cropped and saved successfully! Modal will close automatically...</span>
           </div>
         )}

         <div className="flex justify-between items-center">
           <div className="flex space-x-2">
             <button
               onClick={handleReset}
               className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
             >
               <RotateCcw className="h-4 w-4" />
               <span>Reset</span>
             </button>
             <button
               onClick={handleDownload}
               className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
             >
               <Download className="h-4 w-4" />
               <span>Download</span>
             </button>
           </div>
           
           <button
             onClick={handleSave}
             disabled={loading || saved}
             className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {loading ? (
               <>
                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                 <span>Saving...</span>
               </>
             ) : saved ? (
               <>
                 <CheckCircle className="h-4 w-4" />
                 <span>Saved!</span>
               </>
             ) : (
               <>
                 <Save className="h-4 w-4" />
                 <span>Save Crop</span>
               </>
             )}
           </button>
         </div>

        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Instructions:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Drag the white border to move the crop area</li>
            <li>Drag the white corners to resize the crop area</li>
            <li>Touch and drag on mobile devices</li>
            <li>Click "Save Crop" to apply changes</li>
            <li>Click "Download" to download the original photo</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default PhotoCropModal
