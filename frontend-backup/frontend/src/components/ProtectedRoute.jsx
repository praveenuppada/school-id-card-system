import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem('REACT_APP_JWT_STORAGE_KEY');
  const storedRole = localStorage.getItem("role");

  if (!token || !allowedRoles.includes(storedRole)) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}
