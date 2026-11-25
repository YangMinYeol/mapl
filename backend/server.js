const express = require("express");
const cors = require("cors");
const userRoute = require("./route/userRoute");
const memoRoute = require("./route/memoRoute");
const periodRoute = require("./route/periodRoute");
const colorRoute = require("./route/colorRoute");
const reportRoute = require("./route/reportRoute");
const noticeRoute = require("./route/noticeRoute");
const freeRoute = require("./route/freeRoute");
const accountBookRoute = require("./route/accountBookRoute");
const accountBookCategoryRoute = require("./route/accountBookCategoryRoute");
const assetRoute = require("./route/assetRoute");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const port = 5000;

const authOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://mapl.vercel.app",
  ...(process.env.FRONTEND_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean),
]);
const cookieRoutes = new Set(["/api/user/login", "/api/user/refresh", "/api/user/logout"]);
app.use(cors((req, callback) => {
  const origin = req.get("Origin");
  const usesAuthCookie = cookieRoutes.has(req.path.replace(/\/$/, ""));
  callback(null, usesAuthCookie
    ? { origin: authOrigins.has(origin) ? origin : false, credentials: true }
    : {});
}));
app.use(express.json());
app.use(cookieParser());

// Health check 엔드포인트 (UptimeRobot용)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "Server is running",
  });
});

// 라우트 설정
app.use("/api/user", userRoute);
app.use("/api/memo", memoRoute);
app.use("/api/period", periodRoute);
app.use("/api/color", colorRoute);
app.use("/api/report", reportRoute);
app.use("/api/notice", noticeRoute);
app.use("/api/free", freeRoute);
app.use("/api/account-book", accountBookRoute);
app.use("/api/account-book-category", accountBookCategoryRoute);
app.use("/api/asset", assetRoute);

// 업로드 이미지 설정
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
