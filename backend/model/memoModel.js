const db = require("../db");
const {
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
  format,
} = require("date-fns");

// DB memo row → 프론트용 메모 객체로 매핑
function mapMemoRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    content: row.content,
    startDate: row.start_date,
    endDate: row.end_date,
    startTime: row.start_time,
    endTime: row.end_time,
    allday: row.allday,
    completed: row.completed,
    periodId: row.period_id,
    link: row.link,
    isLinked: row.is_linked,
    colorId: row.color_id,
    createdAt: row.created_at,
    colorHex: row.color_hex,
    periodName: row.period_name,
  };
}

// 메모 목록 조회
async function getMemos(userId, selectedDate) {
  const query = `
    SELECT memo.* ,
      color.hex AS color_hex
    FROM memo 
    JOIN color ON memo.color_id = color.id
    WHERE user_id = $1 
    AND ((start_date <= $2 AND end_date >= $2) OR period_id = 5)
    ORDER BY id;
  `;
  const result = await db.query(query, [userId, selectedDate]);
  return result.rows.map(mapMemoRow);
}

// 달력 메모 목록 조회
async function getCalendarMemos(userId, currentDate) {
  const prevMonthStart = startOfMonth(subMonths(currentDate, 1));
  const nextMonthEnd = endOfMonth(addMonths(currentDate, 1));

  const startDate = format(prevMonthStart, "yyyy-MM-dd");
  const endDate = format(nextMonthEnd, "yyyy-MM-dd");

  const query = `
    SELECT 
      memo.*,
      color.hex AS color_hex
    FROM memo
    JOIN color ON memo.color_id = color.id
    WHERE memo.user_id = $1
    AND memo.start_date <= $3
    AND memo.end_date >= $2
  `;

  const result = await db.query(query, [userId, startDate, endDate]);
  return result.rows.map(mapMemoRow);
}

// 메모 추가
async function addMemo(memos) {
  try {
    await db.query("BEGIN");

    const insertedMemos = [];

    for (const memo of memos) {
      // 1. 메모 추가
      const memoId = await insertMemo(memo);

      if (memo.isLinked) {
        // 2. 메모 링크 값 업데이트
        const updatedMemo = await updateMemoLink(memoId, memo.link);
        insertedMemos.push(updatedMemo);
        // 3. 부모 메모 링크여부 업데이트
        await markParentAsLinked(memo.link);
      } else {
        const updatedMemo = await updateMemoLink(memoId, memoId);
        insertedMemos.push(updatedMemo);
      }
    }

    await db.query("COMMIT");
    return insertedMemos;
  } catch (error) {
    await db.query("ROLLBACK");
    throw new Error("메모 추가 실패: " + error.message);
  }
}

// 메모 추가
async function insertMemo({
  userId,
  content,
  startDate,
  endDate,
  startTime = null,
  endTime = null,
  allDay = true,
  periodId,
  isLinked,
  colorId = 10,
}) {
  const query = `
    INSERT INTO memo (user_id, content, start_date, end_date, start_time, end_time, allday, period_id, color_id, is_linked, link)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NULL)
    RETURNING id;
  `;
  const result = await db.query(query, [
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
  return result.rows[0].id;
}

// 메모 링크 업데이트
async function updateMemoLink(memoId, linkId) {
  const query = `
    UPDATE memo SET link = $1 WHERE id = $2 RETURNING *;
  `;
  const result = await db.query(query, [linkId, memoId]);
  return result.rows[0];
}

// 부모 메모 링크여부 업데이트
async function markParentAsLinked(parentId) {
  await db.query(`UPDATE memo SET is_linked = true WHERE id = $1`, [parentId]);
}

// 메모 수정
async function updateMemo(memo) {
  const {
    id,
    content,
    startDate,
    endDate,
    startTime,
    endTime,
    allDay,
    link,
    isLinked,
    colorId,
  } = memo;

  // 1. 본인 메모(id 기준) 전체 수정
  const updateSelfQuery = `
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

  const selfResult = await db.query(updateSelfQuery, [
    content,
    startDate,
    endDate,
    startTime,
    endTime,
    allDay,
    colorId,
    id,
  ]);

  // 2. 링크된 메모가 있다면 해당 group 전체의 content 수정
  if (isLinked) {
    const updateLinkedQuery = `
      UPDATE memo
      SET content = $1
      WHERE link = $2;
    `;
    await db.query(updateLinkedQuery, [content, link]);
  }

  return selfResult;
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

// 메모 미루기
async function postponeMemo(memoId, startDate, endDate) {
  const query = `
    UPDATE memo
    SET start_date = $1,
        end_date = $2
    WHERE id = $3
  `;
  return db.query(query, [startDate, endDate, memoId]);
}

// 링크 연결되어있는 메모 목록 불러오기
async function getLinkedMemos(linkId) {
  const query = `
    SELECT memo.*,
      color.hex AS color_hex,
      period_type.name AS period_name
    FROM memo 
    JOIN color 
    ON memo.color_id = color.id
    JOIN period_type
    ON memo.period_id = period_type.id
    WHERE link = $1;
  `;
  const result = await db.query(query, [linkId]);
  return result.rows.map(mapMemoRow);
}

module.exports = {
  getMemos,
  getCalendarMemos,
  addMemo,
  updateMemo,
  deleteMemo,
  deleteLinkedMemos,
  toggleMemoCompletion,
  toggleLinkedMemosCompletion,
  postponeMemo,
  getLinkedMemos,
};
