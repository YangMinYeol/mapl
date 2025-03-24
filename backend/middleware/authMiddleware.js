const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  let errorMessage = "인증이 필요합니다.";

  if (!token) {
    return res.status(401).json({ message: errorMessage });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    errorMessage = "토큰이 유효하지 않습니다.";
    if (error.name === "TokenExpiredError") {
      errorMessage = "토큰이 만료되었습니다";
      console.error(errorMessage, error);
      return res.status(401).json({ message: errorMessage });
    }
    console.error(errorMessage, error);
    return res.status(403).json({ message: errorMessage });
  }
}

module.exports = verifyToken;
