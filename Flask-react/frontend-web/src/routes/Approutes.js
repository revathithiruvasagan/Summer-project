// src/AppRoutes.js
import React from "react";
import { Route, Routes } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/login";
import RegisterPage from "../pages/register";
import Home from "../pages/home";
import PredictionForm from "../pages/PredictionForm";
import IndividualForm from "../pages/IndividualForm";
import Chatbot from "../pages/Chatbot";
import Game from "../pages/Game";
import ProtectedRoute from "../pages/ProtectedRoute";
import StartGame from "../pages/StartGame";
import ForgotPassword from "../pages/ForgetPassword"; // Import ForgotPassword
import ResetPassword from "../pages/ResetPassword"; // Import ResetPassword

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />{" "}
      {/* New Route */}
      <Route path="/reset-password" element={<ResetPassword />} />{" "}
      {/* New Route */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/global"
        element={
          <ProtectedRoute>
            <PredictionForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/individual"
        element={
          <ProtectedRoute>
            <IndividualForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chatbot"
        element={
          <ProtectedRoute>
            <Chatbot />
          </ProtectedRoute>
        }
      />
      <Route
        path="/game"
        element={
          <ProtectedRoute>
            <Game />
          </ProtectedRoute>
        }
      />
      <Route
        path="/startgame"
        element={
          <ProtectedRoute>
            <StartGame />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
