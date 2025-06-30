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
async function createUser(userData) {
  const { userId, name, password, email, zipcode, address, detailAddress } =
    userData;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1. 유저 생성 및 id 반환
    const userResult = await client.query(
      `INSERT INTO users (user_id, name, password, email, zipcode, address, detail_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
      [userId, name, password, email, zipcode, address, detailAddress]
    );

    const createdUserId = userResult.rows[0].id;

    // 2. asset 테이블에 초기값 0 삽입
    await client.query(`INSERT INTO asset (user_id, balance) VALUES ($1, $2)`, [
      createdUserId,
      0,
    ]);
    await client.query("COMMIT");
    return createdUserId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { getUserInfo, checkUserIdOrEmailExist, createUser };
