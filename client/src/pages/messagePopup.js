import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import styles from "./MessagesPopup.module.scss";
import FloatingChatBox from "./FloatingChatBox";

function MessagesPopup({ onClose }) {
  const [chats, setChats] = useState([]);
  const [userId, setUserId] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(true);

  const popupRef = useRef(); 
  const chatBoxRef = useRef();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("token"));
        const res = await axios.post(`${process.env.REACT_APP_BASEURL}/api`, { token });
        const myId = res.data.userid;
        setUserId(myId);

        const chatList = await axios.post(`${process.env.REACT_APP_BASEURL}/api/sendMessage`, {
          userId: myId,
        });

        setChats(chatList.data);
      } catch (err) {
        console.error("❌ Error fetching chats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  // ✅ Handle click outside to close
  useEffect(() => {
  const handleClickOutside = (event) => {
    const clickedOutsidePopup =
      popupRef.current && !popupRef.current.contains(event.target);
    const clickedOutsideChatBox =
      chatBoxRef.current && !chatBoxRef.current.contains(event.target);

    if (clickedOutsidePopup && clickedOutsideChatBox) {
      onClose(); // only close if clicked outside both
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [onClose]);


  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popup} ref={popupRef}>
        <div className={styles.header}>
          <span>Your Messages</span>
          <button onClick={onClose}>✖</button>
        </div>

        {loading ? (
          <div className={styles.loader}>Loading...</div>
        ) : chats.length === 0 ? (
          <div className={styles.empty}>No conversations yet.</div>
        ) : (
          <div className={styles.chatList}>
            {chats.map((chat, idx) => {
              const otherUser = chat.participants.find(
                (p) => p._id !== userId && p.name
              );
              if (!otherUser) {
                console.warn("Could not find otherUser in chat", chat);
                return null;
              }
              return (
                <div
                  key={idx}
                  className={styles.chatItem}
                  onClick={() => setActiveChat(otherUser._id)}
                >
                  <div className={styles.chatName}>{otherUser.name}</div>
                  <div className={styles.chatLastMsg}>
                    {chat.latestMessage?.message || "No messages yet"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activeChat && (
        <FloatingChatBox
          receiverId={activeChat}
          onClose={() => setActiveChat(null)}
          forwardedRef={chatBoxRef}
        />

      )}
    </div>
  );
}

export default MessagesPopup;
