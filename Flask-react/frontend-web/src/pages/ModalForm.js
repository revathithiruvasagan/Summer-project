import React, { useState } from "react";
import axios from "axios";
import "../css/ModalForm.css";

const ModalForm = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem("token");

      // Start the challenge
      const response = await axios.post(
        "http://localhost:5000/start_challenge",
        { name: name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Challenge started successfully!");

      // Check if the challenge was started successfully
      if (response.data.success) {
        const challengeId = response.data.challenge_id;

        // Populate the user_challenges table
        await axios.post(
          "http://localhost:5000/user_challenge",
          { challenge_id: challengeId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("data fetched successfully!");
      } else {
        alert("Failed to start the challenge.");
      }

      if (response.status === 200) {
        alert("Name saved successfully");
        setName("");
        onSuccess();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    }
  };

  return (
    <div className={`modal ${isOpen ? "open" : ""}`}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <h2>Enter Your Name</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default ModalForm;
