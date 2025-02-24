const express = require("express");
const cors = require("cors");
const userRoute = require("./route/userRoute");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// 라우트 설정
app.use("/api/user", userRoute);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
