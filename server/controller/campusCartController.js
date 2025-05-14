const User = require("../models/user.js");
const Token = require("../models/token.js");
const bcrypt = require("bcrypt");
const Product = require("../models/products.js");
const jwt = require("jsonwebtoken");
const UserToken = require("../models/userToken.js");
const verifyRefreshToken = require("../utils/verifyRefreshToken.js");
const generateTokens = require("../utils/generateToken.js");
const Message = require("../models/message.js");
const returnVerifiedRefreshToken = require("../utils/returnVerifiedRefreshToken.js");

const getAllChats = async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: "userId is required" });

  try {
    // Get all messages involving the user
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 });

    const chatMap = new Map();

    for (let msg of messages) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;

      if (!chatMap.has(otherUserId)) {
        chatMap.set(otherUserId, msg); // store latest message per unique user
      }
    }

    const chatList = [];

    for (let [otherUserId, latestMessage] of chatMap.entries()) {
      const otherUser = await User.findById(otherUserId).select("_id name");

      if (otherUser) {
        chatList.push({
          participants: [
            { _id: userId }, // current user
            { _id: otherUser._id, name: otherUser.name }
          ],
          latestMessage: {
            message: latestMessage.message,
            timestamp: latestMessage.createdAt
          }
        });
      }
    }

    res.json(chatList);
  } catch (err) {
    console.error("Error in /allchats:", err);
    res.status(500).json({ error: "Server error" });
  }
};




const sendText = async (req, res) => {
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

const login = async (req, res) => {
  try {
    const user = await User.findOne({ mail: req.body.mail });
    if (!user) {
      return res.status(401).send({ message: "Invalid Email or Password" });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(401).send({ message: "Invalid Email or Password" });
    }

    const { accessToken, refreshToken } = await generateTokens(user);
    res.status(200).send({
      message: "logged in successfully",
      refreshToken,
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const register = async (req, res) => {
  try {
    let user = await User.findOne({ mail: req.body.mail });
    if (user) {
      return res.status(200).send({
        message: "User with given email already Exist!",
        info: "userExist",
      });
    }

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    user = await new User({ ...req.body, password: hashPassword }).save();

    res.status(201).send({
      message: "User registered successfully",
      info: "registered",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const verifyingToken = async (req,res) => {
const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: true, message: "Token is required" });
  }
  const tokenDetails = await returnVerifiedRefreshToken(token);
  if (!tokenDetails) {
    return res.status(401).json({ error: true, message: "Invalid or expired refresh token" });
  }
  return res.status(200).json({
    error: false,
    userid: tokenDetails._id,
    message: "Token verified successfully",
  });
}

const token = async (req, res) => {
  verifyRefreshToken(req.body.token)
    .then(async ({ tokenDetails }) => {
      const payload = { _id: tokenDetails._id, role: tokenDetails.role };
      const accessToken = jwt.sign(payload, process.env.JWTPRIVATEKEY, {
        expiresIn: "14m",
      });
      const allNotifications = await Product.find({ sellerId: tokenDetails._id });
      const findata = allNotifications.map((product) => ({
        prodId: product._id,
        pname: product.pname,
        pimage: product.pimage,
        sellerName: product.sellerName,
      }));

      res.status(200).send({
        error: false,
        userid: tokenDetails._id,
        allNotifications: findata,
        role: tokenDetails.role,
        message: "Access token created successfully",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
};

const delToken = async (req, res) => {
  try {
    const usertoken = await UserToken.findOne({ token: req.body.refreshToken });
    if (!usertoken)
      return res
        .status(200)
        .send({ error: false, message: "Logged Out Sucessfully" });

    await usertoken.remove();
    res.status(200).send({ error: false, message: "Logged Out Sucessfully" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: true, message: "Internal Server Error" });
  }
};

const fixdeal = async (req, res) => {
  try {
    const { productid, sellerid, buyerid } = req.body;
    const { pname, pprice, pimage } = await Product.findById(productid);
    const { name: buyerName, mail } = await User.findById(buyerid);
    const { name: sellerName } = await User.findById(sellerid);

    const dealData = {
      pname,
      productprice: pprice,
      pimage,
      buyername: buyerName,
      mail,
      sellername: sellerName,
    };

    res.status(200).send({ fixdeal: dealData });
  } catch (error) {
    console.log(error);
    res.status(300).send({ error: true });
  }
};


const profile = async (req, res) => {
  try {
    const tokenDetails = await returnVerifiedRefreshToken(req.body.token);
    console.log("Token Details:", tokenDetails); 
    // const { id } = req.body;
    const user = await User.findOne({ _id: tokenDetails._id });
    const data = await Product.find({ sellerId: tokenDetails._id });
    const myprodData = data.map((product) => {
      return {
        id: product._id,
        pname: product.pname,
        pprice: product.pprice,
        pimage: product.pimage,
        preg: product.preg,


      };
    });

    if (!user) {
      res.status(400).send({
        error: true,
        message: "User not found",
        myproducts: myprodData,
      });
    }
    res.status(200).send({ error: false, data: user, myproducts: myprodData });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: true });
  }
};



const deletemyprod = async (req, res) => {
  try {
    const { pid } = req.body;
    await Product.deleteOne({ _id: pid });
    res.status(200).send({ error: false });
  } catch (error) {
    res.status(400).send({ error: true });
  }
};

const delAcc = async (req, res) => {
  try {
    const id = req.body.id;
    await User.deleteOne({ _id: id });
    await UserToken.deleteOne({ userId: id });
    await Product.deleteOne({ sellerId: id });
    res
      .status(200)
      .send({ error: false, message: "Account deleted Successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: true });
  }
};

const logout = async (req, res) => {
  try {
    const id = req.body.id;
    await UserToken.deleteOne({ userId: id });
    res.status(200).send({ error: false, message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: true });
  }
};

const update = async (req, res) => {
  try {
    const newData = req.body.newData;
    const id = req.body.id;
    await User.updateOne({ _id: id }, newData);
    res.status(200).send({ error: false, message: "Updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: true });
  }
};

const displayProd = async (req, res) => {
  try {
    const data = await Product.find({}).lean();
    res.status(200).send({ error: false, details: data });
  } catch (error) {
    console.log("Error: ", error);
    res.status(400).send({ error: true });
  }

};

const searchproduct = async (req, res) => {
  try {
    const { searchval } = req.body;
    const data = await Product.find({ pname: searchval });
    res.status(200).send({ mysearchdata: data });
  } catch (error) {
    res.status(400).send({ error: true });
  }
};


const prodData = async (req, res) => {
  try {
    const id = req.body.id;
    console.log("Product ID:", id);
    const data = await Product.findById(id);
    if (!data) {
      return res.status(404).send({ error: true, message: "Product not found" });
    }
    const seller = await User.findById(data.id);
    if (!seller) {
      return res.status(404).send({ error: true, message: "Seller not found" });
    }
    const { name, mail, phone } = seller;
    return res.status(200).send({
      error: false,
      details: { data, name, mail, phone },
    });
  } catch (error) {
    console.error("prodData error:", error);
    return res.status(400).send({ error: true, message: "Bad request" });
  }
};

const sell = async (req, res) => {
  try {
    const { pdata, id } = req.body;
    pdata[id] = id;
    await Product.create(pdata);
    res
      .status(200)
      .send({ error: false, message: "Product added successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: true, message: "Product wasn't added" });
  }
};


const confirmdeal = async (req, res) => {
  try {
    const { productid, sellerid, mail, productname, bprice } = req.body;
    const sellerinfo = await User.findById(sellerid);
    await Product.deleteOne({ _id: productid });
    const text = `Hi, I am ${sellerinfo.name}, and I look forward to fixing the deal of ${productname} for Rs.${bprice}.\nYou can find my contact details attached here\nAddress: ${sellerinfo.address}\nPhone  : ${sellerinfo.phone}\nEmail  : ${sellerinfo.mail}`;

    await sendEmail(mail, "Confirm Deal", text);
    res.status(200).send({ error: false });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: true });
  }
};


module.exports = {
  prodData,
  login,
  logout,
  register,
  token,
  delToken,
  profile,
  delAcc,
  update,
  displayProd,
  searchproduct,
  sell,
  fixdeal,
  deletemyprod,
  confirmdeal,
  verifyingToken,
  sendText,
  receiveText,
  msg,
  getAllChats,
};
