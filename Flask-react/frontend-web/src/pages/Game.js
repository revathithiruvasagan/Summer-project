import React from "react";
import { Link } from "react-router-dom";
import "../css/Game.css";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Welcome to Your Dashboard</h1>
      <nav>
        <ul>
          <li>
            <Link to="/challenge">Challenge Overview</Link>
          </li>
          <li>
            <Link to="/task">Daily Task</Link>
          </li>
          <li>
            <Link to="/rewards">Rewards</Link>
          </li>
          <li>
            <Link to="/leaderboard">Leaderboard</Link>
          </li>
          
        </ul>
      </nav>
    </div>
  );
};

export default Dashboard;
