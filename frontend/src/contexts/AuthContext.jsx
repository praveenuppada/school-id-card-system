import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://web-production-6c52b.up.railway.app/api"
console.log("🔧 Environment check:", {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL: API_BASE_URL,
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV
})

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL
axios.defaults.timeout = 30000 // 30 seconds timeout
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log("🚀 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers
    })
    return config
  },
  (error) => {
    console.error("❌ Request interceptor error:", error)
    return Promise.reject(error)
  }
)

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      status: response.status,
      url: response.config.url,
      data: response.data
    })
    return response
  },
  (error) => {
    console.error("❌ API Error:", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    })
    return Promise.reject(error)
  }
)

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
      const response = await axios.get("/auth/me")
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
      console.log("🔐 Attempting login with:", { 
        username, 
        role, 
        baseURL: axios.defaults.baseURL,
        fullURL: `${axios.defaults.baseURL}/auth/login`
      })

      // First, test if the API is reachable
      try {
        console.log("🏥 Testing API health...")
        await axios.get("/health", { timeout: 5000 })
        console.log("✅ API is reachable")
      } catch (healthError) {
        console.warn("⚠️ Health check failed, proceeding with login attempt:", healthError.message)
      }
      
      const response = await axios.post("/auth/login", {
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
        },
        config: {
          baseURL: error.config?.baseURL,
          url: error.config?.url,
          method: error.config?.method
        }
      })

      let errorMessage = "Login failed. Please try again."
      
      if (error.code === "NETWORK_ERROR" || error.message.includes("Network Error")) {
        errorMessage = "Network error. Please check your internet connection and try again."
      } else if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        errorMessage = "Request timeout. The server is taking too long to respond."
      } else if (error.response?.status === 401) {
        errorMessage = "Invalid username or password. Please check your credentials."
      } else if (error.response?.status === 403) {
        errorMessage = "Access denied. Please contact administrator."
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later."
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      return {
        success: false,
        error: errorMessage,
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
