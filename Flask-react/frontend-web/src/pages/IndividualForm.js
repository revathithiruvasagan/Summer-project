import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "../css/Individual.css";

const IndividualForm = () => {
  const [formData, setFormData] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const questions = [
    {
      question: "What is your gender?",
      type: "radio",
      options: [
        { label: "Female", value: 0 },
        { label: "Male", value: 1 },
        { label: "Other", value: 2 },
      ],
    },
    {
      question: "What is your body type?",
      type: "radio",
      options: [
        { label: "Underweight", value: 3 },
        { label: "Normal", value: 0 },
        { label: "Obese", value: 1 },
        { label: "Overweight", value: 2 },
      ],
    },
    {
      question: "What is your diet?",
      type: "radio",
      options: [
        { label: "Vegetarian", value: 3 },
        { label: "Omnivore", value: 0 },
        { label: "Pescatarian", value: 1 },
        { label: "Vegan", value: 2 },
      ],
    },
    {
      question: "How often do you shower?",
      type: "radio",
      options: [
        { label: "Daily", value: 0 },
        { label: "Less Often", value: 1 },
        { label: "More Often", value: 2 },
        { label: "Twice a Day", value: 3 },
      ],
    },
    {
      question: "What is your heating energy source?",
      type: "radio",
      options: [
        { label: "Natural Gas", value: 2 },
        { label: "Electricity", value: 1 },
        { label: "Wood", value: 3 },
        { label: "Coal/Oil", value: 0 },
      ],
    },
    {
      question: "What type of transport do you use?",
      type: "radio",
      options: [
        { label: "Public", value: 2 },
        { label: "Private", value: 0 },
        { label: "Walk/Bicycle", value: 1 },
      ],
    },
    {
      question: "What type of vehicle do you drive?",
      type: "radio",
      options: [
        { label: "Diesel", value: 0 },
        { label: "Electric", value: 1 },
        { label: "Hybrid", value: 2 },
        { label: "LPG", value: 3 },
        { label: "Petrol", value: 4 },
        { label: "none", value: 5 },
      ],
    },
    {
      question: "How often do you engage in social activities?",
      type: "radio",
      options: [
        { label: "Often", value: 1 },
        { label: "Sometimes", value: 2 },
        { label: "Rarely", value: 0 },
      ],
    },
    {
      question: "What is your monthly grocery bill?",
      type: "text",
    },
    {
      question: "How frequently do you travel by air?",
      type: "radio",
      options: [
        { label: "Frequently", value: 0 },
        { label: "Never", value: 1 },
        { label: "Very Frequently", value: 3 },
        { label: "Rarely", value: 2 },
      ],
    },
    {
      question: "What is your vehicle's monthly distance (in km)?",
      type: "text",
    },
    {
      question: "What is the size of your waste bag?",
      type: "radio",
      options: [
        { label: "Small", value: 3 },
        { label: "Medium", value: 2 },
        { label: "Large", value: 1 },
        { label: "Extra Large", value: 0 },
      ],
    },
    {
      question: "How many waste bags do you use weekly?",
      type: "text",
    },
    {
      question: "How many hours do you spend on TV/PC daily?",
      type: "text",
    },
    {
      question: "How many new clothes do you buy monthly?",
      type: "text",
    },
    {
      question: "How many hours do you spend on the Internet daily?",
      type: "text",
    },
    {
      question: "Is your home energy-efficient?",
      type: "radio",
      options: [
        { label: "Yes", value: 2 },
        { label: "No", value: 0 },
        { label: "Sometimes", value: 1 },
      ],
    },
    {
      question: "What do you primarily recycle?",
      type: "checkbox",
      options: [
        { label: "Metal", key: "Metal" },
        { label: "Plastic", key: "Plastic" },
        { label: "Paper", key: "Paper" },
        { label: "Glass", key: "Glass" },
      ],
    },
    {
      question: "What do you primarily use for cooking?",
      type: "checkbox",
      options: [
        { label: "Oven", key: "Oven" },
        { label: "Microwave", key: "Microwave" },
        { label: "Stove", key: "Stove" },
        { label: "Grill", key: "Grill" },
        { label: "Airfryer", key: "Airfryer" },
      ],
    },
    // Add other questions as needed
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prevData) => {
        const newValues = checked
          ? [...(prevData[name] || []), value]
          : (prevData[name] || []).filter((v) => v !== value);
        return { ...prevData, [name]: newValues };
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const calculateValue = (formData) => {
    const recyclingOptions = formData["What do you primarily recycle?"] || [];
    const cookingOptions =
      formData["What do you primarily use for cooking?"] || [];

    const recyclingKey = recyclingOptions.sort().join(",");
    const cookingKey = cookingOptions.sort().join(",");

    const customValuesCooking = {
      "": 15,
      Oven: 6,
      Microwave: 2,
      Stove: 14,
      "Microwave,Stove": 9,
      "Oven,Microwave": 5,
      "Oven,Stove": 13,
      "Grill,Airfryer": 0,
      "Oven,Microwave,Stove": 12,
      "Oven,Stove,Airfryer": 7,
      "Oven,Grill,Airfryer": 3,
      "Microwave,Grill,Airfryer": 1,
      "Oven,Microwave,Grill,Airfryer": 4,
      "Oven,Stove,Grill,Airfryer": 10,
      "Microwave,Stove,Grill,Airfryer": 8,
      "Oven,Microwave,Stove,Grill,Airfryer": 11,

      //imaginary values for the cooking options

      Grill: 16,
      Airfryer: 17,
      "Oven,Grill": 18,
      "Oven,Airfryer": 19,
      "Microwave,Grill": 20,
      "Microwave,Airfryer": 21,
      "Stove,Grill": 22,
      "Stove,Airfryer": 23,
      "Oven,Microwave,Grill": 24,
      "Oven,Microwave,Airfryer": 25,
      "Oven,Stove,Grill": 26,
      "Microwave,Stove,Grill": 27,
      "Microwave,Stove,Airfryer": 28,
      "Stove,Grill,Airfryer": 29,
      "Oven,Microwave,Stove,Grill": 30,
      "Oven,Microwave,Stove,Airfryer": 31,
    };

    const customValuesRecycling = {
      "": 15, // No items selected
      Plastic: 14,
      Glass: 1,
      Metal: 2,
      Paper: 10,
      "Plastic,Glass": 12,
      "Plastic,Metal": 13,
      "Plastic,Paper": 9,
      "Glass,Metal": 0,
      "Glass,Paper": 4,
      "Metal,Paper": 5,
      "Plastic,Glass,Metal": 11,
      "Plastic,Glass,Paper": 7,
      "Plastic,Metal,Paper": 8,
      "Glass,Metal,Paper": 3,
      "Plastic,Glass,Metal,Paper": 6,
    };

    const recyclingValue = customValuesRecycling[recyclingKey] || 0;
    const cookingValue = customValuesCooking[cookingKey] || 0;

    return {
      recyclingValue,
      cookingValue,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Calculate values
    const { recyclingValue, cookingValue } = calculateValue(formData);

    // Prepare payload
    const payload = {
      ...formData,
      recyclingValue, // Include the calculated value for recycling
      cookingValue, // Include the calculated value for cooking
    };

    try {
      // Send payload to backend
      const response = await axios.post(
        "http://localhost:5000/predictindividual",
        payload
      );
      setPrediction(response.data.prediction);
    } catch (error) {
      setError("Error making prediction. Please check your input values.");
    }
  };

  const renderCheckboxGroup = (question, options) => (
    <div className="input-group">
      <label>{question} :</label>
      <div className="checkbox-buttons">
        {options.map((option) => (
          <label key={option.key}>
            <br></br>
            <input
              type="checkbox"
              name={question}
              value={option.key}
              checked={(formData[question] || []).includes(option.key)}
              onChange={handleChange}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderRadioGroup = (question, options) => (
    <div className="input-group">
      <label>{question} :</label>
      <br></br>
      <div className="radio-buttons">
        {options.map((option) => (
          <button
            key={option.value}
            className={`radio-button ${
              formData[question] === option.value ? "selected" : ""
            }`}
            onClick={() =>
              setFormData({ ...formData, [question]: option.value })
            }
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderTextInput = (question) => (
    <div className="input-group">
      <label>{question}:</label>
      <br></br>
      <input
        type="text"
        name={question}
        value={formData[question] || ""}
        onChange={handleChange}
        placeholder={`Enter ${question.toLowerCase()}`}
      />
    </div>
  );

  return (
    <>
      <div className="individual">
        <h1>Carbon Footprint Calculator</h1>
        <form onSubmit={handleSubmit}>
          {questions.map((q, index) => (
            <div key={index} className="question-container">
              {q.type === "radio" && renderRadioGroup(q.question, q.options)}
              {q.type === "checkbox" &&
                renderCheckboxGroup(q.question, q.options)}
              {q.type === "text" && renderTextInput(q.question)}
            </div>
          ))}
          <button type="submit" className="submit-button">
            CALCULATE MY INDEX
          </button>
        </form>
        {prediction !== null && (
          <p className="result">
            Predicted Carbon Emission: {prediction.toFixed(2)}
          </p>
        )}
        {error && <p className="error">{error}</p>}
      </div>
    </>
  );
};

export default IndividualForm;
