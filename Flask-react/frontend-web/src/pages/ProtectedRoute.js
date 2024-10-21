import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext"; // Assume you have an auth context

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
