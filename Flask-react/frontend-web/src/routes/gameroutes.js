import React from "react";
import { Route, Routes } from "react-router-dom";
import ChallengeOverview from "../pages/ChallengeOverview";
import DailyTask from "../pages/DailyTask";
import Rewards from "../pages/Reward";
import Leaderboard from "../pages/Leaderboard";
import Login from "../pages/login";
import ProtectedRoute from "../pages/ProtectedRoute";
import Home from "../pages/home";
import Register from "../pages/register";
import GameDashboard from "../pages/Game";

const AppRouter = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <GameDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/challenge"
        element={
          <ProtectedRoute>
            <ChallengeOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/task"
        element={
          <ProtectedRoute>
            <DailyTask />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rewards"
        element={
          <ProtectedRoute>
            <Rewards />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRouter;
