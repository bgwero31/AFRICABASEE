// Profile.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { getAuth, signOut } from "firebase/auth";
import { ref, set, get } from "firebase/database";

export default function Profile() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [whatsApp, setWhatsApp] = useState("");

  useEffect(() => {
    if (user) {
      const phoneRef = ref(db, `users/${user.uid}/whatsapp`);
      get(phoneRef).then((snap) => {
        if (snap.exists()) {
          setWhatsApp(snap.val());
        } else {
          const phone = prompt(
            "Enter your WhatsApp number (with country code, e.g. 2637...)"
          );
          if (phone) {
            set(phoneRef, phone);
            setWhatsApp(phone);
          }
        }
      });
    }
  }, [user]);

  const handleSaveNumber = () => {
    if (user && whatsApp) {
      const phoneRef = ref(db, `users/${user.uid}/whatsapp`);
      set(phoneRef, whatsApp);
      alert("WhatsApp number updated!");
    }
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  if (!user) {
    return <p>Loading user info...</p>;
  }

  return (
    <div style={styles.page}>
      <h2>👤 Profile</h2>
      <p><strong>Name:</strong> {user.displayName || "Unknown"}</p>
      <p><strong>Email:</strong> {user.email || "Unknown"}</p>

      <div style={{ marginTop: 20 }}>
        <label>📱 WhatsApp Number:</label>
        <input
          type="text"
          value={whatsApp}
          onChange={(e) => setWhatsApp(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleSaveNumber} style={styles.button}>
          Save Number
        </button>
      </div>

      <button onClick={handleSignOut} style={{ ...styles.button, background: "red" }}>
        Sign Out
      </button>
    </div>
  );
}

// Styles
const styles = {
  page: {
    padding: 20,
    maxWidth: 500,
    margin: "0 auto",
    fontFamily: "Poppins",
  },
  input: {
    width: "100%",
    padding: 10,
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  button: {
    padding: 10,
    borderRadius: 6,
    background: "#007bff",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};
