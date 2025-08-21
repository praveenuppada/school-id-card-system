import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Shield, User, Lock, ArrowLeft, Eye, EyeOff, ChevronDown } from "lucide-react"
import usernameStorage from "../services/usernameStorage"


const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("admin")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState([])

  const { login } = useAuth()
  const navigate = useNavigate()

  // Load last used username on component mount
  useEffect(() => {
    const lastUsername = usernameStorage.getLastUsedUsername(role)
    if (lastUsername) {
      setEmail(lastUsername)
    }
  }, [role])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await login(email, password, role)

    if (result.success) {

      
      // Save username for future autocomplete
      usernameStorage.saveUsername(email, role)
      
      const targetPath = role === "admin" ? "/admin" : "/teacher"

      
      // Use React Router navigate
      navigate(targetPath, { replace: true })
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  // Handle username input changes and autocomplete
  const handleUsernameChange = (e) => {
    const value = e.target.value
    setEmail(value)
    
    // Get autocomplete suggestions
    const autocompleteSuggestions = usernameStorage.getAutocompleteSuggestions(value, role)
    setSuggestions(autocompleteSuggestions)
    setShowSuggestions(autocompleteSuggestions.length > 0 && value.length > 0)
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (username) => {
    setEmail(username)
    setShowSuggestions(false)
    setSuggestions([])
  }

  // Handle role change
  const handleRoleChange = (newRole) => {
    setRole(newRole)
    // Load last used username for the selected role
    const lastUsername = usernameStorage.getLastUsedUsername(newRole)
    if (lastUsername) {
      setEmail(lastUsername)
    } else {
      setEmail("")
    }
    setShowSuggestions(false)
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Back to Home */}
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>



        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => handleRoleChange("admin")}
              className={`p-4 rounded-lg border-2 transition-all ${
                role === "admin" 
                  ? "border-blue-500 bg-blue-50 text-blue-700" 
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto mb-2" />
                <div className="font-semibold">Admin Login</div>
                <div className="text-xs text-gray-500">School Management</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange("teacher")}
              className={`p-4 rounded-lg border-2 transition-all ${
                role === "teacher" 
                  ? "border-yellow-500 bg-yellow-50 text-yellow-700" 
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <div className="text-center">
                <User className="h-8 w-8 mx-auto mb-2" />
                <div className="font-semibold">Teacher Login</div>
                <div className="text-xs text-gray-500">Photo Management</div>
              </div>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {role === "admin" ? "Admin Username" : "Teacher Username"}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={email}
                  onChange={handleUsernameChange}
                  onFocus={() => {
                    const autocompleteSuggestions = usernameStorage.getAutocompleteSuggestions(email, role)
                    setSuggestions(autocompleteSuggestions)
                    setShowSuggestions(autocompleteSuggestions.length > 0 && email.length > 0)
                  }}
                  onBlur={() => {
                    // Delay hiding suggestions to allow clicks
                    setTimeout(() => setShowSuggestions(false), 150)
                  }}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={role === "admin" ? "Enter admin username" : "Enter teacher username"}
                  required
                />
                {suggestions.length > 0 && (
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                )}
                
                {/* Autocomplete Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                    {suggestions.map((username, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionSelect(username)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{username}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Username Autocomplete Info */}
            {usernameStorage.getUsernamesForRole(role).length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    Saved usernames available - Start typing to see suggestions
                  </span>
                </div>
              </div>
            )}
            </form>



        </div>
      </div>
    </div>
  )
}

export default LoginPage
