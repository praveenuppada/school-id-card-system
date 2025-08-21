"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  School,
  Users,
  LogOut,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Building,
  UserCheck,
  Camera,
  Mail,
  MapPin,
  Phone,
  FileSpreadsheet,
} from "lucide-react"
import { signOut } from "@/lib/actions"
import SchoolForm from "@/components/school-form"
import TeacherForm from "@/components/teacher-form"
import ExcelUpload from "@/components/excel-upload"

interface AdminDashboardProps {
  admin: {
    id: string
    email: string
    role: string
  }
  schools: Array<{
    id: string
    name: string
    address: string
    contact_email: string
    contact_phone?: string
    created_at: string
    users: Array<{ id: string; email: string; role: string }>
    students: Array<{ id: string }>
  }>
  teachers: Array<{
    id: string
    email: string
    school_id: string | null
    created_at: string
    schools: { name: string } | null
  }>
  stats: {
    total_schools: number
    total_teachers: number
    total_students: number
    photos_uploaded: number
  }
}

export default function AdminDashboard({ admin, schools, teachers, stats }: AdminDashboardProps) {
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [showSchoolForm, setShowSchoolForm] = useState(false)
  const [showTeacherForm, setShowTeacherForm] = useState(false)
  const [editingSchool, setEditingSchool] = useState<any>(null)

  const handleEditSchool = (school: any) => {
    setEditingSchool(school)
    setShowSchoolForm(true)
  }

  const handleDeleteSchool = async (schoolId: string) => {
    if (confirm("Are you sure you want to delete this school? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/schools/${schoolId}`, {
          method: "DELETE",
        })
        if (response.ok) {
          window.location.reload()
        } else {
          alert("Failed to delete school")
        }
      } catch (error) {
        console.error("Delete error:", error)
        alert("Failed to delete school")
      }
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
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Harsha ID Solutions Management</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, Administrator!</h2>
          <p className="text-gray-600">Manage schools, teachers, and system settings</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_schools}</div>
              <p className="text-xs text-muted-foreground">Active institutions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_teachers}</div>
              <p className="text-xs text-muted-foreground">Registered teachers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_students}</div>
              <p className="text-xs text-muted-foreground">Student records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Photos Uploaded</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.photos_uploaded}</div>
              <p className="text-xs text-muted-foreground">ID card photos</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="schools" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schools" className="flex items-center space-x-2">
              <School className="w-4 h-4" />
              <span>Schools ({schools.length})</span>
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4" />
              <span>Teachers ({teachers.length})</span>
            </TabsTrigger>
            <TabsTrigger value="excel" className="flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel Upload</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Schools Tab */}
          <TabsContent value="schools">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>School Management</CardTitle>
                    <CardDescription>Add, edit, and manage schools in the system.</CardDescription>
                  </div>
                  <Dialog open={showSchoolForm} onOpenChange={setShowSchoolForm}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingSchool(null)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add School
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingSchool ? "Edit School" : "Add New School"}</DialogTitle>
                        <DialogDescription>
                          {editingSchool ? "Update school information" : "Enter the details for the new school"}
                        </DialogDescription>
                      </DialogHeader>
                      <SchoolForm
                        school={editingSchool}
                        onSuccess={() => {
                          setShowSchoolForm(false)
                          setEditingSchool(null)
                          window.location.reload()
                        }}
                        onCancel={() => {
                          setShowSchoolForm(false)
                          setEditingSchool(null)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {schools.length === 0 ? (
                  <div className="text-center py-8">
                    <School className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No schools registered yet.</p>
                    <p className="text-sm text-gray-500 mt-2">Add your first school to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {schools.map((school) => (
                      <div key={school.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold">{school.name}</h3>
                              <Badge variant="outline">
                                {school.users.filter((u) => u.role === "teacher").length} Teachers
                              </Badge>
                              <Badge variant="outline">{school.students.length} Students</Badge>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4" />
                                <span>{school.address}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4" />
                                <span>{school.contact_email}</span>
                              </div>
                              {school.contact_phone && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4" />
                                  <span>{school.contact_phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditSchool(school)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSchool(school.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Teacher Management</CardTitle>
                    <CardDescription>Manage teacher accounts and school assignments.</CardDescription>
                  </div>
                  <Dialog open={showTeacherForm} onOpenChange={setShowTeacherForm}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Teacher
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Teacher</DialogTitle>
                        <DialogDescription>Create a new teacher account and assign to a school.</DialogDescription>
                      </DialogHeader>
                      <TeacherForm
                        schools={schools}
                        onSuccess={() => {
                          setShowTeacherForm(false)
                          window.location.reload()
                        }}
                        onCancel={() => setShowTeacherForm(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {teachers.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No teachers registered yet.</p>
                    <p className="text-sm text-gray-500 mt-2">Add teachers to manage school operations.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teachers.map((teacher) => (
                      <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{teacher.email}</h3>
                          <p className="text-sm text-gray-600">School: {teacher.schools?.name || "Not assigned"}</p>
                          <p className="text-xs text-gray-500">
                            Joined: {new Date(teacher.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={teacher.school_id ? "default" : "secondary"}>
                            {teacher.school_id ? "Assigned" : "Unassigned"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Excel Upload Tab */}
          <TabsContent value="excel">
            <Card>
              <CardHeader>
                <CardTitle>Excel Upload & Data Management</CardTitle>
                <CardDescription>
                  Bulk upload student data using Excel files. Download the template and upload your student information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExcelUpload schools={schools} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Overview</CardTitle>
                  <CardDescription>Key metrics and system performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Schools with Teachers</span>
                      <span className="text-sm text-gray-600">
                        {schools.filter((s) => s.users.some((u) => u.role === "teacher")).length} / {schools.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Students with Photos</span>
                      <span className="text-sm text-gray-600">
                        {stats.photos_uploaded} / {stats.total_students}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Students per School</span>
                      <span className="text-sm text-gray-600">
                        {schools.length > 0 ? Math.round(stats.total_students / schools.length) : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
