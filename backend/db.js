require("dotenv").config(); // .env 파일 로드

const { Client } = require("pg");

const client = new Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});

client
  .connect()
  .then(() => console.log("PostgreSQL 연결 성공"))
  .catch((err) => console.error("PostgreSQL 연결 오류:", err));

module.exports = client;
