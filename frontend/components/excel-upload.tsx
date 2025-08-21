"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileSpreadsheet, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface ExcelUploadProps {
  schools: Array<{
    id: string
    name: string
  }>
}

interface UploadResult {
  success: boolean
  total: number
  inserted: number
  errors: Array<{
    row: number
    error: string
    data: any
  }>
}

export default function ExcelUpload({ schools }: ExcelUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedSchool, setSelectedSchool] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<UploadResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.name.endsWith(".xlsx")
      ) {
        setSelectedFile(file)
        setResult(null)
      } else {
        alert("Please select a valid Excel file (.xlsx)")
      }
    }
  }

  const downloadTemplate = () => {
    // Create a sample Excel template
    const csvContent =
      "Name,Class,Roll Number,Date of Birth,Gender,Father Name,Mother Name,Address,Phone\n" +
      "John Doe,10th A,001,2008-01-15,Male,Robert Doe,Jane Doe,123 Main St,9876543210\n" +
      "Jane Smith,10th A,002,2008-03-22,Female,Michael Smith,Sarah Smith,456 Oak Ave,9876543211"

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "student_data_template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedSchool) {
      alert("Please select both a file and a school.")
      return
    }

    setUploading(true)
    setProgress(0)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("schoolId", selectedSchool)

      const response = await fetch("/api/upload-excel", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const uploadResult = await response.json()
        setResult(uploadResult)
        setProgress(100)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert(`Failed to upload Excel file: ${error}`)
    } finally {
      setUploading(false)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setSelectedSchool("")
    setResult(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Upload Excel files with student data. Make sure your file includes columns: Name, Class, Roll Number, Date of
          Birth, Gender, Father Name, Mother Name, Address, Phone.
        </AlertDescription>
      </Alert>

      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Download Template</span>
          </CardTitle>
          <CardDescription>Download a sample Excel template with the correct format for student data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadTemplate} variant="outline" className="w-full bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Download Excel Template
          </Button>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Upload Student Data</span>
          </CardTitle>
          <CardDescription>
            Select an Excel file and choose the target school for bulk student data import.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* School Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select School</label>
            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a school" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Excel File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              {selectedFile ? (
                <div className="space-y-2">
                  <FileSpreadsheet className="w-12 h-12 text-green-600 mx-auto" />
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
                    Change File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="text-gray-600">Click to select Excel file</p>
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                    Select File
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button onClick={handleUpload} disabled={!selectedFile || !selectedSchool || uploading} className="flex-1">
              {uploading ? "Processing..." : "Upload Data"}
            </Button>
            <Button onClick={clearSelection} variant="outline" disabled={uploading}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span>Upload Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{result.total}</div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{result.inserted}</div>
                <div className="text-sm text-gray-600">Successfully Added</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{result.errors.length}</div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
            </div>

            {/* Success Message */}
            {result.success && result.errors.length === 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>All {result.inserted} student records were successfully uploaded!</AlertDescription>
              </Alert>
            )}

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">Errors Found:</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {result.errors.map((error, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                      <div className="font-medium">Row {error.row}:</div>
                      <div className="text-red-700">{error.error}</div>
                      {error.data && (
                        <div className="text-gray-600 mt-1">Data: {JSON.stringify(error.data, null, 2)}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
