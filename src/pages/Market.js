// src/pages/Marketplace.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  ref,
  push,
  onValue,
  update,
  remove,
  set,
  get,
} from "firebase/database";
import { getAuth } from "firebase/auth";
import SendPrivateMessage from "../components/SendPrivateMessage";
import "./Marketplace.css"; // ✅ Import your CSS

const imgbbKey = "30df4aa05f1af3b3b58ee8a74639e5cf";

export default function Marketplace() {
  const auth = getAuth();
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [userWhatsApp, setUserWhatsApp] = useState("");

  // ✅ NEW: AI Voice Greeting
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    let greet = "Welcome";
    if (hour >= 5 && hour < 12) greet = "Good morning";
    else if (hour >= 12 && hour < 17) greet = "Good afternoon";
    else greet = "Good evening";

    const message = `${greet}! Welcome to Afribase Marketplace.`;
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const phoneRef = ref(db, `users/${user.uid}/whatsapp`);
      get(phoneRef).then((snap) => {
        if (!snap.exists()) {
          const phone = prompt(
            "Enter your WhatsApp number (with country code, e.g. 2637...)"
          );
          if (phone) {
            set(phoneRef, phone);
            setUserWhatsApp(phone);
          }
        } else {
          setUserWhatsApp(snap.val());
        }
      });
    }
  }, []);

  useEffect(() => {
    const productRef = ref(db, "products");
    onValue(productRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const items = Object.entries(data).map(([id, val]) => ({
          id,
          ...val,
          likes: val.likes || [],
          dislikes: val.dislikes || [],
          comments: val.comments
            ? Object.entries(val.comments).map(([cid, c]) => ({
                id: cid,
                ...c,
              }))
            : [],
        }));
        setProducts(items.reverse());
      }
    });
  }, []);

  const handlePost = async () => {
    const user = auth.currentUser;
    if (!user || !userWhatsApp)
      return alert("Login and provide WhatsApp number.");
    if (!title || !description || !price || !category || !image)
      return alert("Fill all fields.");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", image);
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${imgbbKey}`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      const url = data.data.url;

      await push(ref(db, "products"), {
        title,
        description,
        price,
        category,
        image: url,
        time: new Date().toLocaleString(),
        likes: [],
        dislikes: [],
        comments: [],
        ownerUID: user.uid,
        ownerName: user.displayName || "Unknown",
        ownerPhoneNumber: userWhatsApp,
      });

      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("");
      setImage(null);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleComment = (productId) => {
    const user = auth.currentUser;
    const text = commentInputs[productId];
    if (!user || !text) return;
    const comment = {
      name: user.displayName || "User",
      text,
      uid: user.uid,
      timestamp: Date.now(),
    };
    push(ref(db, `products/${productId}/comments`), comment);
    setCommentInputs({ ...commentInputs, [productId]: "" });
  };

  const deleteProduct = (id) => {
    const confirm = window.confirm("Delete this product?");
    if (confirm) remove(ref(db, `products/${id}`));
  };

  const deleteComment = (productId, commentId) => {
    remove(ref(db, `products/${productId}/comments/${commentId}`));
  };

  const toggleLike = (p) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return alert("Login first");
    const liked = p.likes.includes(uid);
    const newLikes = liked
      ? p.likes.filter((id) => id !== uid)
      : [...p.likes, uid];
    update(ref(db, `products/${p.id}`), { likes: newLikes });
  };

  const toggleDislike = (p) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return alert("Login first");
    const dis = p.dislikes.includes(uid);
    const newDislikes = dis
      ? p.dislikes.filter((id) => id !== uid)
      : [...p.dislikes, uid];
    update(ref(db, `products/${p.id}`), { dislikes: newDislikes });
  };

  const getWhatsAppLink = (number, title) => {
    const text = encodeURIComponent(`Hi, I'm interested in ${title}`);
    return `https://wa.me/${number}?text=${text}`;
  };

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="marketplace-page">
      <div className="marketplace-header">
        {Array.from("AFRIBASE MARKETPLACE").map((letter, i) => (
          <span
            key={i}
            className="marketplace-letter"
            style={{
              background: getLetterGradient(i),
              animationDelay: `${i * 0.05}s`,
            }}
          >
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
      </div>

      <input
        className="marketplace-search"
        placeholder="🔍 Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* The rest of your JSX stays the same */}
      {/* Form, Grid, Cards, Modals, Buttons — all unchanged */}

    </div>
  );
}

const getLetterGradient = (i) => {
  const gradients = [
    "linear-gradient(to right, #00ffcc, #004040)",
    "linear-gradient(to right, #00ffaa, #005555)",
    "linear-gradient(to right, #00cc88, #006666)",
    "linear-gradient(to right, #00aa77, #007777)",
    "linear-gradient(to right, #008855, #009999)",
    "linear-gradient(to right, #006644, #00bbbb)",
    "linear-gradient(to right, #004433, #00cccc)",
    "linear-gradient(to right, #002222, #00dddd)",
  ];
  return gradients[i % gradients.length];
};
