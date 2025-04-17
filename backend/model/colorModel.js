const db = require("../db");

// 색상 목록 조회
async function getColor() {
  const query = `
    SELECT *
    FROM color
  `;
  return db.query(query);
}

module.exports = {
  getColor,
};
