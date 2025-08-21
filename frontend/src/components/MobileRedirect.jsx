import { useEffect } from 'react'

const MobileRedirect = ({ to, children }) => {
  useEffect(() => {
    console.log("🔄 MobileRedirect: Redirecting to", to)
    
    // Detect mobile browsers
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      console.log("📱 Mobile browser detected, using window.location")
      // For mobile browsers, use window.location for more reliable navigation
      setTimeout(() => {
        window.location.href = to
      }, 100)
    } else {
      console.log("💻 Desktop browser detected, using standard navigation")
      // For desktop browsers, we can rely on React Router
      window.location.href = to
    }
  }, [to])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}

export default MobileRedirect
