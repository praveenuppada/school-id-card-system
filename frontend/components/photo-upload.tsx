"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Upload, X, Check } from "lucide-react"

interface PhotoUploadProps {
  schoolId: string
}

export default function PhotoUpload({ schoolId }: PhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [studentName, setStudentName] = useState("")
  const [className, setClassName] = useState("")
  const [rollNumber, setRollNumber] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraActive, setCameraActive] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Unable to access camera. Please check permissions.")
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "captured-photo.jpg", { type: "image/jpeg" })
              setSelectedFile(file)
              setPreview(canvas.toDataURL())
              stopCamera()
            }
          },
          "image/jpeg",
          0.8,
        )
      }
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      setCameraActive(false)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !studentName || !className || !rollNumber) {
      alert("Please fill in all fields and select a photo.")
      return
    }

    setUploading(true)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append("photo", selectedFile)
      formData.append("studentName", studentName)
      formData.append("className", className)
      formData.append("rollNumber", rollNumber)
      formData.append("schoolId", schoolId)

      const response = await fetch("/api/upload-photo", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        alert("Photo uploaded successfully!")
        // Reset form
        setSelectedFile(null)
        setPreview(null)
        setStudentName("")
        setClassName("")
        setRollNumber("")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload photo. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Student Information Form */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="studentName">Student Name</Label>
          <Input
            id="studentName"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Enter student name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="className">Class</Label>
          <Input
            id="className"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="e.g., 10th A"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rollNumber">Roll Number</Label>
          <Input
            id="rollNumber"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="Enter roll number"
          />
        </div>
      </div>

      {/* Photo Upload Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Upload Photo</h3>

          {/* File Upload */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-medium mb-2">Choose File</h4>
                <p className="text-sm text-gray-600 mb-4">Select a photo from your device</p>
                <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
                  Select Photo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Camera Capture */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-medium mb-2">Take Photo</h4>
                <p className="text-sm text-gray-600 mb-4">Use your device camera</p>
                {!cameraActive ? (
                  <Button onClick={startCamera} variant="outline" className="w-full bg-transparent">
                    Start Camera
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button onClick={capturePhoto} className="w-full">
                      Capture Photo
                    </Button>
                    <Button onClick={stopCamera} variant="outline" size="sm">
                      Stop Camera
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Preview</h3>

          <Card>
            <CardContent className="p-6">
              {cameraActive ? (
                <div className="space-y-4">
                  <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              ) : preview ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full rounded-lg" />
                    <Button onClick={clearSelection} size="sm" variant="destructive" className="absolute top-2 right-2">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button onClick={handleUpload} disabled={uploading} className="w-full">
                    {uploading ? (
                      "Uploading..."
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No photo selected</p>
                  <p className="text-sm text-gray-400">Choose a file or take a photo to see preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
