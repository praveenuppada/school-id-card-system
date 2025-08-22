import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://web-production-6c52b.up.railway.app/api"


// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL
axios.defaults.timeout = 30000 // 30 seconds timeout
axios.defaults.headers.common['Content-Type'] = 'application/json'





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
    const initializeAuth = async () => {
      const token = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")
      
      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
          
          // Validate token with backend
          await validateToken()
        } catch (error) {
          console.error('Token validation failed:', error)
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          delete axios.defaults.headers.common["Authorization"]
        }
      } else {
        setLoading(false)
      }
    }
    
    initializeAuth()
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
      

      
      
      const response = await axios.post("/auth/login", {
        username,
        password,
        role: role === "admin" ? "ROLE_ADMIN" : "ROLE_TEACHER",
      })

  

      if (response.data.success) {
        const { token, user } = response.data

        // Store token and set axios header
        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(user))
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

        setUser(user)
  
        return { success: true }
      } else {
  
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      

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
