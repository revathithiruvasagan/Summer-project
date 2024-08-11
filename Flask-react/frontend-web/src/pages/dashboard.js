import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div>
      <h1 style={{ textAlign: "center", margin: "20px" }}>dashboard</h1>
      <p style={{ textAlign: "center" }}>
        <Link to="/login" style={{ marginRight: "10px" }}>
          Login
        </Link>
        <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
