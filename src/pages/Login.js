import React, { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ref, set } from "firebase/database";
import { db } from "../firebase";

const auth = getAuth();

export default function Login() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ emailOrPhone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const isEmail = /\S+@\S+\.\S+/.test(form.emailOrPhone);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        { size: "invisible" },
        auth
      );
    }
    return window.recaptchaVerifier;
  };

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isSignup) {
        if (isEmail) {
          const res = await createUserWithEmailAndPassword(auth, form.emailOrPhone, form.password);
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
          const appVerifier = setupRecaptcha();
          const result = await signInWithPhoneNumber(auth, form.emailOrPhone, appVerifier);
          setConfirmationResult(result);
          alert("OTP sent! Enter it below.");
        }
      } else {
        if (isEmail) {
          await signInWithEmailAndPassword(auth, form.emailOrPhone, form.password);
          navigate("/");
        } else {
          const appVerifier = setupRecaptcha();
          const result = await signInWithPhoneNumber(auth, form.emailOrPhone, appVerifier);
          setConfirmationResult(result);
          alert("OTP sent! Enter it below.");
        }
      }
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

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
          {isSignup ? "Create your free account" : "Welcome back! Log in below"}
        </p>

        <input
          type="text"
          placeholder="Email or Phone Number"
          value={form.emailOrPhone}
          onChange={(e) => setForm({ ...form, emailOrPhone: e.target.value })}
          style={input}
        />

        {isEmail && (
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={input}
          />
        )}

        {!confirmationResult && (
          <button onClick={handleAuth} disabled={loading} style={button}>
            {loading ? "Processing..." : isSignup ? "Sign Up" : "Log In"}
          </button>
        )}

        {confirmationResult && (
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

// ✅ Refreshed styles for a clean modern look
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
