const db = require("../db");

function mapUserRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    password: row.password,
    email: row.email,
    zipcode: row.zipcode,
    address: row.address,
    detailAddress: row.detail_address,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// 유저 정보 가져오기
async function getUserInfo(userId) {
  const result = await db.query(`SELECT * FROM users WHERE user_id = $1`, [
    userId,
  ]);
  return result.rows.map(mapUserRow);
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

    // 3. account_book_category 테이블에 income, expense 초기값 추가
    await client.query(
      `INSERT INTO account_book_category(user_id, type, name, color_id, is_default, sort_order)
      VALUES 
        ($1, 'income', '기타', 10, true, 0),
        ($1, 'expense', '기타', 10, true, 0)`,
      [createdUserId]
    );
    await client.query("COMMIT");
    return createdUserId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// 회원삭제
async function deleteAccount(id) {
  const query = `DELETE FROM users WHERE id= $1`;
  return db.query(query, [id]);
}

// 회원 정보 수정
async function updateProfile({
  id,
  password,
  email,
  zipcode,
  address,
  detailAddress,
}) {
  const query = `
    UPDATE users
    SET password = $1, email = $2, zipcode = $3, address = $4, detail_address = $5
    WHERE id = $6
  `;
  return db.query(query, [
    password,
    email,
    zipcode,
    address,
    detailAddress,
    id,
  ]);
}

module.exports = {
  getUserInfo,
  checkUserIdOrEmailExist,
  createUser,
  deleteAccount,
  updateProfile,
};
