import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get student data to find photo URL
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("photo_url")
      .eq("id", params.id)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Delete photo from storage if exists
    if (student.photo_url) {
      const photoPath = student.photo_url.split("/").pop()
      if (photoPath) {
        await supabase.storage.from("student-photos").remove([photoPath])
      }
    }

    // Update student record to remove photo
    const { error: updateError } = await supabase
      .from("students")
      .update({
        photo_url: null,
        photo_status: null,
      })
      .eq("id", params.id)

    if (updateError) {
      console.error("Database error:", updateError)
      return NextResponse.json({ error: "Failed to remove photo" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
