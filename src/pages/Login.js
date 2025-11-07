import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ref, set } from "firebase/database";
import { db, auth } from "../firebase"; // ✅ use your initialized auth

export default function Login() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [mode, setMode] = useState("email"); // "email" or "phone"
  const [form, setForm] = useState({ email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  // ✅ Setup Recaptcha only once
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible", callback: () => {} }
      );
    }
    return window.recaptchaVerifier;
  };

  // ✅ Handle Signup / Login
  const handleAuth = async () => {
    setLoading(true);
    try {
      if (mode === "email") {
        if (isSignup) {
          // Email Signup
          const res = await createUserWithEmailAndPassword(
            auth,
            form.email,
            form.password
          );
          await set(ref(db, `users/${res.user.uid}`), {
            name: "New User",
            email: res.user.email,
            phone: "",
            image: "",
            vip: false,
            posts: 0,
            likes: 0,
            comments: 0,
          });
          navigate("/");
        } else {
          // Email Login
          await signInWithEmailAndPassword(auth, form.email, form.password);
          navigate("/");
        }
      } else {
        // ✅ Phone Auth
        if (!form.phone.startsWith("+")) {
          alert("Please include country code, e.g. +2637...");
          setLoading(false);
          return;
        }

        const appVerifier = setupRecaptcha();
        const result = await signInWithPhoneNumber(
          auth,
          form.phone,
          appVerifier
        );
        setConfirmationResult(result);
        alert("OTP sent! Enter it below.");
      }
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  // ✅ Handle OTP confirmation
  const handleOtpConfirm = async () => {
    if (!confirmationResult || !otp) {
      alert("Please enter the OTP code.");
      return;
    }
    setLoading(true);
    try {
      const res = await confirmationResult.confirm(otp);
      await set(ref(db, `users/${res.user.uid}`), {
        name: "New User",
        email: "",
        phone: res.user.phoneNumber,
        image: "",
        vip: false,
        posts: 0,
        likes: 0,
        comments: 0,
      });
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  const bgImage = "/assets/IMG-20250620-WA0005.jpg";

  return (
    <div style={{ ...container, backgroundImage: `url(${bgImage})` }}>
      <div style={overlay} />
      <div style={card}>
        <h1 style={title}>AFRIBASE</h1>
        <p style={subtitle}>
          {isSignup ? "Create your free account" : "Welcome back!"}
        </p>

        {/* ✅ Mode Toggle */}
        <div style={toggleTabs}>
          <button
            style={{
              ...toggleBtn,
              background: mode === "email" ? "#00cc88" : "#ccc",
            }}
            onClick={() => setMode("email")}
          >
            📧 Email
          </button>
          <button
            style={{
              ...toggleBtn,
              background: mode === "phone" ? "#00cc88" : "#ccc",
            }}
            onClick={() => setMode("phone")}
          >
            📱 Phone
          </button>
        </div>

        {/* ✅ Email/Password Mode */}
        {mode === "email" && (
          <>
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={input}
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={input}
            />
          </>
        )}

        {/* ✅ Phone Mode */}
        {mode === "phone" && (
          <input
            type="tel"
            placeholder="Phone Number (+263...)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            style={input}
          />
        )}

        {/* ✅ Buttons */}
        {!confirmationResult ? (
          <button onClick={handleAuth} disabled={loading} style={button}>
            {loading ? "Processing..." : isSignup ? "Sign Up" : "Log In"}
          </button>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={input}
            />
            <button onClick={handleOtpConfirm} disabled={loading} style={button}>
              {loading ? "Verifying..." : "Confirm OTP"}
            </button>
          </>
        )}

        {/* ✅ Switch between Login / Signup */}
        <p style={switcher}>
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <span onClick={() => setIsSignup(!isSignup)} style={link}>
            {isSignup ? "Log In" : "Sign Up"}
          </span>
        </p>

        <div id="recaptcha-container"></div>

        <footer style={footer}>© 2025 Afribase. All rights reserved.</footer>
      </div>
    </div>
  );
}

// ✅ Styles
const container = {
  minHeight: "100vh",
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  padding: "20px",
  fontFamily: "Poppins, sans-serif",
};

const overlay = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.7)",
  zIndex: 0,
};

const card = {
  position: "relative",
  zIndex: 1,
  background: "#fff",
  padding: "50px 35px",
  borderRadius: "20px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
  maxWidth: "400px",
  width: "100%",
  textAlign: "center",
};

const title = {
  fontSize: "38px",
  fontWeight: "800",
  background: "linear-gradient(to right, #00ffcc, #004040)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  marginBottom: "12px",
};

const subtitle = {
  fontSize: "15px",
  color: "#555",
  marginBottom: "25px",
};

const toggleTabs = {
  display: "flex",
  justifyContent: "center",
  gap: 10,
  marginBottom: 20,
};

const toggleBtn = {
  padding: "8px 16px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  color: "#fff",
};

const input = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #ddd",
  marginBottom: "18px",
  fontSize: "15px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
};

const button = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(135deg, #00cc88, #007755)",
  color: "#fff",
  fontSize: "17px",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  transition: "transform 0.2s ease",
};

const switcher = {
  fontSize: "14px",
  color: "#666",
  marginTop: "15px",
};

const link = {
  color: "#00cc88",
  cursor: "pointer",
  fontWeight: "600",
};

const footer = {
  marginTop: "40px",
  fontSize: "12px",
  color: "#aaa",
};
