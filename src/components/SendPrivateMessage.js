import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, push, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";

export default function SendPrivateMessage({ recipientUID, recipientName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) return null;

  // Generate chatId for 1-on-1 chat (sorted UIDs to keep it consistent)
  const chatId =
    currentUser.uid < recipientUID
      ? `${currentUser.uid}_${recipientUID}`
      : `${recipientUID}_${currentUser.uid}`;

  useEffect(() => {
    const messagesRef = ref(db, `privateMessages/${chatId}`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgs = Object.entries(data).map(([id, val]) => ({
          id,
          ...val,
        }));
        setMessages(msgs);
      } else {
        setMessages([]);
      }
    });

    // cleanup listener
    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const messagesRef = ref(db, `privateMessages/${chatId}`);
    push(messagesRef, {
      senderUID: currentUser.uid,
      senderName: currentUser.displayName || "You",
      text: input.trim(),
      timestamp: Date.now(),
    });
    setInput("");
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalContent} onClick={(e) => e.stopPropagation()}>
        <h3>Chat with {recipientName}</h3>
        <div style={chatBoxStyle}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                ...messageStyle,
                alignSelf: msg.senderUID === currentUser.uid ? "flex-end" : "flex-start",
                backgroundColor: msg.senderUID === currentUser.uid ? "#00cc88" : "#ddd",
                color: msg.senderUID === currentUser.uid ? "white" : "black",
              }}
            >
              <small>{msg.senderName}</small>
              <p>{msg.text}</p>
              <small style={{ fontSize: 10 }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </small>
            </div>
          ))}
        </div>
        <input
          style={inputStyle}
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button style={buttonStyle} onClick={sendMessage}>
          Send
        </button>
        <button style={{ ...buttonStyle, marginTop: 8, backgroundColor: "#ff4444" }} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

// Styles for chat modal
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContent = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  width: "90%",
  maxWidth: 400,
  display: "flex",
  flexDirection: "column",
};

const chatBoxStyle = {
  display: "flex",
  flexDirection: "column",
  height: "300px",
  overflowY: "auto",
  marginBottom: 10,
  border: "1px solid #ccc",
  padding: 10,
  borderRadius: 8,
  backgroundColor: "#f9f9f9",
};

const messageStyle = {
  maxWidth: "70%",
  padding: 8,
  borderRadius: 10,
  marginBottom: 5,
};

const inputStyle = {
  padding: 8,
  borderRadius: 8,
  border: "1px solid #ccc",
  marginBottom: 8,
};

const buttonStyle = {
  background: "#00cc88",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
};
