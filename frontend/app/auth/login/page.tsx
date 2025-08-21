import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LoginForm from "@/components/login-form"
import Link from "next/link"
import { Shield } from "lucide-react"

interface LoginPageProps {
  searchParams: { role?: string }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Connect Supabase to get started</h1>
      </div>
    )
  }

  // Check if user is already logged in
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  const role = searchParams.role || "teacher"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-gray-900">Harsha ID Solutions</h1>
              <p className="text-sm text-gray-600">A COMPLETE ID WORLD</p>
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {role === "admin" ? "Admin Login" : "Teacher Login"}
          </h2>
          <p className="text-gray-600">
            {role === "admin" ? "Access the administrative dashboard" : "Access your school management tools"}
          </p>
        </div>

        {/* Login Form */}
        <LoginForm expectedRole={role} />

        {/* Role Switch */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">{role === "admin" ? "Are you a teacher?" : "Are you an admin?"}</p>
          <Link
            href={`/auth/login?role=${role === "admin" ? "teacher" : "admin"}`}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Switch to {role === "admin" ? "Teacher" : "Admin"} Login
          </Link>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
