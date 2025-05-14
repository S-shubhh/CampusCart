import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import io from "socket.io-client";
import toast from "react-hot-toast";
import axios from "axios";
import styles from "./FloatingChatBox.module.scss";
function FloatingChatBox({ receiverId, productId, onClose , forwardedRef}) {
  const [userId, setUserId] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const chatRef = useRef(null);
  const socketRef = useRef(null);
 

  useEffect(() => {
  if (!receiverId) {
    console.warn("⚠️ receiverId is undefined. Chat cannot be initialized.");
    return;
  }

  const init = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("token"));
      const res = await axios.post(
        `${process.env.REACT_APP_BASEURL}/api`,
        { token }
      );
      const myId = res.data.userid;
      setUserId(myId);

      const chatRes = await axios.post(
        `${process.env.REACT_APP_BASEURL}/api/receive`,
        { senderId: myId, receiverId }
      );
      setMessages(chatRes.data);

      // 1️⃣ Create the socket connection
      socketRef.current = io(process.env.REACT_APP_BASEURL);

      // 2️⃣ Add listeners
      socketRef.current.on("connect", () => {
        console.log("✅ Socket connected, client id:", socketRef.current.id);
      });
      socketRef.current.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err);
      });

      socketRef.current.emit("joinRoom", { senderId: myId, receiverId });

    
      socketRef.current.off("receiveMessage");
      socketRef.current.off("newNotification");

      socketRef.current.on("receiveMessage", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      socketRef.current.on("newNotification", (notification) => {
        toast(`📩 New message from ${notification.senderName || "someone"}`);
        console.log("New notification:", notification);
      });
    } catch (error) {
      console.error("❌ Error initializing chat:", error);
    }
  };

  init();

  return () => {
    console.log("🧹 Cleaning up socket and listeners");
    socketRef.current?.off("receiveMessage");
    socketRef.current?.off("newNotification");
    socketRef.current?.disconnect();
  };
}, [receiverId]);


  const sendMessage = () => {
    console.log("🔀 sendMessage called", { newMsg, userId, receiverId });
    if (!newMsg.trim() || !userId || !receiverId) {
      console.warn("❌ Cannot send message: missing data");
      return;
    }

    const msgData = {
      senderId: userId,
      receiverId,
      message: newMsg,
      productId,
    };
    if (!socketRef.current) {
      console.error("⚠️ socketRef.current is null — no socket connection!");
      return;
    }
    console.log("📤 Emitting sendMessage:", msgData);

    socketRef.current?.emit("sendMessage", msgData);
    setNewMsg(""); // Clear input
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  return (
    <Draggable>
      <div ref={forwardedRef} className={styles.chatPopup}>
        <div className={styles.header}>
          <span>Chat</span>
          <button onClick={onClose}>✖</button>
        </div>

        <div className={styles.body}>
          {messages.map((msg, i) => (
            <div key={i} className={msg.senderId === userId ? styles.mine : styles.theirs}>
              {msg.message}
            </div>
          ))}
          <div ref={chatRef}></div>
        </div>

        <div className={styles.input}>
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>➤</button>
        </div>
      </div>
    </Draggable>
  );
}

export default FloatingChatBox;
