// Mobile browser detection utility
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Mobile-specific navigation
export const mobileNavigate = (path) => {
  if (isMobile()) {
  
    window.location.href = path
  } else {
  
    // For desktop, we'll use React Router
    return path
  }
}

// Mobile-specific redirect
export const mobileRedirect = (path) => {

  window.location.href = path
}
