import { React, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ModalForm from "./ModalForm";

const Home = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleModalSuccess = () => {
    setModalOpen(false);
    navigate("/dashboard");
  };

  return (
    <div style={styles.container}>
      <h1>Welcome to the 21-Day Challenge Game!</h1>
      <p>Start your journey towards a more sustainable lifestyle.</p>
      <Link to="#" onClick={() => setModalOpen(true)}>
        Let's start the game!
      </Link>

      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    textAlign: "center",
    padding: "20px",
  },
  links: {
    marginTop: "20px",
  },
  link: {
    margin: "10px",
    textDecoration: "none",
    color: "#007bff",
    fontSize: "18px",
  },
};

export default Home;
