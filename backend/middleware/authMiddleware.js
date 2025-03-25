const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "인증이 필요합니다." });
  }

  try {
    req.user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    next();
  } catch (error) {
    const isTokenExpired = error.name === "TokenExpiredError";
    const statusCode = isTokenExpired ? 401 : 403;
    const errorMessage = isTokenExpired
      ? "토큰이 만료되었습니다."
      : "토큰이 유효하지 않습니다.";

    console.error(errorMessage, error);
    return res.status(statusCode).json({ message: errorMessage });
  }
}

module.exports = verifyToken;
