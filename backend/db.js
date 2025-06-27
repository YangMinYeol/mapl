require("dotenv").config(); // .env 파일 로드

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});

// 연결 테스트 (옵션)
pool
  .connect()
  .then((client) => {
    console.log("PostgreSQL 연결 성공");
    client.release(); // 테스트 후 커넥션 반환
  })
  .catch((err) => console.error("PostgreSQL 연결 오류:", err));

module.exports = pool;
