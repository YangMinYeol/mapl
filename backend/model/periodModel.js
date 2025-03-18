const db = require("../db");

// 기한 목록 조회
async function getPeriodType() {
  const query = `
  SELECT * FROM period_type`;
  return db.query(query);
}

module.exports = { getPeriodType };
