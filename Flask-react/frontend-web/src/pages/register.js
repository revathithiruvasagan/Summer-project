import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/Register.css";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "https://ecoinsights-backend.onrender.com/register",
        {
          email,
          password,
          rememberMe,
        }
      );
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      navigate("/login");
    } catch (error) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="register-page">
      <div className="container">
        <h2>Register</h2>
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
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="checkbox">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              {"  "}
              Remember Me
            </label>
            <a href="/forgot-password" className="link-danger">
              Forgot Password?
            </a>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit">Register</button>
        </form>
        <p className="text-body">
          Already have an account?{" "}
          <a href="/login" className="link-danger">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
