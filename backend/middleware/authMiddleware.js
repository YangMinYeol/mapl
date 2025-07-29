const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    return res.status(401).json({ message: "인증이 필요합니다." });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = {
      id: decoded.id,
      userId: decoded.userId,
    };
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
