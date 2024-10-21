// src/pages/ResetPassword.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
//import "../css/ResetPassword.css"; // Create this CSS file for styling

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = new URLSearchParams(window.location.search).get("token");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/reset-password", {
        token,
        password,
      });
      setMessage("Password has been reset successfully.");
      navigate("/login");
    } catch (error) {
      setMessage("Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="reset-password-page">
      <div className="container">
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="password">New Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Reset Password</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
