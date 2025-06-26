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

module.exports = {
  getDashboardAccountBooks,
};
