import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/authContext";
import { Link } from "react-router-dom";
//import "../styles/Rewards.css";
//import "../styles/Dashboard.css";
import "../css/reward.css";

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [currentReward, setCurrentReward] = useState(null);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchRewards = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get("http://localhost:5000/rewards", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setRewards(response.data.rewards);
          setCurrentReward(response.data.current_reward);
        } catch (error) {
          setError("Please start the challenge to view the rewards.");
        } finally {
          setLoading(false);
        }
      };

      fetchRewards();
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
      
      <div className="rewards-container">
        <h1>Rewards</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <div>
            <p>{error}</p>
            <Link to="/challenge">Go to Challenge Page</Link>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Reward ID</th>
                <th>Points Required</th>
                <th>Title</th>
                <th>Stars</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((reward) => (
                <tr
                  key={reward[0]}
                  className={
                    currentReward && currentReward[0] === reward[0]
                      ? "highlighted"
                      : ""
                  }
                >
                  <td data-label="Reward ID">{reward[0]}</td>
                  <td data-label="Points Required">{reward[1]}</td>
                  <td data-label="Title">{reward[2]}</td>
                  <td data-label="Stars" className="stars">
                    {"★".repeat(reward[3] + 1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default Rewards;
