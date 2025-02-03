const express = require("express");
const { Client } = require("pg");
const cors = require("cors");

const app = express();
const port = 5000;

// PostgreSQL 연결 설정
const client = new Client({
  host: "localhost",
  port: 5432,
  database: "postgres", // 사용할 데이터베이스
  user: "postgres", // PostgreSQL 사용자명
  password: "root", // PostgreSQL 비밀번호
});

client.connect();

// 미들웨어 설정
app.use(cors());
app.use(express.json()); // JSON 형식으로 받은 요청 처리

// 간단한 API 예시: 모든 사용자 목록 가져오기
app.get("/users", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching users");
  }
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});