import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user role
    const { data: profile } = await supabase.from("users").select("role, school_id").eq("id", session.user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    let stats

    if (profile.role === "admin") {
      // Admin gets system-wide stats
      const { data: adminStats } = await supabase.rpc("get_admin_stats")
      stats = adminStats || { total_schools: 0, total_teachers: 0, total_students: 0, photos_uploaded: 0 }
    } else if (profile.role === "teacher") {
      // Teacher gets school-specific stats
      const { data: schoolStats } = await supabase.rpc("get_teacher_stats", { teacher_school_id: profile.school_id })
      stats = schoolStats || { total_students: 0, photos_uploaded: 0, pending_photos: 0 }
    } else {
      return NextResponse.json({ error: "Invalid user role" }, { status: 403 })
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
