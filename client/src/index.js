import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>  
      <BrowserRouter>
        <Toaster position="bottom-right" reverseOrder={false} />
        <App />
      </BrowserRouter>
  </React.StrictMode>
);

/*
Help me to the fix a problem in site 

Context : 
1.There is a site in which i implemented chat system through socket.io 
2. I also used earlier notification for showing the customer message about the product 
3. Notification was a button in nav bar with sell and profile  also 
4. There is a floating chatbox which is implemented and it will only execute
   if on any product customer opens and click message seller button
5. I am using React and Node.js 

Problem : 
1. I want to get rid of notification thing , i almost deleted everything about 
   notificcation but i can see traces of it in project -> u have to clean it 
2. I want to replace notfication button with Messages button which will show the history 
   of all chats and new chats history and get notification as toast u get new notification and also new 
  messaages section in 2 new messages like in fb messenger . 
3. First i want to start with backend and then frontend 

REquest: 
1. Consider me not expert in this thing
2. U can ask for code which i implemented , don't assume anything in code

1. I deleted the notification model
2. Removed all the references 
3. removed all the import and export 
4. there is only 3 endpoint for now in backend related to message 
5. I want to remind u to that message functions not work properly , only seller sends message and 
    reciever don't get the message
6. For context all current route in backend -> const express = require("express");
const router = express.Router();
const buyNsell = require("../controller/buyNsellController");
router.post("/send" , buyNsell.sendText);
router.post("/receive" , buyNsell.receiveText);
router.post("/login", buyNsell.login);
router.post("/register", buyNsell.register);
router.post("/", buyNsell.token);
router.delete("/", buyNsell.delToken);
router.post("/profile", buyNsell.profile);
router.post("/deleteAccount", buyNsell.delAcc);
router.post("/logout", buyNsell.logout);
router.post("/allprod", buyNsell.displayProd);
router.post("/sell", buyNsell.sell);
router.post("/update", buyNsell.update);
router.post("/prodData", buyNsell.prodData);
router.post("/searchproduct", buyNsell.searchproduct);
router.post("/fixdeal", buyNsell.fixdeal);
router.post("/confirmdeal", buyNsell.confirmdeal);
router.post("/deletemyprod", buyNsell.deletemyprod);
router.post("/messages" , buyNsell.msg);
module.exports = router;

7. All endpoint related to message -> const sendText = async (req, res) => {
  const { senderId, receiverId, message } = req.body;
  console.log("SEND REQ BODY:", req.body);  // 👈 Add this

  try {
    const msg = new Message({ senderId, receiverId, message });
    await msg.save();
    res.status(200).json(msg);
  } catch (err) {
    console.error("SEND ERROR:", err); // 👈 Add this too
    res.status(500).json({ error: "Message send failed" });
  }
};


const receiveText =  async (req, res) => {
  const { senderId, receiverId } = req.body;
  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
}
const msg = async(req,res) => {
  const { senderId, receiverId } = req.body;
  if (!senderId || !receiverId) {
    return res.status(400).json({ error: "Missing sender or receiver ID" });
  }
  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 }); 

    res.json({ messages });
  } catch (err) {
    console.error("Error fetching messages", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


*/