const db = require("../db");

// 메모 목록 조회
async function getMemo(userId, selectedDate) {
  const query = `
    SELECT * 
    FROM memo 
    WHERE user_id = $1 
      AND ((start_date <= $2 AND end_date >= $2) OR period_id = 5)
  `;
  return db.query(query, [userId, selectedDate]);
}

// 메모 추가
async function addMemo(memos) {
  try {
    await db.query("BEGIN");

    const insertedMemos = [];

    for (const memoData of memos) {
      const { userId, content, startDate, endDate, periodId, link, isLinked } =
        memoData;

      // sort_order 계산
      const newSortOrder = await getNewSortOrder(userId, startDate, periodId);

      // 1. 메모를 추가하면서 link는 임시로 NULL로 설정
      const insertQuery = `
        INSERT INTO memo (user_id, content, start_date, end_date, sort_order, period_id, is_linked, link )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NULL)
        RETURNING id;
      `;

      const result = await db.query(insertQuery, [
        userId,
        content,
        startDate,
        endDate,
        newSortOrder,
        periodId,
        isLinked,
      ]);

      const memoId = result.rows[0].id;

      // 2. link를 해당 값 업데이트
      const finalLink = isLinked ? link : memoId;

      const updateLinkQuery = `
        UPDATE memo
        SET link = $1
        WHERE id = $2
        RETURNING *;
      `;
      const updatedMemo = await db.query(updateLinkQuery, [finalLink, memoId]);

      insertedMemos.push(updatedMemo.rows[0]);
    }

    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("메모 추가 중 오류 발생:", error);
    throw new Error("메모 추가 실패: " + error.message);
  }
}

async function getNewSortOrder(userId, startDate, periodId) {
  let query;
  let params;

  // 버킷리스트인 경우
  if (startDate === null) {
    query = `
      SELECT COALESCE(MAX(sort_order), 0) + 1 AS new_sort_order
      FROM memo
      WHERE user_id = $1 AND period_id = $2 AND start_date IS NULL;
    `;
    params = [userId, periodId];
  } else {
    query = `
      SELECT COALESCE(MAX(sort_order), 0) + 1 AS new_sort_order
      FROM memo
      WHERE user_id = $1 AND start_date = $2 AND period_id = $3;
    `;
    params = [userId, startDate, periodId];
  }

  const result = await db.query(query, params);
  return result.rows[0].new_sort_order;
}
// 메모 삭제
async function deleteMemo(memoId) {
  const query = `DELETE FROM memo WHERE id = $1`;
  return db.query(query, [memoId]);
}

// 메모 상태 변경
async function toggleMemoCompletion(memoId) {
  const query = `UPDATE memo SET completed = NOT completed WHERE id = $1`;
  return db.query(query, [memoId]);
}

module.exports = { getMemo, addMemo, deleteMemo, toggleMemoCompletion };
