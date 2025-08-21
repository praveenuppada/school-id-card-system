import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const photo = formData.get("photo") as File
    const studentName = formData.get("studentName") as string
    const className = formData.get("className") as string
    const rollNumber = formData.get("rollNumber") as string
    const schoolId = formData.get("schoolId") as string

    if (!photo || !studentName || !className || !rollNumber || !schoolId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Upload photo to Supabase Storage
    const fileExt = photo.name.split(".").pop()
    const fileName = `${schoolId}/${rollNumber}-${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("student-photos")
      .upload(fileName, photo)

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("student-photos").getPublicUrl(fileName)

    // Save student record to database
    const { data: student, error: dbError } = await supabase
      .from("students")
      .insert({
        name: studentName,
        class_name: className,
        roll_number: rollNumber,
        school_id: schoolId,
        photo_url: publicUrl,
        photo_status: "uploaded",
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to save student data" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      student,
      message: "Photo uploaded successfully",
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
