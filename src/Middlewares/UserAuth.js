
const jwt = require("jsonwebtoken");
const User = require("../Models/Users");

const authMiddleware = async (req, res, next) => {
  try {
    if (req.header("Authorization")) {
      const token = req.header("Authorization").replace('Bearer ', '');
      const decoded = jwt.verify(token, "your_jwt_secret");
      console.log("the decoeed" , decoded)
      const user = await User.findOne({ _id: decoded.userId, token: token });

      if (!user) {
        throw new Error("User not found");
      }

      req.user = user; // Attach user object to request
      req.token = token; // Attach token to request
      next(); // Call next middleware or route handler
    } else {
      throw new Error("Authorization header missing");
    }
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

module.exports = authMiddleware;