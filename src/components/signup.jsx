import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import aboutShape1 from "../assets/images/about-shape-1.svg";
import aboutShape2 from "../assets/images/about-shape-2.svg";
import { motion } from "framer-motion";
import "./Signup.css";

function Signup() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password } = formData;

    if (!username || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username,
        email,
      });

      navigate("/login"); 
    } catch (err) {
      setError(err.message || "Failed to sign up.");
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
        <h2>Sign Up</h2>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
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
          <button type="submit" className="glow-button">Register</button>
        </form>
      </motion.div>
    </div>
  );
}

export default Signup;
