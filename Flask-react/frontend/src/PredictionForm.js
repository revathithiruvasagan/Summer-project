import React, { useState } from "react";

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
    const response = await fetch("/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: Object.values(input).map(Number) }),
    });
    const data = await response.json();
    setPrediction(data.prediction);
  };

  const handleCountryChange = (e) => {
    setCountry(e.target.value);
  };

  const fetchGraph = async () => {
    if (country) {
      const response = await fetch(
        `/plot?country=${encodeURIComponent(country)}`
      );
      if (response.ok) {
        const blob = await response.blob();
        setGraphUrl(URL.createObjectURL(blob));
      } else {
        alert("Error fetching graph.");
      }
    }
  };

  const fetchTop10Graph = async () => {
    const response = await fetch(`/top10plot`);
    if (response.ok) {
      const blob = await response.blob();
      setTop10GraphUrl(URL.createObjectURL(blob));
    } else {
      alert("Error fetching top 10 countries graph.");
    }
  };

  return (
    <div>
      <h1>ML Model Prediction</h1>
      <form onSubmit={handleSubmit}>
        {Object.keys(input).map((key) => (
          <div key={key}>
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
        <button type="submit">Predict</button>
      </form>
      {prediction && <p>Prediction: {prediction}</p>}

      <h2>Emissions Graph</h2>
      <label>
        Select Country:
        <input type="text" value={country} onChange={handleCountryChange} />
      </label>
      <button onClick={fetchGraph}>Fetch Graph</button>
      {graphUrl && (
        <img
          src={graphUrl}
          alt="Emissions Graph"
          style={{ maxWidth: "100%" }}
        />
      )}

      <h2>Top 10 Countries Emissions Graph</h2>
      <button onClick={fetchTop10Graph}>Fetch Top 10 Graph</button>
      {top10GraphUrl && (
        <img
          src={top10GraphUrl}
          alt="Top 10 Countries Emissions Graph"
          style={{ maxWidth: "100%" }}
        />
      )}
    </div>
  );
};

export default PredictionForm;
