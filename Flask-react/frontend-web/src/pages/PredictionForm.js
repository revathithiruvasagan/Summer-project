import React, { useState } from "react";
import axios from "axios";
import "../css/predictionform.css";
import Para1 from "../images/para1.png";
import Para3 from "../images/para3.png";

const PredictionForm = () => {
  const [input, setInput] = useState({
    Year: "",
    Coal: "",
    Oil: "",
    Gas: "",
    Cement: "",
    Flaring: "",
    Other: "",
  });
  const [prediction, setPrediction] = useState("");
  const [country, setCountry] = useState("");
  const [graphUrl, setGraphUrl] = useState("");
  const [top10GraphUrl, setTop10GraphUrl] = useState("");

  const handleChange = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Input data being sent:", input);
    try {
      const response = await axios.post(
        "https://ecoinsights-backend.onrender.com/predict",
        {
          input: Object.values(input).map(Number),
        }
      );
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error("Error during prediction:", error);
    }
  };

  const handleCountryChange = (e) => {
    setCountry(e.target.value);
  };

  const fetchGraph = async () => {
    if (country) {
      try {
        const response = await axios.get(
          "https://ecoinsights-backend.onrender.com/plot",
          {
            params: { country },
            responseType: "blob",
          }
        );
        setGraphUrl(URL.createObjectURL(response.data));
      } catch (error) {
        alert("Error fetching graph.");
        console.error("Error fetching graph:", error);
      }
    }
  };

  const fetchTop10Graph = async () => {
    try {
      const response = await axios.get(
        "https://ecoinsights-backend.onrender.com/top10plot",
        {
          responseType: "blob",
        }
      );
      setTop10GraphUrl(URL.createObjectURL(response.data));
    } catch (error) {
      alert("Error fetching top 10 countries graph.");
      console.error("Error fetching top 10 graph:", error);
    }
  };

  return (
    <div className="prediction-form-page">
      <h1>Carbon Emissions Prediction Tool</h1>

      <div className="description-section">
        <div className="para">
          <img src={Para1} alt="para1" className="image" />
          <p>
            &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Welcome to the Carbon
            Emissions Prediction Tool, an advanced platform designed to provide
            precise insights into global CO2 emissions. By utilizing historical
            data from key sources such as coal, oil, gas, cement production, gas
            flaring, and other industrial activities, this tool leverages
            cutting-edge machine learning models to forecast future emission
            levels.
          </p>
        </div>
        <br></br>
        <div className="para">
          <p>
            &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Users can input specific
            data related to a country's annual emissions, enabling the model to
            generate accurate predictions for future CO2 levels. For example,
            data for Armenia in the year 1982 includes figures like 7.739
            million tons from coal, 0.805 million tons from oil, 4.348 million
            tons from gas, 2.234 million tons from cement production, and 0.270
            million tons from gas flaring. These inputs allow for precise
            forecasting based on comprehensive historical data.
          </p>
          <img src={Para3} alt="para1" className="image" />
        </div>
      </div>

      <div className="calculation-section">
        <h3>Let's calculate the carbon footprint</h3>
        <form onSubmit={handleSubmit}>
          <div className="input-row">
            <div className="column">
              {Object.keys(input)
                .slice(0, Math.ceil(Object.keys(input).length / 2)) // First half of input fields
                .map((key) => (
                  <div className="input-field" key={key}>
                    <label>{key} :</label>
                    <input
                      type="text"
                      name={key}
                      value={input[key]}
                      onChange={handleChange}
                      required
                    />
                  </div>
                ))}
            </div>
            <div className="column">
              {Object.keys(input)
                .slice(Math.ceil(Object.keys(input).length / 2)) // Second half of input fields
                .map((key) => (
                  <div className="input-field" key={key}>
                    <label>{key} :</label>
                    <input
                      type="text"
                      name={key}
                      value={input[key]}
                      onChange={handleChange}
                      required
                    />
                  </div>
                ))}
            </div>
          </div>
          <button type="submit">Predict</button>
        </form>
        {prediction && <p>Prediction: {prediction}</p>}
      </div>

      <div className="qna-description">
        <h3>Country Emissions Graph</h3>
        <p>
          Select a country to view its historical CO2 emissions and visualize
          trends over time.
        </p>
        <label>
          Country:&nbsp; &nbsp;
          <input type="text" value={country} onChange={handleCountryChange} />
        </label>
        &nbsp; &nbsp;
        <button onClick={fetchGraph}>Fetch Graph</button>
        {graphUrl && (
          <div className="graph-container">
            <img src={graphUrl} alt="Country Emissions Graph" />
          </div>
        )}
      </div>
      {/* Top 10 Countries Graph */}
      <div className="qna-description">
        <h3>Top 10 Countries by CO2 Emissions</h3>
        <p>
          Analyze the top 10 countries with the highest CO2 emissions and their
          contribution to global emissions.
        </p>
        <button onClick={fetchTop10Graph}>Fetch Top 10 Graph</button>

        {top10GraphUrl && (
          <div className="graph-container">
            <img src={top10GraphUrl} alt="Top 10 Countries Emissions Graph" />
          </div>
        )}
      </div>

      {/* Q&A Section */}
    </div>
  );
};

export default PredictionForm;
