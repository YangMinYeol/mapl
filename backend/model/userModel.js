const db = require("../db");

// 유저 정보 가져오기
function getUserInfo(userId) {
  return db.query(`SELECT * FROM users WHERE user_id = $1`, [userId]);
}

// 아이디, 이메일 중복확인
function checkUserIdOrEmailExist(field, value) {
  return db.query(`SELECT COUNT(*) AS count FROM users WHERE ${field} = $1`, [
    value,
  ]);
}

// 회원가입
function createUser(userData) {
  const { userId, name, password, email, zipcode, address, detailAddress } =
    userData;
  return db.query(
    "INSERT INTO users (user_id, name, password, email, zipcode, address, detail_address) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [userId, name, password, email, zipcode, address, detailAddress]
  );
}

module.exports = { getUserInfo, checkUserIdOrEmailExist, createUser };
