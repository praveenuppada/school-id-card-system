import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import TeacherDashboard from "@/components/teacher-dashboard"

export default async function TeacherDashboardPage() {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Get teacher profile and school information
  const { data: profile } = await supabase
    .from("users")
    .select(`
      id,
      email,
      role,
      school_id,
      schools (
        id,
        name,
        address,
        contact_email
      )
    `)
    .eq("id", session.user.id)
    .single()

  if (!profile || profile.role !== "teacher") {
    redirect("/auth/login")
  }

  // Get students for this school
  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("school_id", profile.school_id)
    .order("created_at", { ascending: false })

  return <TeacherDashboard teacher={profile} school={profile.schools} students={students || []} />
}
