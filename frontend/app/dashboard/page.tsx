import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Get user profile to determine role
  const { data: profile } = await supabase.from("users").select("role, school_id").eq("id", session.user.id).single()

  // Redirect based on role
  if (profile?.role === "admin") {
    redirect("/dashboard/admin")
  } else {
    redirect("/dashboard/teacher")
  }
}
