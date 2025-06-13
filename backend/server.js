const express = require("express");
const cors = require("cors");
const userRoute = require("./route/userRoute");
const memoRoute = require("./route/memoRoute");
const periodRoute = require("./route/periodRoute");
const colorRoute = require("./route/colorRoute");
const reportRoute = require("./route/reportRoute");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// 라우트 설정
app.use("/api/user", userRoute);
app.use("/api/memo", memoRoute);
app.use("/api/period", periodRoute);
app.use("/api/color", colorRoute);
app.use("/api/report", reportRoute);

// 업로드 이미지 설정
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
