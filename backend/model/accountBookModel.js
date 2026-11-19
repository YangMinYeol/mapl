const db = require("../db");
const {
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
  format,
  parseISO,
} = require("date-fns");

function mapAccountBookRow(row) {
  return {
    // account_book
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    type: row.type,
    content: row.content,
    amount: Number(row.amount),
    occurredAt: row.occurred_at,
    occurredDate: row.occurred_date,
    hasTime: row.has_time,
    createdAt: row.created_at,
    assetId: row.asset_id,
    // account_book_category
    categoryName: row.name,
    colorId: row.color_id,
    // color
    colorHex: row.hex,
  };
}

// 시간 지정 거래는 pg가 timestamp를 해석하는 서버 시간대에서 사용자 시간대로 변환한다.
async function getDashboardAccountBooks(userId, startDate, endDate, timeZone) {
  const params = [userId];
  const conditions = ["ab.user_id = $1"];
  if (startDate || endDate) {
    let day = "ab.occurred_at::date";
    if (timeZone) {
      params.push(Intl.DateTimeFormat().resolvedOptions().timeZone, timeZone);
      day = "(CASE WHEN ab.has_time THEN (ab.occurred_at AT TIME ZONE $2) AT TIME ZONE $3 ELSE ab.occurred_at END)::date";
    }
    if (startDate) {
      params.push(startDate);
      conditions.push(`${day} >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      conditions.push(`${day} <= $${params.length}`);
    }
  }

  const result = await db.query(`
    SELECT ab.*, abc.name, abc.color_id, c.hex,
      CASE WHEN NOT ab.has_time THEN to_char(ab.occurred_at, 'YYYY-MM-DD') END AS occurred_date
    FROM account_book ab
    JOIN account_book_category abc ON ab.category_id = abc.id
    LEFT JOIN color c ON abc.color_id = c.id
    WHERE ${conditions.join(" AND ")}
    ORDER BY ab.occurred_at DESC, ab.id DESC
  `, params);
  return result.rows.map(mapAccountBookRow);
}

function getCalendarAccountBooks(userId, currentDate, timeZone) {
  const month = parseISO(currentDate);
  return getDashboardAccountBooks(
    userId,
    format(startOfMonth(subMonths(month, 1)), "yyyy-MM-dd"),
    format(endOfMonth(addMonths(month, 1)), "yyyy-MM-dd"),
    timeZone
  );
}

// 가계부 항목 추가
async function addAccountBookItem(
  userId,
  assetId,
  type,
  occurredAt,
  categoryId,
  content,
  amount,
  hasTime = true
) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const date = hasTime ? new Date(occurredAt) : `${occurredAt} 00:00:00`;

    // 소유한 자산과 해당 유형의 카테고리만 거래에 연결한다.
    const inserted = await client.query(
      `
      INSERT INTO account_book(user_id, type, occurred_at, category_id, asset_id, content, amount, has_time)
      SELECT $1, $2, $3, c.id, a.id, $6, $7, $8
      FROM account_book_category c, asset a
      WHERE c.id = $4 AND c.user_id = $1 AND c.type = $2 AND a.id = $5 AND a.user_id = $1
      `,
      [userId, type, date, categoryId, assetId, content, amount, hasTime]
    );

    if (!inserted.rowCount) throw new Error("자산 또는 카테고리를 찾을 수 없습니다.");

    // 2. 자산 balance 업데이트
    const assetUpdateQuery = `
      UPDATE asset
      SET balance = balance ${type === "income" ? "+" : "-"} $1,
          updated_at = NOW()
      WHERE id = $2 AND user_id = $3
    `;

    await client.query(assetUpdateQuery, [amount, assetId, userId]);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// 가계부 항목 수정 (자산 반영 포함)
async function updateAccountBookItem(
  itemId,
  newType,
  newOccurredAt,
  newCategoryId,
  newContent,
  newAmount,
  hasTime,
  userId
) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1. 기존 항목 정보 조회
    const selectQuery = `
      SELECT user_id, asset_id, type AS old_type, amount AS old_amount
      FROM account_book
      WHERE id = $1 AND user_id = $2
      FOR UPDATE
    `;
    const { rows } = await client.query(selectQuery, [itemId, userId]);
    const existing = rows[0];

    if (!existing) {
      throw new Error("수정할 항목을 찾을 수 없습니다.");
    }

    const { user_id, asset_id, old_type, old_amount } = existing;

    // 2. 자산 balance 되돌리기 (기존 항목 삭제하는 것처럼)
    const reverseOperator = old_type === "income" ? "-" : "+";
    await client.query(
      `
      UPDATE asset
      SET balance = balance ${reverseOperator} $1,
          updated_at = NOW()
      WHERE id = $2 AND user_id = $3
      `,
      [old_amount, asset_id, user_id]
    );

    // 3. 자산 balance 재적용 (새 항목 추가하는 것처럼)
    const applyOperator = newType === "income" ? "+" : "-";
    await client.query(
      `
      UPDATE asset
      SET balance = balance ${applyOperator} $1,
          updated_at = NOW()
      WHERE id = $2 AND user_id = $3
      `,
      [newAmount, asset_id, user_id]
    );

    // 4. 가계부 항목 수정
    const updated = await client.query(
      `
      UPDATE account_book
      SET type = $1,
          occurred_at = $2,
          category_id = $3,
          content = $4,
          amount = $5,
          has_time = $7
      WHERE id = $6 AND EXISTS (SELECT 1 FROM account_book_category
        WHERE id = $3 AND type = $1 AND user_id = $8)
      `,
      [
        newType,
        hasTime ? new Date(newOccurredAt) : `${newOccurredAt} 00:00:00`,
        newCategoryId,
        newContent,
        newAmount,
        itemId,
        hasTime,
        userId,
      ]
    );
    if (!updated.rowCount) throw new Error("카테고리를 찾을 수 없습니다.");

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// 가계부 항목 삭제 (자산 반영 포함)
async function deleteAccountBookItem(itemId, userId) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1. 삭제 대상 가계부 항목 정보 조회
    const selectQuery = `
      SELECT id, user_id, asset_id, type, amount
      FROM account_book
      WHERE id = $1 AND user_id = $2
      FOR UPDATE
    `;
    const { rows } = await client.query(selectQuery, [itemId, userId]);
    const item = rows[0];

    if (!item) {
      throw new Error("삭제할 항목을 찾을 수 없습니다.");
    }

    const { user_id, asset_id, type, amount } = item;

    // 2. 자산 balance 되돌리기
    const reverseOperator = type === "income" ? "-" : "+";
    const updateAssetQuery = `
      UPDATE asset
      SET balance = balance ${reverseOperator} $1,
          updated_at = NOW()
      WHERE id = $2 AND user_id = $3
    `;
    await client.query(updateAssetQuery, [amount, asset_id, user_id]);

    // 3. 가계부 항목 삭제
    const deleteQuery = `DELETE FROM account_book WHERE id = $1`;
    await client.query(deleteQuery, [itemId]);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  getDashboardAccountBooks,
  getCalendarAccountBooks,
  addAccountBookItem,
  updateAccountBookItem,
  deleteAccountBookItem,
};
