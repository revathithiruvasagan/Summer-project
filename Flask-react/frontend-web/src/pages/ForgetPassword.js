// src/pages/ForgotPassword.js
import React, { useState } from "react";
import { useAuth } from "../context/authContext";
//import "../css/ForgetPassword.css"; // Create this CSS file for styling

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const { forgotPassword } = useAuth();
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setMessage(
        "If this email is registered, you will receive a password reset link."
      );
    } catch (error) {
      setMessage("Error sending password reset link. Please try again.");
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="container">
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit">Send Reset Link</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
