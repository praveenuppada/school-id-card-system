// Username Storage Service for autocomplete functionality
class UsernameStorageService {
  constructor() {
    this.storageKey = 'saved_usernames'
  }

  // Save username for autocomplete
  saveUsername(username, role) {
    if (!username || username.trim() === '') return

    try {
      const stored = this.getSavedUsernames()
      const key = `${role}_${username}`
      
      // Store with timestamp
      stored[key] = {
        username: username.trim(),
        role: role,
        lastUsed: new Date().toISOString()
      }

      localStorage.setItem(this.storageKey, JSON.stringify(stored))

    } catch (error) {

    }
  }

  // Get all saved usernames
  getSavedUsernames() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {

      return {}
    }
  }

  // Get usernames for a specific role
  getUsernamesForRole(role) {
    const stored = this.getSavedUsernames()
    const usernames = []

    Object.values(stored).forEach(entry => {
      if (entry.role === role) {
        usernames.push({
          username: entry.username,
          lastUsed: entry.lastUsed
        })
      }
    })

    // Sort by last used (most recent first)
    return usernames.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
  }

  // Get autocomplete suggestions based on input
  getAutocompleteSuggestions(input, role) {
    if (!input || input.trim() === '') return []

    const usernames = this.getUsernamesForRole(role)
    const inputLower = input.toLowerCase().trim()

    return usernames
      .filter(entry => entry.username.toLowerCase().startsWith(inputLower))
      .map(entry => entry.username)
      .slice(0, 5) // Limit to 5 suggestions
  }

  // Get the most recent username for a role
  getLastUsedUsername(role) {
    const usernames = this.getUsernamesForRole(role)
    return usernames.length > 0 ? usernames[0].username : ''
  }

  // Remove a saved username
  removeUsername(username, role) {
    try {
      const stored = this.getSavedUsernames()
      const key = `${role}_${username}`
      delete stored[key]
      localStorage.setItem(this.storageKey, JSON.stringify(stored))

    } catch (error) {

    }
  }

  // Clear all saved usernames
  clearAllUsernames() {
    try {
      localStorage.removeItem(this.storageKey)

    } catch (error) {

    }
  }

  // Check if username exists for role
  hasUsername(username, role) {
    const stored = this.getSavedUsernames()
    const key = `${role}_${username}`
    return key in stored
  }
}

export default new UsernameStorageService()
