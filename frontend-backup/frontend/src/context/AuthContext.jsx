import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('REACT_APP_JWT_STORAGE_KEY'));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    console.log("🔐 Initial user state - savedUser from localStorage:", savedUser);
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    console.log("🔐 Initial user state - parsed user:", parsedUser);
    return parsedUser;
  });

  useEffect(() => {
    setToken(localStorage.getItem('REACT_APP_JWT_STORAGE_KEY'));
    setRole(localStorage.getItem("role"));
  }, []);

  const login = (jwt, userRoles, userData) => {
    console.log("🔐 AuthContext.login called with:", { jwt, userRoles, userData });
    
    localStorage.setItem('REACT_APP_JWT_STORAGE_KEY', jwt);
    // Store the first role as a string for compatibility
    const primaryRole = Array.isArray(userRoles) ? userRoles[0] : userRoles;
    localStorage.setItem("role", primaryRole);
    
    // Store user data
    if (userData) {
      console.log("🔐 Storing user data:", userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } else {
      console.log("🔐 No user data provided to login");
    }
    
    setToken(jwt);
    setRole(primaryRole);
    
    console.log("🔐 After login - localStorage user:", localStorage.getItem('user'));
  };

  const logout = () => {
    localStorage.removeItem('REACT_APP_JWT_STORAGE_KEY');
    localStorage.removeItem("role");
    localStorage.removeItem('user');
    // DON'T clear teacher photos - they should persist across sessions
    // localStorage.removeItem('teacherStudentPhotos');
    // localStorage.removeItem('teacherSchoolName');
    setToken(null);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
