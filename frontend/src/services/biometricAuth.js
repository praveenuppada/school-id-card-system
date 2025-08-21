// Biometric Authentication Service using WebAuthn API
class BiometricAuthService {
  constructor() {
    this.isSupported = this.checkSupport()
  }

  // Check if WebAuthn is supported
  checkSupport() {
    return window.PublicKeyCredential && 
           window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable &&
           window.PublicKeyCredential.isConditionalMediationAvailable
  }

  // Check if biometric authentication is available
  async isBiometricAvailable() {
    if (!this.isSupported) return false
    
    try {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    } catch (error) {
      console.error('Error checking biometric availability:', error)
      return false
    }
  }

  // Check if conditional mediation (auto-fill) is available
  async isConditionalMediationAvailable() {
    if (!this.isSupported) return false
    
    try {
      return await window.PublicKeyCredential.isConditionalMediationAvailable()
    } catch (error) {
      console.error('Error checking conditional mediation:', error)
      return false
    }
  }

  // Register biometric credentials for a user
  async registerBiometric(username, password, role) {
    if (!this.isSupported) {
      throw new Error('Biometric authentication not supported on this device')
    }

    try {
      // Create challenge from server (simplified for demo)
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      const publicKeyOptions = {
        challenge: challenge,
        rp: {
          name: "Harsha ID Solutions",
          id: window.location.hostname
        },
        user: {
          id: new Uint8Array(16),
          name: username,
          displayName: `${role} - ${username}`
        },
        pubKeyCredParams: [
          {
            type: "public-key",
            alg: -7 // ES256
          }
        ],
        timeout: 60000,
        attestation: "direct",
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required"
        }
      }

      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions
      })

      // Store credential info locally
      const credentialData = {
        id: credential.id,
        type: credential.type,
        username: username,
        password: password,
        role: role,
        createdAt: new Date().toISOString()
      }

      localStorage.setItem('biometric_credential', JSON.stringify(credentialData))
      
      return {
        success: true,
        message: 'Biometric authentication registered successfully'
      }
    } catch (error) {
      console.error('Error registering biometric:', error)
      throw new Error('Failed to register biometric authentication')
    }
  }

  // Authenticate using biometric
  async authenticateBiometric() {
    if (!this.isSupported) {
      throw new Error('Biometric authentication not supported on this device')
    }

    try {
      const storedCredential = localStorage.getItem('biometric_credential')
      if (!storedCredential) {
        throw new Error('No biometric credentials found')
      }

      const credentialData = JSON.parse(storedCredential)

      // Create challenge for authentication
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      const assertionOptions = {
        challenge: challenge,
        rpId: window.location.hostname,
        allowCredentials: [
          {
            type: "public-key",
            id: this.base64ToArrayBuffer(credentialData.id),
            transports: ["internal"]
          }
        ],
        userVerification: "required",
        timeout: 60000
      }

      const assertion = await navigator.credentials.get({
        publicKey: assertionOptions
      })

      return {
        success: true,
        username: credentialData.username,
        password: credentialData.password,
        role: credentialData.role
      }
    } catch (error) {
      console.error('Error authenticating with biometric:', error)
      throw new Error('Biometric authentication failed')
    }
  }

  // Check if user has registered biometric credentials
  hasStoredCredentials() {
    return localStorage.getItem('biometric_credential') !== null
  }

  // Get stored credential info
  getStoredCredential() {
    const stored = localStorage.getItem('biometric_credential')
    return stored ? JSON.parse(stored) : null
  }

  // Remove stored biometric credentials
  removeStoredCredentials() {
    localStorage.removeItem('biometric_credential')
  }

  // Utility function to convert base64 to ArrayBuffer
  base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  // Utility function to convert ArrayBuffer to base64
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }
}

export default new BiometricAuthService()
