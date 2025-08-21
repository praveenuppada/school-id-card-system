import api from "./api";

export const login = async (username, password) => {
  try {
    console.log("Attempting login with:", { username, password });
    console.log("Request URL:", `${api.defaults.baseURL}/auth/login`);
    
    const response = await api.post("/auth/login", { username, password });
    
    console.log("Login response:", response.data);
    console.log("Full response data keys:", Object.keys(response.data));
    console.log("Response data.user:", response.data.user);
    console.log("Response data.schoolName:", response.data.schoolName);
    console.log("Response data.school:", response.data.school);
    
    // Backend returns { token: "jwt_token", role: "ROLE_ADMIN" }
    const token = response.data.token;
    const backendRole = response.data.role;
    
    // Map backend roles to frontend roles
    let roles;
    if (backendRole === "ROLE_ADMIN") {
      roles = ["ADMIN"];
    } else if (backendRole === "ROLE_TEACHER") {
      roles = ["TEACHER"];
    } else {
      roles = ["TEACHER"]; // default fallback
    }
    
    console.log("Mapped roles:", roles);
    
    return {
      token,
      roles,
      user: response.data.user || {
        username: username,
        schoolName: response.data.schoolName || response.data.school?.name || response.data.schoolName
      }
    };
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    console.error("Error status:", error.response?.status);
    console.error("Error headers:", error.response?.headers);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('REACT_APP_JWT_STORAGE_KEY');
};