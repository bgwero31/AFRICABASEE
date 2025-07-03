import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SuccessScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={title}>
          {Array.from("AFRIBASE").map((letter, index) => (
            <span key={index} style={{ ...letterStyle, background: getGradient(index) }}>
              {letter}
            </span>
          ))}
        </h1>
        <h2 style={success}>Success!</h2>
        <p style={subtitle}>Welcome to Afribase. Redirecting...</p>
      </div>
    </div>
  );
}

// ✅ This function gives each letter a slightly different gradient.
const getGradient = (i) => {
  const colors = [
    "linear-gradient(to right, #00ffcc, #004040)",
    "linear-gradient(to right, #00ffaa, #005555)",
    "linear-gradient(to right, #00cc88, #006666)",
    "linear-gradient(to right, #00aa77, #007777)",
    "linear-gradient(to right, #008855, #009999)",
    "linear-gradient(to right, #006644, #00bbbb)",
    "linear-gradient(to right, #004433, #00cccc)",
    "linear-gradient(to right, #002222, #00dddd)",
  ];
  return colors[i % colors.length];
};

const container = {
  height: "100vh",
  background: "linear-gradient(135deg, #00ffcc, #004040)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "#fff",
  fontFamily: "Poppins, sans-serif",
};

const card = {
  background: "#ffffff20",
  backdropFilter: "blur(10px)",
  borderRadius: "20px",
  padding: "50px 40px",
  textAlign: "center",
};

const title = {
  fontSize: "48px",
  fontWeight: "900",
  display: "flex",
  justifyContent: "center",
  gap: "4px",
  flexWrap: "wrap",
};

const letterStyle = {
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
};

const success = {
  fontSize: "28px",
  fontWeight: "700",
  marginTop: "20px",
};

const subtitle = {
  fontSize: "16px",
  marginTop: "10px",
};
