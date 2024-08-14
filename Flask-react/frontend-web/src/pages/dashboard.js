import React from "react";
import { Link } from "react-router-dom";
import "../css/Dashboard.css";

const Dashboard = () => {
  return (
    <>
      <div className="container">
        <header className="header">
          <div className="logo">
            <img
              src={require("../images/logo.png")}
              alt="logo"
              className="logoImage"
            ></img>{" "}
            NATURE
          </div>
          <nav className="nav">
            <Link to="/" className="navLink">
              HOME
            </Link>
            <Link to="/about" className="navLink">
              ABOUT
            </Link>
            <Link to="/design" className="navLink">
              DESIGN
            </Link>
            <Link to="/explore" className="navLink">
              EXPLORE
            </Link>
            <Link to="/contact" className="navLink">
              CONTACT US
            </Link>
          </nav>
          <div className="authButtons">
            <Link to="/login" className="loginButton">
              LOG IN
            </Link>
            <Link to="/register" className="signUpButton">
              SIGN UP
            </Link>
          </div>
        </header>
        <main className="main">
          <h1 className="heading">
            Let's <span className="greenText">Save</span> Together
          </h1>
        </main>
      </div>
      <div className="contentContainer">
        <div className="belowContainer">
          <p className="headingEx">
            <img
              src={require("../images/logo.png")}
              alt="logo"
              className="logoImage"
            ></img>{" "}
            EXCITED?
          </p>
          <br></br>
          <h1 className="headingExe">
            Let's paint the world <span className="greenText">Green</span> with{" "}
            <span className="greenText">EcoInSights.</span>
          </h1>
        </div>
        <div className="otherHalf">
          <p className="headingExee">
            Wanna be a brush?<br></br>Join us by
          </p>
          <div className="authButtons">
            <Link to="/register" className="loginButton1">
              LOG IN
            </Link>
          </div>
        </div>
      </div>
      <div className="contentContainer">
        <div className="otherHalf">
          <p className="headingExee">
            Lifestyle matters!<br></br>Time to Notice
          </p>
          <div className="authButtons">
            <Link to="#" className="loginButton1">
              Calculate
            </Link>
          </div>
        </div>
        <div className="belowContainer">
          <p className="headingEx">
            <img
              src={require("../images/logo.png")}
              alt="logo"
              className="logoImage"
            ></img>{" "}
            WHAT DO YOU?
          </p>
          <br></br>
          <h1 className="headingExe">
            Calculate your
            <span className="greenText"> Carbon Emission Index </span>
            and know what you do.
          </h1>
        </div>
      </div>
      <div className="contentContainer">
        <div className="belowContainer">
          <p className="headingEx">
            <img
              src={require("../images/logo.png")}
              alt="logo"
              className="logoImage"
            ></img>{" "}
            DON'T WORRY?
          </p>
          <br></br>
          <h1 className="headingExe">
            EcoInSights's <span className="greenText">Assitive GreenBot</span>{" "}
            Holds your hand.{" "}
          </h1>
        </div>
        <div className="otherHalf">
          <p className="headingExee">
            You : Why are you so green?<br></br>
          </p>
          <div className="authButtons">
            <Link to="/" className="loginButton1">
              CHATBOT
            </Link>
          </div>
        </div>
      </div>
      <div className="contentContainer">
        <div className="otherHalf">
          <p className="headingExee">
            Nature's Gameplay<br></br>
            <span className="greenText">vs</span>
            <br></br>Carbon's strategy
          </p>
          <div className="authButtons">
            <Link to="#" className="loginButton1">
              GAMES
            </Link>
          </div>
        </div>
        <div className="belowContainer">
          <p className="headingEx">
            <img
              src={require("../images/logo.png")}
              alt="logo"
              className="logoImage"
            ></img>{" "}
            FUN TRACK?
          </p>
          <br></br>
          <h1 className="headingExe">
            Let's play <span className="greenText">GreenGame</span> & earn
            <span className="goldText"> HealthyStars</span>
          </h1>
        </div>
      </div>
      <div className="contentContainer">
        <div className="belowContainer">
          <p className="greenText1">WHO ARE ECOINSIGHTS ?</p>
          <br></br>
          <h4 className="blackText">We Are Student Developers At CEG.</h4>
          <h4 className="blackText">
            After noticing The Global Climate Changes in concern with the
            Environment and social responsibility we developed this site.
          </h4>
          <h4 className="blackText"> Hope you make use of it.</h4>
        </div>
        <div className="belowContainer">
          <p className="greenText1">CONTACT US</p>
          <br></br>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
