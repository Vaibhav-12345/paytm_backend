const jwt = require("jsonwebtoken");
const jwt_secret_key = process.env.JWT_SECRET_KEY;

async function userMiddelware(req, res, next) {
  // yaha pe headers hota hai
  let token = req.headers.token;

  //   if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //     return res.status(403).json({});
  //   }

  //   const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, jwt_secret_key);
    if (decoded.userId) {
      req.userId = decoded.userId;
      next();
    } else {
      res.status(403).json({
        message:'user not login'
      });
    }
  } catch (error) {
    res.status(403).json({
      message: "token Invalid",
    });
  }
}

module.exports = userMiddelware;
