const db = require("../db");

function mapCategoryRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    colorId: row.color_id,
    colorHex: row.hex,
    isDefault: row.is_default,
    sortOrder: row.sort_order,
  };
}

// 카테고리 목록 가져오기
async function getCategoriesByUser(userId) {
  const query = `
    SELECT 
      abc.id,
      abc.user_id,
      abc.name,
      abc.type,
      abc.color_id,
      abc.is_default,
      abc.sort_order,
      c.hex
    FROM account_book_category abc
    LEFT JOIN color c ON abc.color_id = c.id
    WHERE abc.user_id = $1;
  `;

  const result = await db.query(query, [userId]);
  const categories = result.rows.map(mapCategoryRow);

  const income = categories.filter((cat) => cat.type === "income");
  const expense = categories.filter((cat) => cat.type === "expense");

  return { income, expense };
}

// 카테고리 추가
async function addAccountBookCategory(userId, name, type, colorId) {
  const nextOrder = await getNextSortOrder(userId, type);

  const query = `
    INSERT INTO account_book_category
      (user_id, name, type, color_id, sort_order)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const result = await db.query(query, [
    userId,
    name,
    type,
    colorId,
    nextOrder,
  ]);

  return result.rows[0];
}

// 다음 sort_order를 취득
async function getNextSortOrder(userId, type) {
  const query = `
    SELECT MAX(sort_order) AS max_sort_order
    FROM account_book_category
    WHERE user_id = $1 AND type = $2
  `;

  const result = await db.query(query, [userId, type]);
  const maxSortOrder = result.rows[0].max_sort_order;

  return (maxSortOrder !== null ? maxSortOrder : 0) + 1;
}

module.exports = {
  getCategoriesByUser,
  addAccountBookCategory,
};
