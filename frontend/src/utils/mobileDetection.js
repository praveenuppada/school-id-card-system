// Mobile browser detection utility
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Mobile-specific navigation
export const mobileNavigate = (path) => {
  if (isMobile()) {
    console.log("📱 Mobile navigation to:", path)
    window.location.href = path
  } else {
    console.log("💻 Desktop navigation to:", path)
    // For desktop, we'll use React Router
    return path
  }
}

// Mobile-specific redirect
export const mobileRedirect = (path) => {
  console.log("🔄 Mobile redirect to:", path)
  window.location.href = path
}
