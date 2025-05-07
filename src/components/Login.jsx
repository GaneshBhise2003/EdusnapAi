import React, { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import aboutShape1 from "../assets/images/about-shape-1.svg";
import aboutShape2 from "../assets/images/about-shape-2.svg";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Signup.css"; 

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
  
    if (!email || !password) {
      setError("Both fields are required");
      return;
    }
  
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Logged in user:", user);
      navigate("/");
    } catch (err) {
      setError("Invalid email or password");
      setSuccess("");
      console.error("Login error:", err.message);
    }
  };
  

  return (
    <div className="signup-container">
      <motion.img
        src={aboutShape1}
        alt="ShapeTop"
        className="shape top"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.img
        src={aboutShape2}
        alt="ShapeBottom"
        className="shape bottom"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <motion.div
        className="signup-card"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="glow-button">Login</button>
          <p className="already">Don't have an account? <button type="button" onClick={() => navigate("/signup")}>Signup</button></p>

        </form>
      </motion.div>
    </div>
  );
}

export default Login;
