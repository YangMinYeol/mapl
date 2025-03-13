const db = require("../db");

// 메모 목록 조회
async function getMemo(userId, startDate) {
  const query = `
    SELECT * FROM memo WHERE user_id = $1 AND start_date = $2
  `;
  return db.query(query, [userId, startDate]);
}

// 메모 추가
async function addMemo(memoData) {
  const { userId, content, startDate } = memoData;

  try {
    await db.query("BEGIN");

    // sort_order 계산
    const newSortOrder = await getNewSortOrder(userId, startDate);

    // 메모 추가
    const insertQuery = `
      INSERT INTO memo (user_id, content, start_date, sort_order, completed)
      VALUES ($1, $2, $3, $4, false)
      RETURNING *;
    `;
    const result = await db.query(insertQuery, [
      userId,
      content,
      startDate,
      newSortOrder,
    ]);

    await db.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await db.query("ROLLBACK");
    throw new Error("메모 추가 실패: " + error.message);
  }
}

// 새로운 sort_order 계산
async function getNewSortOrder(userId, startDate) {
  const query = `
    SELECT COALESCE(MAX(sort_order), 0) + 1 AS new_sort_order
    FROM memo WHERE user_id = $1 AND start_date = $2;
  `;
  const result = await db.query(query, [userId, startDate]);
  return result.rows[0].new_sort_order;
}

// 메모 삭제
async function deleteMemo(memoId) {
  const query = `DELETE FROM memo WHERE id = $1`;
  return db.query(query, [memoId]);
}

module.exports = { getMemo, addMemo, deleteMemo };
