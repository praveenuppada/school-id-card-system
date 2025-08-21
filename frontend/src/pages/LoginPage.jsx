import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Shield, User, Lock, ArrowLeft, Eye, EyeOff, Fingerprint, Smartphone } from "lucide-react"
import biometricAuth from "../services/biometricAuth"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("admin")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false)
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  // Check biometric availability on component mount
  useEffect(() => {
    const checkBiometric = async () => {
      const available = await biometricAuth.isBiometricAvailable()
      setBiometricAvailable(available)
      setHasStoredCredentials(biometricAuth.hasStoredCredentials())
      
      // Auto-show biometric prompt if credentials are stored
      if (available && biometricAuth.hasStoredCredentials()) {
        setShowBiometricPrompt(true)
      }
    }
    
    checkBiometric()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await login(email, password, role)

    if (result.success) {
      console.log("🚀 Login successful, preparing navigation...")
      
      // Offer to save biometric credentials for admin
      if (role === "admin" && biometricAvailable && !hasStoredCredentials) {
        try {
          await biometricAuth.registerBiometric(email, password, role)
          console.log("✅ Biometric credentials saved")
        } catch (error) {
          console.log("⚠️ Could not save biometric credentials:", error.message)
        }
      }
      
      const targetPath = role === "admin" ? "/admin" : "/teacher"
      console.log("🎯 Target path:", targetPath)
      
      // Use React Router navigate
      navigate(targetPath, { replace: true })
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  const handleBiometricLogin = async () => {
    setLoading(true)
    setError("")

    try {
      const result = await biometricAuth.authenticateBiometric()
      
      if (result.success) {
        const loginResult = await login(result.username, result.password, result.role)
        
        if (loginResult.success) {
          const targetPath = result.role === "admin" ? "/admin" : "/teacher"
          navigate(targetPath, { replace: true })
        } else {
          setError(loginResult.error)
        }
      }
    } catch (error) {
      setError("Biometric authentication failed. Please use password login.")
      setShowBiometricPrompt(false)
    }

    setLoading(false)
  }

  const handleSkipBiometric = () => {
    setShowBiometricPrompt(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Back to Home */}
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        {/* Biometric Login Prompt */}
        {showBiometricPrompt && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Fingerprint className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quick Login</h3>
              <p className="text-gray-600">Use your fingerprint or face ID to sign in</p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleBiometricLogin}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Fingerprint className="h-5 w-5" />
                <span>{loading ? "Authenticating..." : "Use Biometric Login"}</span>
              </button>
              
              <button
                onClick={handleSkipBiometric}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Use Password Instead
              </button>
            </div>
          </div>
        )}

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
              onClick={() => setRole("admin")}
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
              onClick={() => setRole("teacher")}
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
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={role === "admin" ? "Enter admin username" : "Enter teacher username"}
                  required
                />
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

            {/* Biometric Status */}
            {biometricAvailable && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    {hasStoredCredentials 
                      ? "Biometric login available - Use fingerprint or face ID" 
                      : "Biometric authentication supported - Will be saved after first login"
                    }
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
