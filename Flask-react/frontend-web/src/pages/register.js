// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import InputField from "../components/InputField";
// import Checkbox from "../components/Checkbox";
// import "../css/Register.css";

// export default function RegisterPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [passwordError, setPasswordError] = useState("");
//   const [emailError, setEmailError] = useState("");
//   const navigate = useNavigate();

//   const validateEmail = (email) => {
//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailPattern.test(email);
//   };

//   const validatePassword = (password) => {
//     const minLength = 6;
//     const hasUpperCase = /[A-Z]/.test(password);
//     const hasLowerCase = /[a-z]/.test(password);
//     const hasNumber = /[0-9]/.test(password);
//     const hasSpecialChar = /[!@#$%^&*()_+{}\[\]:;"'<>,.?~\\/-]/.test(password);

//     if (password.length < minLength) {
//       return "Password must be at least 6 characters long.";
//     }
//     if (!hasUpperCase) {
//       return "Password must contain at least one uppercase letter.";
//     }
//     if (!hasLowerCase) {
//       return "Password must contain at least one lowercase letter.";
//     }
//     if (!hasNumber) {
//       return "Password must contain at least one number.";
//     }
//     if (!hasSpecialChar) {
//       return "Password must contain at least one special character.";
//     }
//     return "";
//   };

//   const registerUser = () => {
//     setPasswordError("");
//     setEmailError("");

//     if (!validateEmail(email)) {
//       setEmailError("Invalid email address.");
//       return;
//     }

//     const passwordValidationError = validatePassword(password);
//     if (passwordValidationError) {
//       setPasswordError(passwordValidationError);
//       return;
//     }

//     axios
//       .post("http://127.0.0.1:5000/signup", {
//         email: email,
//         password: password,
//       })
//       .then((response) => {
//         console.log(response);
//         navigate("/");
//       })
//       .catch((error) => {
//         console.log(error, "error");
//         if (error.response && error.response.status === 409) {
//           alert("Email already exists.");
//         } else {
//           alert("An error occurred.");
//         }
//       });
//   };

//   return (
//     <div className="container">
//       <h2>Create Your Account</h2>

//       <InputField
//         type="email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         id="registerEmail"
//         placeholder="Enter a valid email address"
//         label="Email address"
//       />
//       {emailError && <p style={{ color: "red" }}>{emailError}</p>}

//       <InputField
//         type="password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         id="registerPassword"
//         placeholder="Enter password"
//         label="Password"
//       />
//       {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}

//       <div>
//         <Checkbox id="rememberMe" label="Remember me" />
//         <a href="#!" className="text-body">
//           Forgot password?
//         </a>
//       </div>

//       <div>
//         <button type="button" onClick={registerUser}>
//           Sign Up
//         </button>
//         <p>
//           Already have an account?{" "}
//           <a href="/login" className="link-danger">
//             Login
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }

// // import React, { useState } from "react";
// // import axios from "axios";
// // import { useNavigate } from "react-router-dom";
// // import InputField from "../components/InputField";
// // import Checkbox from "../components/Checkbox";
// // import "../css/Dashboard.css"; // Import your existing CSS

// // export default function RegisterPage() {
// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [passwordError, setPasswordError] = useState("");
// //   const [emailError, setEmailError] = useState("");
// //   const navigate = useNavigate();

// //   const validateEmail = (email) => {
// //     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// //     return emailPattern.test(email);
// //   };

// //   const validatePassword = (password) => {
// //     const minLength = 6;
// //     const hasUpperCase = /[A-Z]/.test(password);
// //     const hasLowerCase = /[a-z]/.test(password);
// //     const hasNumber = /[0-9]/.test(password);
// //     const hasSpecialChar = /[!@#$%^&*()_+{}\[\]:;"'<>,.?~\\/-]/.test(password);

// //     if (password.length < minLength) {
// //       return "Password must be at least 6 characters long.";
// //     }
// //     if (!hasUpperCase) {
// //       return "Password must contain at least one uppercase letter.";
// //     }
// //     if (!hasLowerCase) {
// //       return "Password must contain at least one lowercase letter.";
// //     }
// //     if (!hasNumber) {
// //       return "Password must contain at least one number.";
// //     }
// //     if (!hasSpecialChar) {
// //       return "Password must contain at least one special character.";
// //     }
// //     return "";
// //   };

// //   const registerUser = () => {
// //     setPasswordError("");
// //     setEmailError("");

// //     if (!validateEmail(email)) {
// //       setEmailError("Invalid email address.");
// //       return;
// //     }

// //     const passwordValidationError = validatePassword(password);
// //     if (passwordValidationError) {
// //       setPasswordError(passwordValidationError);
// //       return;
// //     }

// //     axios
// //       .post("http://127.0.0.1:5000/signup", {
// //         email: email,
// //         password: password,
// //       })
// //       .then((response) => {
// //         console.log(response);
// //         navigate("/");
// //       })
// //       .catch((error) => {
// //         console.log(error, "error");
// //         if (error.response && error.response.status === 409) {
// //           alert("Email already exists.");
// //         } else {
// //           alert("An error occurred.");
// //         }
// //       });
// //   };

// //   return (
// //     <div className="container belowContainer">
// //       <h2 className="headingExe">Create Your Account</h2>

// //       <InputField
// //         type="email"
// //         value={email}
// //         onChange={(e) => setEmail(e.target.value)}
// //         id="registerEmail"
// //         placeholder="Enter a valid email address"
// //         label="Email address"
// //         className="greenText" // Apply the greenText class for styling
// //       />
// //       {emailError && <p style={{ color: "red" }}>{emailError}</p>}

// //       <InputField
// //         type="password"
// //         value={password}
// //         onChange={(e) => setPassword(e.target.value)}
// //         id="registerPassword"
// //         placeholder="Enter password"
// //         label="Password"
// //         className="greenText" // Apply the greenText class for styling
// //       />
// //       {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}

// //       <div className="checkbox">
// //         <Checkbox id="rememberMe" label="Remember me" />
// //         <a href="#!" className="text-body greenText">
// //           Forgot password?
// //         </a>
// //       </div>

// //       <div>
// //         <button type="button" className="loginButton1" onClick={registerUser}>
// //           Sign Up
// //         </button>
// //         <p>
// //           Already have an account?{" "}
// //           <a href="/login" className="loginButton">
// //             Login
// //           </a>
// //         </p>
// //       </div>
// //     </div>
// //   );
// // }

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Checkbox from "../components/Checkbox";
import "../css/Register.css";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validatePassword = (password) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    //const hasSpecialChar = /[!@#$%^&*()_+{}\[\]:;"'<>,.?~\\/-]/.test(password);

    if (password.length < minLength) {
      return "Password must be at least 6 characters long.";
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!hasNumber) {
      return "Password must contain at least one number.";
    }
    //if (!hasSpecialChar) {
    //return "Password must contain at least one special character.";
    //}
    return "";
  };

  const registerUser = () => {
    setPasswordError("");
    setEmailError("");

    if (!validateEmail(email)) {
      setEmailError("Invalid email address.");
      return;
    }

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    axios
      .post("http://127.0.0.1:5000/signup", {
        email: email,
        password: password,
      })
      .then((response) => {
        console.log(response);
        navigate("/");
      })
      .catch((error) => {
        console.log(error, "error");
        if (error.response && error.response.status === 409) {
          alert("Email already exists.");
        } else {
          alert("An error occurred.");
        }
      });
  };

  return (
    <div className="register-page">
      <div className="container">
        <h2>Create Your Account </h2>
        <InputField
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          id="registerEmail"
          placeholder="Enter a valid email address"
          label="Email"
        />
        {emailError && <p style={{ color: "red" }}>{emailError}</p>}

        <InputField
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          id="registerPassword"
          placeholder="Enter password"
          label="Password"
        />
        {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}

        <div className="checkbox">
          <Checkbox id="rememberMe" label="Remember me" />

          <a href="#!" className="text-body">
            Forgot password?
          </a>
        </div>

        <button type="button" onClick={registerUser}>
          Sign Up
        </button>
        <p>
          Already have an account?{" "}
          <a href="/login" className="link-danger">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
