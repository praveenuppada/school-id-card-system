import { useEffect } from 'react'

const MobileRedirect = ({ to, children }) => {
  useEffect(() => {
  
    
    // Always use window.location for mobile redirects
  
    window.location.href = to
  }, [to])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
        <p className="text-sm text-gray-500 mt-2">If you're not redirected automatically, <a href={to} className="text-blue-600">click here</a></p>
      </div>
    </div>
  )
}

export default MobileRedirect
