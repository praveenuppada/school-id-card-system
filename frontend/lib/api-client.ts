// API client utilities for frontend components
export class ApiClient {
  private static async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }))
      throw new Error(error.error || "Request failed")
    }

    return response.json()
  }

  // Student API methods
  static async getStudents(schoolId?: string) {
    const params = schoolId ? `?school_id=${schoolId}` : ""
    return this.request(`/api/students${params}`)
  }

  static async getStudent(id: string) {
    return this.request(`/api/students/${id}`)
  }

  static async createStudent(data: any) {
    return this.request("/api/students", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  static async updateStudent(id: string, data: any) {
    return this.request(`/api/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  static async deleteStudent(id: string) {
    return this.request(`/api/students/${id}`, {
      method: "DELETE",
    })
  }

  // Photo API methods
  static async deletePhoto(studentId: string) {
    return this.request(`/api/photos/${studentId}`, {
      method: "DELETE",
    })
  }

  // School API methods
  static async createSchool(data: any) {
    return this.request("/api/schools", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  static async updateSchool(id: string, data: any) {
    return this.request(`/api/schools/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  static async deleteSchool(id: string) {
    return this.request(`/api/schools/${id}`, {
      method: "DELETE",
    })
  }

  // Teacher API methods
  static async createTeacher(data: any) {
    return this.request("/api/teachers", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Stats API methods
  static async getStats() {
    return this.request("/api/stats")
  }

  // Excel upload
  static async uploadExcel(file: File, schoolId: string) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("schoolId", schoolId)

    const response = await fetch("/api/upload-excel", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Upload failed" }))
      throw new Error(error.error || "Upload failed")
    }

    return response.json()
  }

  // Photo upload
  static async uploadPhoto(file: File, studentData: any) {
    const formData = new FormData()
    formData.append("photo", file)
    Object.keys(studentData).forEach((key) => {
      formData.append(key, studentData[key])
    })

    const response = await fetch("/api/upload-photo", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Upload failed" }))
      throw new Error(error.error || "Upload failed")
    }

    return response.json()
  }
}
