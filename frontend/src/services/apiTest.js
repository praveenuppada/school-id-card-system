// API Testing Service for debugging connection issues
import axios from "axios"

class ApiTestService {
  constructor() {
    this.baseURL = "https://web-production-6c52b.up.railway.app/api"
  }

  // Test basic connectivity
  async testConnection() {
    console.log("🔍 Testing API connection...")
    
    try {
      // Test without /api suffix
      const testURL1 = "https://web-production-6c52b.up.railway.app"
      console.log("Testing URL 1:", testURL1)
      
      const response1 = await fetch(testURL1, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log("✅ URL 1 Response:", response1.status, response1.statusText)
      
      // Test with /api suffix
      const testURL2 = "https://web-production-6c52b.up.railway.app/api"
      console.log("Testing URL 2:", testURL2)
      
      const response2 = await fetch(testURL2, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log("✅ URL 2 Response:", response2.status, response2.statusText)
      
      return {
        url1: { status: response1.status, ok: response1.ok },
        url2: { status: response2.status, ok: response2.ok }
      }
      
    } catch (error) {
      console.error("❌ Connection test failed:", error)
      return { error: error.message }
    }
  }

  // Test different auth endpoints
  async testAuthEndpoints() {
    console.log("🔍 Testing auth endpoints...")
    
    const endpoints = [
      "/auth/login",
      "/api/auth/login",
      "/auth/me",
      "/api/auth/me",
      "/health",
      "/api/health"
    ]
    
    const results = {}
    
    for (const endpoint of endpoints) {
      try {
        const fullURL = `https://web-production-6c52b.up.railway.app${endpoint}`
        console.log(`Testing: ${fullURL}`)
        
        const response = await fetch(fullURL, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        results[endpoint] = {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        }
        
        console.log(`✅ ${endpoint}: ${response.status} ${response.statusText}`)
        
      } catch (error) {
        results[endpoint] = {
          error: error.message
        }
        console.log(`❌ ${endpoint}: ${error.message}`)
      }
    }
    
    return results
  }

  // Test login with sample credentials
  async testLogin() {
    console.log("🔍 Testing login functionality...")
    
    const testData = {
      username: "test",
      password: "test",
      role: "ROLE_ADMIN"
    }
    
    try {
      const response = await fetch("https://web-production-6c52b.up.railway.app/api/auth/login", {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })
      
      const data = await response.text()
      
      console.log("✅ Login test response:", {
        status: response.status,
        statusText: response.statusText,
        data: data
      })
      
      return {
        status: response.status,
        ok: response.ok,
        data: data
      }
      
    } catch (error) {
      console.error("❌ Login test failed:", error)
      return { error: error.message }
    }
  }

  // Check CORS headers
  async checkCORS() {
    console.log("🔍 Checking CORS configuration...")
    
    try {
      const response = await fetch("https://web-production-6c52b.up.railway.app/api/auth/login", {
        method: 'OPTIONS',
        mode: 'cors',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        }
      })
      
      const headers = {}
      for (const [key, value] of response.headers.entries()) {
        headers[key] = value
      }
      
      console.log("✅ CORS preflight response:", {
        status: response.status,
        headers: headers
      })
      
      return {
        status: response.status,
        headers: headers
      }
      
    } catch (error) {
      console.error("❌ CORS check failed:", error)
      return { error: error.message }
    }
  }

  // Run all tests
  async runAllTests() {
    console.log("🚀 Running comprehensive API tests...")
    
    const results = {
      connection: await this.testConnection(),
      endpoints: await this.testAuthEndpoints(),
      login: await this.testLogin(),
      cors: await this.checkCORS()
    }
    
    console.log("📊 Complete test results:", results)
    return results
  }
}

export default new ApiTestService()
