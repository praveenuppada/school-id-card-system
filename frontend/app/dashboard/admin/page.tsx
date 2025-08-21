import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminDashboard from "@/components/admin-dashboard"

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Get admin profile
  const { data: profile } = await supabase.from("users").select("id, email, role").eq("id", session.user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/auth/login")
  }

  // Get all schools with teacher and student counts
  const { data: schools } = await supabase
    .from("schools")
    .select(`
      *,
      users!users_school_id_fkey (
        id,
        email,
        role
      ),
      students (
        id
      )
    `)
    .order("created_at", { ascending: false })

  // Get all teachers
  const { data: teachers } = await supabase
    .from("users")
    .select(`
      id,
      email,
      school_id,
      created_at,
      schools (
        name
      )
    `)
    .eq("role", "teacher")
    .order("created_at", { ascending: false })

  // Get overall statistics
  const { data: stats } = await supabase.rpc("get_admin_stats")

  return (
    <AdminDashboard
      admin={profile}
      schools={schools || []}
      teachers={teachers || []}
      stats={stats || { total_schools: 0, total_teachers: 0, total_students: 0, photos_uploaded: 0 }}
    />
  )
}
