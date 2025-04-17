const express = require("express");
const cors = require("cors");
const userRoute = require("./route/userRoute");
const memoRoute = require("./route/memoRoute");
const periodRoute = require("./route/periodRoute");
const colorRoute = require("./route/colorRoute");
const cookieParser = require("cookie-parser");

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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
