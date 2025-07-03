import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SuccessScreen.css"; // ✅ Import your CSS

export default function SuccessScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">
          {Array.from("AFRIBASE").map((letter, index) => (
            <span
              key={index}
              className="letter"
              style={{
                background: getGradient(index),
                animationDelay: `${index * 0.1}s`, // Each letter fades in one by one
              }}
            >
              {letter}
            </span>
          ))}
        </h1>
        <h2 className="success">Success!</h2>
        <p className="subtitle">Welcome to Afribase. Redirecting...</p>
      </div>
    </div>
  );
}

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
