const db = require("../db");

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

async function getDashboardAccountBooks(userId, startDate, endDate) {
  const conditions = ["ab.user_id = $1"];
  const params = [userId];
  let paramIndex = 2;

  if (startDate) {
    conditions.push(`ab.occurred_at::date >= $${paramIndex++}`);
    params.push(startDate);
  }

  if (endDate) {
    conditions.push(`ab.occurred_at::date <= $${paramIndex++}`);
    params.push(endDate);
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
      c.hex AS color_hex
    FROM account_book ab
    JOIN account_book_category abc ON ab.category_id = abc.id
    LEFT JOIN color c ON abc.color_id = c.id
    ${whereClause}
    ORDER BY ab.occurred_at DESC;
  `;

  const result = await db.query(query, params);
  return result.rows.map(mapAccountBookRow);
}

// 가계부 항목 추가
async function addItem(
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

    // 1. 가계부 기록 추가
    await client.query(
      `
      INSERT INTO account_book(user_id, type, occurred_at, category_id, asset_id, content, amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [userId, type, occurredAt, categoryId, assetId, content, amount]
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
  addItem,
  deleteAccountBookItem,
};
