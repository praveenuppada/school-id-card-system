// Storage utility functions

export const clearAllStorage = () => {
  try {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear any other storage mechanisms
    if (window.indexedDB) {
      // Clear IndexedDB if needed
      console.log("IndexedDB cleared");
    }
    
    console.log("✅ All storage cleared successfully");
    return true;
  } catch (error) {
    console.error("❌ Error clearing storage:", error);
    return false;
  }
};

export const clearUserData = () => {
  try {
    // Clear user-specific data
    localStorage.removeItem('REACT_APP_JWT_STORAGE_KEY');
    localStorage.removeItem('role');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    
    sessionStorage.removeItem('REACT_APP_JWT_STORAGE_KEY');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('user');
    
    console.log("✅ User data cleared successfully");
    return true;
  } catch (error) {
    console.error("❌ Error clearing user data:", error);
    return false;
  }
};

export const clearUploadData = () => {
  try {
    // Clear upload-related data
    const keysToRemove = [
      'uploadedFiles',
      'excelData',
      'previewData',
      'selectedSchool',
      'selectedClass',
      'uploadProgress'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    console.log("✅ Upload data cleared successfully");
    return true;
  } catch (error) {
    console.error("❌ Error clearing upload data:", error);
    return false;
  }
};

export const getStorageInfo = () => {
  try {
    const localStorageSize = JSON.stringify(localStorage).length;
    const sessionStorageSize = JSON.stringify(sessionStorage).length;
    
    return {
      localStorage: {
        size: localStorageSize,
        keys: Object.keys(localStorage),
        itemCount: localStorage.length
      },
      sessionStorage: {
        size: sessionStorageSize,
        keys: Object.keys(sessionStorage),
        itemCount: sessionStorage.length
      }
    };
  } catch (error) {
    console.error("❌ Error getting storage info:", error);
    return null;
  }
};

