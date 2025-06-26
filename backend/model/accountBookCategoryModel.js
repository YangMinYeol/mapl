const db = require("../db");

function mapCategoryRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    colorId: row.color_id,
    colorHex: row.hex
  };
}

async function getCategoriesByUser(userId) {
  const query = `
    SELECT 
      abc.id,
      abc.user_id,
      abc.name,
      abc.type,
      abc.color_id,
      c.hex
    FROM account_book_category abc
    LEFT JOIN color c ON abc.color_id = c.id
    WHERE user_id = $1;
  `;
  const result = await db.query(query, [userId]);
  return result.rows.map(mapCategoryRow);
}

module.exports = {
  getCategoriesByUser,
};
