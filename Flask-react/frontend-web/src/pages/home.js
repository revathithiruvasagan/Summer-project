import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../css/home.css";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faGlobe,
  faUser,
  faRobot,
  faGamepad,
  faSignOutAlt,
  faChevronLeft,
  faChevronRight,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";

const Home = () => {
  const [globalGraphUrl, setGlobalGraphUrl] = useState("");
  const [top10GraphUrl, setTop10GraphUrl] = useState("");
  const [countryGraphUrl, setCountryGraphUrl] = useState("");
  const [currentCountryIndex, setCurrentCountryIndex] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const countries = [
    "USA",
    "India",
    "China",
    "Russia",
    "Germany",
    "Japan",
    "Brazil",
    "Canada",
    "Australia",
  ];
  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };
  useEffect(() => {
    const fetchGlobalGraph = async () => {
      try {
        const response = await axios.get(
          "https://ecoinsights-backend.onrender.com/globalplot",
          {
            responseType: "blob",
          }
        );
        setGlobalGraphUrl(URL.createObjectURL(response.data));
      } catch (error) {
        console.error("Error fetching global graph:", error);
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
        console.error("Error fetching top 10 graph:", error);
      }
    };

    fetchGlobalGraph();
    fetchTop10Graph();
  }, []);

  useEffect(() => {
    const fetchCountryGraph = async (country) => {
      try {
        const params = new URLSearchParams();
        params.append("countries", country);

        const response = await axios.get(
          "https://ecoinsights-backend.onrender.com/homeplot",
          {
            params: params,
            responseType: "blob",
          }
        );
        setCountryGraphUrl(URL.createObjectURL(response.data));
      } catch (error) {
        console.error("Error fetching country graph:", error);
      }
    };

    fetchCountryGraph(countries[currentCountryIndex]);
  }, [currentCountryIndex, countries]);

  const handleNext = () => {
    setCurrentCountryIndex((prevIndex) => (prevIndex + 1) % countries.length);
  };

  const handlePrevious = () => {
    setCurrentCountryIndex(
      (prevIndex) => (prevIndex - 1 + countries.length) % countries.length
    );
  };

  return (
    <div className="homepage">
      <div className="sidebar">
        <p
          style={{
            fontSize: "20px",
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 800,
          }}
        >
          {" "}
          <img
            src={require("../images/logo.png")}
            alt="logo"
            className="logoImage"
            style={{
              width: "24px",
              height: "auto",
              marginRight: "2px",
            }}
          ></img>{" "}
          EcoInSights
        </p>

        <Link to="/home">
          <FontAwesomeIcon icon={faHome} /> &nbsp;&nbsp;&nbsp;&nbsp;Home
        </Link>
        <Link to="/global">
          <FontAwesomeIcon icon={faGlobe} style={{ fontSize: "17px" }} />
          &nbsp;&nbsp;&nbsp;&nbsp; Global
        </Link>
        <Link to="/individual">
          <FontAwesomeIcon icon={faUser} style={{ fontSize: "17px" }} />
          &nbsp;&nbsp;&nbsp;&nbsp; Individual
        </Link>
        <Link to="/chatbot">
          <FontAwesomeIcon icon={faRobot} style={{ fontSize: "17px" }} />
          &nbsp; &nbsp; Greenbot
        </Link>
        <Link to="/challenge">
          <FontAwesomeIcon icon={faGamepad} style={{ fontSize: "17px" }} />
          &nbsp; &nbsp; Game
        </Link>
        <Link to="/" onClick={() => localStorage.removeItem("token")}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          &nbsp; &nbsp; &nbsp;Logout
        </Link>
      </div>
      <div className="main-content">
        <div className="dashboard-header">
          <h2>My Dashboard</h2>
          <div
            className="user-info"
            onClick={openModal}
            style={{ cursor: "pointer" }}
          >
            <FontAwesomeIcon icon={faUserCircle} style={{ fontSize: "20px" }} />
            Profile
          </div>
        </div>
        <div className="charts">
          <div className="chart top10-co2">
            <h4>Top 10 Countries by CO2 Emissions</h4>
            {top10GraphUrl ? (
              <img
                src={top10GraphUrl}
                alt="Top 10 Countries CO2 Emissions Graph"
                style={{ width: "100%" }}
              />
            ) : (
              <p>Loading top 10 graph...</p>
            )}
          </div>

          <div className="chart country-co2">
            <div className="navigation-container">
              <h4>{countries[currentCountryIndex]} CO2 Emission</h4>
              <div className="navigation-controls">
                <FontAwesomeIcon
                  icon={faChevronLeft}
                  onClick={handlePrevious}
                  className="nav-arrow"
                  title="Previous"
                  style={{ fontSize: "15px" }}
                />
                <FontAwesomeIcon
                  icon={faChevronRight}
                  onClick={handleNext}
                  className="nav-arrow"
                  title="Next"
                  style={{ fontSize: "15px" }}
                />
              </div>
            </div>
            {countryGraphUrl ? (
              <img
                src={countryGraphUrl}
                alt={`${countries[currentCountryIndex]} CO2 Emissions Graph`}
                style={{ width: "100%", height: "90%" }}
              />
            ) : (
              <p>Loading country graph...</p>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Profile Modal"
        className="profile-modal"
        overlayClassName="profile-overlay"
      >
        <div className="profile-content">
          <div className="profile-header">
            <h1>My Profile</h1>
            <p>Mention Name Here</p>
            <div className="profile-info">
              <div className="profile-section">
                <p>My Carbon Footprint</p>
              </div>
              <div className="profile-section">
                <p>Daily Challenges</p>
              </div>
              <div className="profile-section">
                <p>21 Day Challenge</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Home;
