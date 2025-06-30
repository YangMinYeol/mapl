const db = require("../db");

function mapAssetRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    balance: row.balance,
    updatedAt: row.updated_at,
  };
}

async function getAsset(userId) {
  const query = `
    SELECT *
    FROM asset
    WHERE user_id = $1;
  `;

  const result = await db.query(query, [userId]);
  return mapAssetRow(result.rows[0]);
}

module.exports = { getAsset };
