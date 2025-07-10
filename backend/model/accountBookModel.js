const db = require("../db");
const {
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
  format,
  addDays,
} = require("date-fns");

// 하루 더한 yyyy-MM-dd 문자열 반환
function getNextDateString(dateStr) {
  const date = new Date(dateStr);
  const nextDate = addDays(date, 1);
  return format(nextDate, "yyyy-MM-dd");
}

function mapAccountBookRow(row) {
  return {
    // account_book
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    type: row.type,
    content: row.content,
    amount: row.amount,
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
    assetId: row.asset_id,
    // account_book_category
    categoryName: row.name,
    colorId: row.color_id,
    // color
    colorHex: row.hex,
  };
}

// 대시보드용 가계부 조회 (종료일은 exclusive)
async function getDashboardAccountBooks(userId, startDate, endDate) {
  const conditions = ["ab.user_id = $1"];
  const params = [userId];
  let paramIndex = 2;

  if (startDate) {
    conditions.push(`ab.occurred_at::date >= $${paramIndex++}`);
    params.push(startDate);
  }

  if (endDate) {
    const endDateExclusive = getNextDateString(endDate);
    conditions.push(`ab.occurred_at::date < $${paramIndex++}`);
    params.push(endDateExclusive);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const query = `
    SELECT
      ab.id,
      ab.user_id,
      ab.category_id,
      ab.type,
      ab.content,
      ab.amount,
      ab.occurred_at,
      ab.created_at,
      abc.name,
      abc.color_id,
      c.hex
    FROM account_book ab
    JOIN account_book_category abc ON ab.category_id = abc.id
    LEFT JOIN color c ON abc.color_id = c.id
    ${whereClause}
    ORDER BY ab.occurred_at DESC;
  `;

  const result = await db.query(query, params);
  return result.rows.map(mapAccountBookRow);
}

// 달력용 가계부 목록 조회
async function getCalendarAccountBooks(userId, currentDate) {
  const prevMonthStart = startOfMonth(subMonths(currentDate, 1));
  const nextMonthEnd = endOfMonth(addMonths(currentDate, 1));

  const startDate = format(prevMonthStart, "yyyy-MM-dd");
  const endDate = format(nextMonthEnd, "yyyy-MM-dd");

  const endDateExclusive = getNextDateString(endDate);

  const query = `
    SELECT
      ab.id,
      ab.user_id,
      ab.category_id,
      ab.type,
      ab.content,
      ab.amount,
      ab.occurred_at,
      ab.created_at,
      abc.name,
      abc.color_id,
      c.hex
    FROM account_book ab
    JOIN account_book_category abc ON ab.category_id = abc.id
    LEFT JOIN color c ON abc.color_id = c.id
    WHERE ab.user_id = $1
      AND ab.occurred_at >= $2
      AND ab.occurred_at < $3
    ORDER BY ab.occurred_at DESC;
  `;

  const result = await db.query(query, [userId, startDate, endDateExclusive]);
  return result.rows.map(mapAccountBookRow);
}

// 가계부 항목 추가
async function addAccountBookItem(
  userId,
  assetId,
  type,
  occurredAt,
  categoryId,
  content,
  amount
) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const date = new Date(occurredAt);

    // 1. 가계부 기록 추가
    await client.query(
      `
      INSERT INTO account_book(user_id, type, occurred_at, category_id, asset_id, content, amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [userId, type, date, categoryId, assetId, content, amount]
    );

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
  newAmount
) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1. 기존 항목 정보 조회
    const selectQuery = `
      SELECT user_id, asset_id, type AS old_type, amount AS old_amount
      FROM account_book
      WHERE id = $1
    `;
    const { rows } = await client.query(selectQuery, [itemId]);
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
    await client.query(
      `
      UPDATE account_book
      SET type = $1,
          occurred_at = $2,
          category_id = $3,
          content = $4,
          amount = $5
      WHERE id = $6
      `,
      [
        newType,
        new Date(newOccurredAt),
        newCategoryId,
        newContent,
        newAmount,
        itemId,
      ]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// 가계부 항목 삭제 (자산 반영 포함)
async function deleteAccountBookItem(itemId) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1. 삭제 대상 가계부 항목 정보 조회
    const selectQuery = `
      SELECT id, user_id, asset_id, type, amount
      FROM account_book
      WHERE id = $1
    `;
    const { rows } = await client.query(selectQuery, [itemId]);
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
