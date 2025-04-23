const db = require("../db");
const {
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
  format,
} = require("date-fns");

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

// 달력 메모 목록 조회
async function getCalendarMemo(userId, currentDate) {
  const prevMonthStart = startOfMonth(subMonths(currentDate, 1));
  const nextMonthEnd = endOfMonth(addMonths(currentDate, 1));

  const startDate = format(prevMonthStart, "yyyy-MM-dd");
  const endDate = format(nextMonthEnd, "yyyy-MM-dd");
  const query = `
    SELECT 
      memo.id,
      memo.user_id,
      memo.content,
      memo.start_date,
      memo.period_id,
      memo.sort_order,
      memo.completed,
      memo.allday,
      memo.color_id,
      color.hex AS color_hex
    FROM memo
    JOIN color ON memo.color_id = color.id
    WHERE memo.user_id = $1
    AND memo.start_date BETWEEN $2 AND $3
    ORDER BY memo.period_id, memo.start_date, memo.sort_order
  `;

  return db.query(query, [userId, startDate, endDate]);
}

// 메모 추가
async function addMemo(memos) {
  try {
    await db.query("BEGIN");

    const insertedMemos = [];

    for (const memoData of memos) {
      const {
        userId,
        content,
        startDate,
        endDate,
        startTime = null,
        endTime = null,
        allDay = true,
        periodId,
        link,
        isLinked,
        colorId = 10,
      } = memoData;

      // sort_order 계산
      const newSortOrder = await getNewSortOrder(userId, startDate, periodId);

      // 1. 메모를 추가하면서 link는 임시로 NULL로 설정
      const insertQuery = `
        INSERT INTO memo (user_id, content, start_date, end_date,start_time, end_time, allday, sort_order, period_id, color_id, is_linked, link )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NULL)
        RETURNING id;
      `;

      const result = await db.query(insertQuery, [
        userId,
        content,
        startDate,
        endDate,
        startTime,
        endTime,
        allDay,
        newSortOrder,
        periodId,
        colorId,
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

// 링크 메모 일괄 삭제
async function deleteLinkedMemos(linkId) {
  const query = `DELETE FROM memo WHERE link = $1`;
  return db.query(query, [linkId]);
}

// 메모 상태 변경
async function toggleMemoCompletion(memoId) {
  const query = `UPDATE memo SET completed = NOT completed WHERE id = $1`;
  return db.query(query, [memoId]);
}

// 링크 메모 상태 일괄 변경
async function toggleLinkedMemosCompletion(linkId) {
  const query = `UPDATE memo SET completed = NOT completed WHERE link = $1`;
  return db.query(query, [linkId]);
}

module.exports = {
  getMemo,
  getCalendarMemo,
  addMemo,
  deleteMemo,
  deleteLinkedMemos,
  toggleMemoCompletion,
  toggleLinkedMemosCompletion,
};
