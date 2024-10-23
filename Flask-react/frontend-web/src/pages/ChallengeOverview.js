import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import ModalForm from "./ModalForm";
import "../css/overview.css";

const ChallengeOverview = () => {
  const { isAuthenticated } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [challengeStatus, setChallengeStatus] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleModalSuccess = () => {
    setModalOpen(false);
    navigate("/dashboard");
  };

  useEffect(() => {
    if (isAuthenticated) {
      const fetchChallengeStatus = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.post(
            "https://ecoinsights-backend.onrender.com/challenge_status",
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setChallengeStatus(response.data);

          if (response.data.status === "started") {
            // If challenge is already started, fetch the user challenges
            await fetchUserChallenges(token);
          }
        } catch (error) {
          console.error("Error fetching challenge status:", error);
          setError(error);
        }
      };

      fetchChallengeStatus();
    }
  }, [isAuthenticated]);

  const fetchUserChallenges = async (token) => {
    try {
      const challengeResponse = await axios.post(
        "https://ecoinsights-backend.onrender.com/fetch_user_challenge",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setChallenges(challengeResponse.data.data);
    } catch (error) {
      console.error("Error fetching user challenges:", error);
      setError(error);
    }
  };

  const getCurrentDate = () => {
    const date = new Date();
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  if (!isAuthenticated) return <p>Please log in to view this page.</p>;

  if (challengeStatus === null) return <p>Loading...</p>;

  if (error) return <p>Error: {error.message}</p>;

  if (challengeStatus.status === "not_started") {
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

        <div style={styles.container}>
          <h1>Welcome to the 21-Day Challenge Game!</h1>
          <p>Start your journey towards a more sustainable lifestyle.</p>
          <Link to="#" onClick={() => setModalOpen(true)}>
            Let's start the game!
          </Link>

          <ModalForm
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            onSuccess={handleModalSuccess}
          />
        </div>
      </>
    );
  }

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

      <div className="overview">
        <h1>User Challenges</h1>
        <table>
          <thead>
            <tr>
              <th>Challenge Day</th>
              <th>Description</th>
              <th>Status</th>
              <th>Points</th>
              <th>Points Won</th>
            </tr>
          </thead>
          <tbody>
            {challenges.map((challenge, index) => {
              const date = new Date(challenge.challenge_day);
              const options = {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              };
              const formattedDate = date.toLocaleDateString("en-US", options);

              return (
                <tr
                  key={index}
                  className={
                    formattedDate === getCurrentDate() ? "current-date-row" : ""
                  }
                >
                  <td>{formattedDate}</td>
                  <td>{challenge.description}</td>
                  <td>{challenge.status}</td>
                  <td>{challenge.points}</td>
                  <td>{challenge.points_won}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    textAlign: "center",
    padding: "20px",
  },
  links: {
    marginTop: "20px",
  },
  link: {
    margin: "10px",
    textDecoration: "none",
    color: "#007bff",
    fontSize: "18px",
  },
};

export default ChallengeOverview;
