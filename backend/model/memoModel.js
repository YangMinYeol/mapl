const db = require("../db");
const {
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
  format,
  parseISO,
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
  const prevMonthStart = startOfMonth(subMonths(parseISO(currentDate), 1));
  const nextMonthEnd = endOfMonth(addMonths(parseISO(currentDate), 1));

  const startDate = format(prevMonthStart, "yyyy-MM-dd");
  const endDate = format(nextMonthEnd, "yyyy-MM-dd");

  const query = `
    SELECT 
      memo.*,
      color.hex AS color_hex
    FROM memo
    JOIN color ON memo.color_id = color.id
    WHERE memo.user_id = $1
      AND memo.end_date >= $2
      AND memo.start_date <= $3
  `;

  const result = await db.query(query, [userId, startDate, endDate]);
  return result.rows.map(mapMemoRow);
}

// 메모 추가
async function addMemo(memos, userId) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const insertedMemos = [];

    for (const memo of memos) {
      // 1. 메모 추가
      const memoId = await insertMemo(client, { ...memo, userId });

      if (memo.isLinked) {
        // 2. 메모 링크 값 업데이트
        const updatedMemo = await updateMemoLink(client, memoId, memo.link);
        insertedMemos.push(updatedMemo);
        // 3. 부모 메모 링크여부 업데이트
        await markParentAsLinked(client, memo.link, userId);
      } else {
        const updatedMemo = await updateMemoLink(client, memoId, memoId);
        insertedMemos.push(updatedMemo);
      }
    }

    await client.query("COMMIT");
    return insertedMemos;
  } catch (error) {
    await client.query("ROLLBACK");
    throw new Error("메모 추가 실패: " + error.message);
  } finally {
    client.release();
  }
}

// 메모 추가
async function insertMemo(client, {
  userId,
  content,
  startDate,
  endDate,
  startTime = null,
  endTime = null,
  allDay = true,
  periodId,
  isLinked,
  colorId = 5,
}) {
  const query = `
    INSERT INTO memo (user_id, content, start_date, end_date, start_time, end_time, allday, period_id, color_id, is_linked, link)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NULL)
    RETURNING id;
  `;
  const result = await client.query(query, [
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
async function updateMemoLink(client, memoId, linkId) {
  const query = `
    UPDATE memo SET link = $1 WHERE id = $2 RETURNING *;
  `;
  const result = await client.query(query, [linkId, memoId]);
  return result.rows[0];
}

// 부모 메모 링크여부 업데이트
async function markParentAsLinked(client, parentId, userId) {
  const parent = await client.query(
    "UPDATE memo SET is_linked = true WHERE id = $1 AND user_id = $2 RETURNING id",
    [parentId, userId]
  );
  if (!parent.rowCount) throw new Error("연결할 메모를 찾을 수 없습니다.");
}

// 메모 수정
async function updateMemo(memo, userId) {
  const { id, content, startDate, endDate, startTime, endTime, allDay, colorId } = memo;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE memo SET content = $1, start_date = $2, end_date = $3, start_time = $4,
        end_time = $5, allday = $6, color_id = $7 WHERE id = $8 AND user_id = $9
        RETURNING link, is_linked`,
      [content, startDate, endDate, startTime, endTime, allDay, colorId, id, userId]
    );
    const updated = result.rows[0];
    if (!updated) throw new Error("수정할 메모를 찾을 수 없습니다.");
    if (updated.is_linked) {
      await client.query("UPDATE memo SET content = $1 WHERE link = $2 AND user_id = $3",
        [content, updated.link, userId]);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// 메모 삭제
async function deleteMemo(memoId, userId) {
  const query = `DELETE FROM memo WHERE id = $1 AND user_id = $2`;
  return db.query(query, [memoId, userId]);
}

// 링크 메모 일괄 삭제
async function deleteLinkedMemos(linkId, userId) {
  const query = `DELETE FROM memo WHERE link = $1 AND user_id = $2`;
  return db.query(query, [linkId, userId]);
}

// 메모 상태 변경
async function toggleMemoCompletion(memoId, userId) {
  const query = `UPDATE memo SET completed = NOT completed WHERE id = $1 AND user_id = $2`;
  return db.query(query, [memoId, userId]);
}

// 링크 메모 상태 일괄 변경
async function toggleLinkedMemosCompletion(linkId, userId) {
  const query = `UPDATE memo SET completed = NOT completed WHERE link = $1 AND user_id = $2`;
  return db.query(query, [linkId, userId]);
}

// 메모 미루기
async function postponeMemo(memoId, startDate, endDate, userId) {
  const query = `
    UPDATE memo
    SET start_date = $1,
        end_date = $2
    WHERE id = $3 AND user_id = $4
  `;
  return db.query(query, [startDate, endDate, memoId, userId]);
}

// 링크 연결되어있는 메모 목록 불러오기
async function getLinkedMemos(linkId, userId) {
  const query = `
    SELECT memo.*,
      color.hex AS color_hex,
      period_type.name AS period_name
    FROM memo 
    JOIN color 
    ON memo.color_id = color.id
    JOIN period_type
    ON memo.period_id = period_type.id
    WHERE link = $1 AND memo.user_id = $2;
  `;
  const result = await db.query(query, [linkId, userId]);
  return result.rows.map(mapMemoRow);
}

// 링크되어있는 메모 링크 해제
async function unlinkMemo(memoId, linkId, userId) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const group = await client.query(
      "SELECT id FROM memo WHERE user_id = $1 AND link = $2 AND is_linked ORDER BY id FOR UPDATE",
      [userId, linkId]
    );
    const ids = group.rows.map((row) => row.id);
    const target = ids.find((id) => String(id) === String(memoId));
    if (target != null && ids.length >= 2) {
      await client.query(
        "UPDATE memo SET link = id, is_linked = false WHERE user_id = $1 AND id = ANY($2::int[])",
        [userId, ids.length === 2 ? ids : [target]]
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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
  unlinkMemo,
};
