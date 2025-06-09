const db = require("../db");

function mapReportRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    content: row.content,
    imagePath: row.image_path,
    reportType: row.report_type,
    status: row.status,
    createdAt: row.created_at,
  };
}

async function getReportBoardList(page) {
  // 게시글 목록 가져오기
  const query = `
    SELECT *
    FROM report
    ORDER BY id DESC, created_at DESC LIMIT 15 OFFSET ($1 - 1) * 15`;
  const result = await db.query(query, [page]);
  const posts = result.rows.map(mapReportRow);

  // 전체 게시글 수 가져오기
  const countQuery = `SELECT COUNT(*) FROM report`;
  const countResult = await db.query(countQuery);
  const totalCount = parseInt(countResult.rows[0].count, 10);

  return { posts, totalCount };
}

module.exports = { getReportBoardList };
