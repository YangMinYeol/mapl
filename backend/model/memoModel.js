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
    ORDER BY id;
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
      memo.end_date,
      memo.start_time,
      memo.end_time,
      memo.period_id,
      memo.completed,
      memo.allday,
      memo.color_id,
      memo.created_at,
      color.hex AS color_hex
    FROM memo
    JOIN color ON memo.color_id = color.id
    WHERE memo.user_id = $1
    AND memo.start_date <= $3
    AND memo.end_date >= $2
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

      // 1. 메모를 추가하면서 link는 임시로 NULL로 설정
      const insertQuery = `
        INSERT INTO memo (user_id, content, start_date, end_date,start_time, end_time, allday, period_id, color_id, is_linked, link )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NULL)
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

// 메모 수정
async function updateMemo(memoData) {
  const {
    id,
    content,
    startDate,
    endDate,
    startTime,
    endTime,
    allDay,
    colorId,
  } = memoData;

  const query = `
  UPDATE memo
  SET content = $1,
      start_date = $2,
      end_date = $3,
      start_time = $4,
      end_time = $5,
      allDay = $6,
      color_id = $7
  WHERE id = $8;
`;

  const result = await db.query(query, [
    content,
    startDate,
    endDate,
    startTime,
    endTime,
    allDay,
    colorId,
    id,
  ]);

  return result;
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
  updateMemo,
  deleteMemo,
  deleteLinkedMemos,
  toggleMemoCompletion,
  toggleLinkedMemosCompletion,
};
