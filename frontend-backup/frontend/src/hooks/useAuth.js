// src/hooks/useAuth.js
import { useState, useEffect } from "react";

export default function useAuth() {
  const JWT_STORAGE_KEY = 'REACT_APP_JWT_STORAGE_KEY';

  const [token, setToken] = useState(localStorage.getItem(JWT_STORAGE_KEY));
  const [role, setRole] = useState(localStorage.getItem("role"));

  // The useEffect is not needed here as useState is already initialized
  // with the value from localStorage on the first render.
  // It could be used if you wanted to update the state when localStorage changes
  // outside of this component, but that's a more advanced use case.

  return { token, role };
}