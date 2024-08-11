
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, loginFailure } from "../redux/userActions";
import InputField from "../components/InputField";
import Checkbox from "../components/Checkbox";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");
    setServerError("");

    if (!validateEmail(email)) {
      setEmailError("Invalid email address.");
      isValid = false;
    }

    if (password.length === 0) {
      setPasswordError("Password cannot be empty.");
      isValid = false;
    }

    return isValid;
  };

  const logInUser = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:5000/login", {
        email: email,
        password: password,
      });
      console.log(response);
      dispatch(loginSuccess(response.data));
      navigate("/home");
    } catch (error) {
      console.log(error, "error");
      if (error.response && error.response.status === 401) {
        setServerError(
          "Invalid credentials. Please check your email and password."
        );
        dispatch(loginFailure("Invalid credentials"));
      } else {
        setServerError("An error occurred. Please try again.");
        dispatch(loginFailure("An error occurred"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Log Into Your Account</h2>

      <InputField
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        id="loginEmail"
        placeholder="Enter a valid email address"
        label="Email address"
      />
      {emailError && <p style={{ color: "red" }}>{emailError}</p>}

      <InputField
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        id="loginPassword"
        placeholder="Enter password"
        label="Password"
      />
      {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}

      <div>
        <Checkbox id="rememberMe" label="Remember me" />
        <a href="#!" className="text-body">
          Forgot password?
        </a>
      </div>

      <div>
        <button type="button" onClick={logInUser} disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
        {serverError && <p style={{ color: "red" }}>{serverError}</p>}
        <p>
          Don't have an account?{" "}
          <a href="/register" className="link-danger">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
