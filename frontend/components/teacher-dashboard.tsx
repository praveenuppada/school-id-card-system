"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Upload, Users, FileImage, LogOut, School, User, Mail, MapPin } from "lucide-react"
import { signOut } from "@/lib/actions"
import PhotoUpload from "@/components/photo-upload"

interface TeacherDashboardProps {
  teacher: {
    id: string
    email: string
    role: string
    school_id: string
  }
  school: {
    id: string
    name: string
    address: string
    contact_email: string
  } | null
  students: Array<{
    id: string
    name: string
    class_name: string
    roll_number: string
    photo_url?: string
    photo_status?: string
    created_at: string
  }>
}

export default function TeacherDashboard({ teacher, school, students }: TeacherDashboardProps) {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "uploaded":
        return "bg-green-100 text-green-800"
      case "uploading":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-sm text-gray-600">{school?.name || "School Name"}</p>
              </div>
            </div>
            <form action={signOut}>
              <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {teacher.email.split("@")[0]}!</h2>
          <p className="text-gray-600">Manage student photos and data for {school?.name || "your school"}</p>
        </div>

        {/* School Info Card */}
        {school && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <School className="w-5 h-5" />
                <span>School Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="font-medium">{school.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="font-medium">{school.contact_email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Address:</span>
                  <span className="font-medium">{school.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload Photos</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Students ({students.length})</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center space-x-2">
              <FileImage className="w-4 h-4" />
              <span>Photo Gallery</span>
            </TabsTrigger>
          </TabsList>

          {/* Photo Upload Tab */}
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Student Photos</CardTitle>
                <CardDescription>
                  Upload photos for student ID cards. You can take photos directly or choose from files.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PhotoUpload schoolId={teacher.school_id} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Student List</CardTitle>
                <CardDescription>View and manage student information for your school.</CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No students found for your school.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Students will appear here once they are added to the system.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                            {student.photo_url ? (
                              <img
                                src={student.photo_url || "/placeholder.svg"}
                                alt={student.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{student.name}</h3>
                            <p className="text-sm text-gray-600">
                              Class: {student.class_name} | Roll: {student.roll_number}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(student.photo_status)}>
                            {student.photo_status || "No Photo"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photo Gallery Tab */}
          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle>Photo Gallery</CardTitle>
                <CardDescription>View all uploaded student photos.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {students
                    .filter((student) => student.photo_url)
                    .map((student) => (
                      <div key={student.id} className="space-y-2">
                        <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={student.photo_url || "/placeholder.svg"}
                            alt={student.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium truncate">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.class_name}</p>
                        </div>
                      </div>
                    ))}
                </div>
                {students.filter((s) => s.photo_url).length === 0 && (
                  <div className="text-center py-8">
                    <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No photos uploaded yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
