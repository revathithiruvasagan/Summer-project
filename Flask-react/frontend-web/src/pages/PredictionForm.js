import React, { useState } from "react";
import axios from "axios";
import "../css/predictionform.css";

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
      const response = await axios.post("http://127.0.0.1:5000/predict", {
        input: Object.values(input).map(Number),
      });
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
        const response = await axios.get("http://127.0.0.1:5000/plot", {
          params: { country },
          responseType: "blob",
        });
        setGraphUrl(URL.createObjectURL(response.data));
      } catch (error) {
        alert("Error fetching graph.");
        console.error("Error fetching graph:", error);
      }
    }
  };

  const fetchTop10Graph = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/top10plot", {
        responseType: "blob",
      });
      setTop10GraphUrl(URL.createObjectURL(response.data));
    } catch (error) {
      alert("Error fetching top 10 countries graph.");
      console.error("Error fetching top 10 graph:", error);
    }
  };

  return (
    <div className="prediction-form-page">
      <h1>Carbon Emissions Prediction Tool</h1>

      {/* Description section */}
      <div className="description-section">
        <p>
          &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Welcome to the Carbon
          Emissions Prediction Tool, an advanced platform designed to provide
          precise insights into global CO2 emissions. By utilizing historical
          data from key sources such as coal, oil, gas, cement production, gas
          flaring, and other industrial activities, this tool leverages
          cutting-edge machine learning models to forecast future emission
          levels.
        </p>
        <p>
          &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Users can input specific data
          related to a country's annual emissions, enabling the model to
          generate accurate predictions for future CO2 levels. For example, data
          for Armenia in the year 1982 includes figures like 7.739 million tons
          from coal, 0.805 million tons from oil, 4.348 million tons from gas,
          2.234 million tons from cement production, and 0.270 million tons from
          gas flaring. These inputs allow for precise forecasting based on
          comprehensive historical data.
        </p>
        <p>
          &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;This tool is invaluable for
          researchers, environmental policymakers, and sustainability experts
          who are seeking to understand and mitigate the impact of human
          activities on carbon emissions. By entering real-world data, users can
          explore trends and predict future emission scenarios, facilitating
          informed decisions and policy-making in the fight against climate
          change.
        </p>
        <p>
          &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; In addition to prediction
          capabilities, the platform offers detailed visualizations that
          showcase emission trends for specific countries, helping users to
          analyze historical patterns and deviations in CO2 emissions over time.
          By selecting a country, you can generate graphs that compare its
          emission trajectory with global data, providing a clear visual
          representation of its impact on global emissions.
        </p>
      </div>

      {/* Calculation section */}
      <div className="calculation-section">
        <form onSubmit={handleSubmit}>
          <div className="input-row">
            {Object.keys(input).map((key) => (
              <div className="input-field" key={key}>
                <label>
                  {key}:
                  <input
                    type="text"
                    name={key}
                    value={input[key]}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>
            ))}
          </div>
          <button type="submit">Predict</button>
        </form>
        {prediction && <p>Prediction: {prediction}</p>}
      </div>

      {/* Emissions Graph Section */}
      <div className="qna-description">
        <h2>Country Emissions Graph</h2>
        <p>
          Select a country to view its historical CO2 emissions and visualize
          trends over time.
        </p>
        <label>
          Country:
          <input type="text" value={country} onChange={handleCountryChange} />
        </label>
        <button onClick={fetchGraph}>Fetch Graph</button>

        {graphUrl && (
          <div className="graph-container">
            <img src={graphUrl} alt="Country Emissions Graph" />
          </div>
        )}
      </div>
      {/* Top 10 Countries Graph */}
      <div className="qna-description">
        <h2>Top 10 Countries by CO2 Emissions</h2>
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
      <div className="qna-description">
        <h2>Frequently Asked Questions</h2>
        <p>
          <strong>Q:</strong> What kind of emissions data is required?
          <br />
          <strong>A:</strong> Please provide emissions data in million tons for
          coal, oil, gas, cement, flaring, and other sources for a particular
          year.
        </p>
        <p>
          <strong>Q:</strong> How can I view the emissions graph?
          <br />
          <strong>A:</strong> Select a country and click "Fetch Graph" to view
          the emissions trend over time.
        </p>
      </div>
    </div>
  );
};

export default PredictionForm;
