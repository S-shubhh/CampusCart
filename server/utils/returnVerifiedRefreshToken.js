const UserToken = require("../models/userToken.js");
const jwt = require("jsonwebtoken");

const returnVerifiedRefreshToken = async (refreshToken) => {
  const privateKey = process.env.JWTREFRESHPRIVATEKEY;



  try {
    const tokenDetails = jwt.verify(refreshToken, privateKey);
    return tokenDetails;
  } catch (err) {
    return null;
  }
};

module.exports = returnVerifiedRefreshToken;
