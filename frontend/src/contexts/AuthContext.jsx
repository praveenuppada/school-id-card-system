import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://web-production-6c52b.up.railway.app"
console.log("Environment check:", {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL: API_BASE_URL,
  allEnv: import.meta.env
})
axios.defaults.baseURL = API_BASE_URL

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("🔍 AuthContext initializing...")
    console.log("📱 User agent:", navigator.userAgent)
    console.log("🌐 Current location:", window.location.href)
    
    const token = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")
    
    console.log("💾 Stored token exists:", !!token)
    console.log("👤 Stored user exists:", !!storedUser)
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
        console.log("✅ User restored from storage:", userData)
      } catch (error) {
        console.error("❌ Error parsing stored user:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
    
    setLoading(false)
  }, [])

  const validateToken = async () => {
    try {
      const response = await axios.get("/api/auth/me")
      if (response.data.success) {
        setUser(response.data.user)
      } else {
        // Don't logout on validation failure, just clear the invalid token
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        delete axios.defaults.headers.common["Authorization"]
      }
    } catch (error) {
      console.error("Token validation failed:", error)
      // Don't logout on network errors, just clear the invalid token
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      delete axios.defaults.headers.common["Authorization"]
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password, role) => {
    try {
      console.log("🔐 Attempting login with:", { username, role, baseURL: axios.defaults.baseURL })
      
      const response = await axios.post("/api/auth/login", {
        username,
        password,
        role: role === "admin" ? "ROLE_ADMIN" : "ROLE_TEACHER",
      })

      console.log("✅ Login response:", response.data)

      if (response.data.success) {
        const { token, user } = response.data

        // Store token and set axios header
        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(user))
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

        setUser(user)
        console.log("🎉 Login successful, user set:", user)
        return { success: true }
      } else {
        console.log("❌ Login failed:", response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      console.error("❌ Login error:", error)
      console.log("🔍 Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        requestData: {
          username,
          password: password ? "***" : "undefined",
          role: role === "admin" ? "ROLE_ADMIN" : "ROLE_TEACHER"
        }
      })
      return {
        success: false,
        error: error.response?.data?.message || "Login failed. Please try again.",
      }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    delete axios.defaults.headers.common["Authorization"]
  }

  const value = {
    user,
    login,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
