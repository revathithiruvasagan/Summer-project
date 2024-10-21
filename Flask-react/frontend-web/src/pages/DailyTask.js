import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Ensure you have react-router-dom installed
import { useAuth } from "../context/authContext";
//import "../styles/DailyTask.css";
import "../css/Dashboard.css";

const DailyTask = () => {
  const [task, setTask] = useState(null);
  const [taskStatus, setTaskStatus] = useState(null); // To track task completion status
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const fetchTodayTask = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            "http://localhost:5000/fetch_today",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setTask(response.data.task);

          // Check task status
          const statusResponse = await axios.get(
            "http://localhost:5000/task_status",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setTaskStatus(statusResponse.data.status);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            setError("No task found for today. Please start the challenge.");
          } else {
            setError("Error fetching task");
          }
        } finally {
          setLoading(false);
        }
      };

      fetchTodayTask();
    }
  }, [isAuthenticated]);

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/complete_task",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTaskStatus("completed");
      setError("Task completed! Points added.");
    } catch (error) {
      setError("Error completing task");
    }
  };

  const handleRevoke = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/revoke_task",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTaskStatus(null);
      setError("Task completion revoked. Points removed.");
    } catch (error) {
      setError("Error revoking task");
    }
  };

  return (
    <>
      <div className="dashboard">
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
            <li>
              <Link to="/" onClick={() => localStorage.removeItem("token")}>
                Logout
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div>
        <h1>Daily Task</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <div>
            <p>{error}</p>
            <Link to="/challenge">Go to Challenge Page</Link>
          </div>
        ) : (
          <div>
            <p>{task}</p>
            {taskStatus === "completed" ? (
              <div>
                <p>You have already completed the task.</p>
                <button onClick={handleRevoke}>Revoke</button>
              </div>
            ) : (
              <button onClick={handleComplete}>Completed</button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default DailyTask;
