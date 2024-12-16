import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "../css/Chatbot.css";

const Chatbot = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState(null);

  const chatEndRef = useRef(null); // Initialize chatEndRef using useRef

  const handleSend = async (e) => {
    e.preventDefault();

    setError(null);
    const trimmedInput = userInput.trim();

    if (trimmedInput === "") {
      setError("Please enter a message.");
      return;
    }

    console.log("Sending message:", trimmedInput);

    try {
      const response = await axios.post(
        "https://ecoinsights-backend.onrender.com/ask",
        {
          message: trimmedInput,
        }
      );

      console.log("Response from backend:", response.data);

      setChatHistory((prevHistory) => [
        ...prevHistory,
        { user: trimmedInput, bot: response.data.response },
      ]);

      setUserInput(""); // Clear the input field after sending
    } catch (error) {
      setError("Error communicating with chatbot.");
      console.error("Error communicating with backend:", error);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <div className="chatbot-container">
      <div className="chat-header">It's GreenBot Here</div>
      <div className="chat-history">
        {chatHistory.length === 0 && (
          <p className="no-chat">
            <img
              src="path/to/your/image.jpg"
              alt="No Chat History Yet We Can Add Our Image"
            />
          </p>
        )}
        {chatHistory.map((entry, index) => (
          <div key={index} className="chat-entry">
            <div className="user-message">{entry.user}</div>
            <div className="bot-message">{entry.bot}</div>
          </div>
        ))}
        <div ref={chatEndRef}></div> {/* Assign chatEndRef to a div */}
      </div>
      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message here"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Chatbot;
