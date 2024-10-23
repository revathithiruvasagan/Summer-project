import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/authContext";
import { Link } from "react-router-dom";
import "../css/leaderboard.css"; // Assuming we will add the styles here

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const fetchLeaderboard = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            "https://ecoinsights-backend.onrender.com/leaderboard",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setLeaderboard(response.data);
        } catch (error) {
          setError("Error fetching leaderboard");
        }
      };

      fetchLeaderboard();
    }
  }, [isAuthenticated]);

  return (
    <>
      <div>
        <nav className="navbar">
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
            <li>
              <Link to="/" onClick={() => localStorage.removeItem("token")}>
                Logout
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="leaderboard-container">
        <h1>Leaderboard</h1>
        {error ? (
          <p>{error}</p>
        ) : (
          <div className="leaderboard-table">
            {leaderboard.map((user, index) => (
              <div
                key={user.user_name}
                className={`leaderboard-item rank-${index + 1}`}
              >
                <div className="rank-badge">
                  <span>{index + 1}</span>
                </div>
                <div className="user-info">
                  <span className="user-name">{user.user_name}</span>
                  <span className="total-points">{user.total_points} pts</span>
                  <span className="stars">{"★".repeat(user.stars)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Leaderboard;
