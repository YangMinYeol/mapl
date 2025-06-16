const db = require("../db");

function mapReportRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    title: row.title,
    content: row.content,
    type: row.type,
    status: row.status,
    createdAt: row.created_at,
    images: row.image_paths || [],
  };
}

async function getReportBoardList(page) {
  // 게시글 목록 가져오기
  const query = `
    SELECT 
      r.*,
      u.name,
      COALESCE(array_agg(ri.url) FILTER (WHERE ri.url IS NOT NULL), '{}') AS image_paths
    FROM report r
    LEFT JOIN report_image ri ON r.id = ri.report_id
    LEFT JOIN users u ON r.user_id = u.id
    GROUP BY r.id, u.name
    ORDER BY r.id DESC, r.created_at DESC
    LIMIT 15 OFFSET ($1 - 1) * 15`;
  const result = await db.query(query, [page]);
  const posts = result.rows.map(mapReportRow);

  // 전체 게시글 수 가져오기
  const countQuery = `SELECT COUNT(*) FROM report`;
  const countResult = await db.query(countQuery);
  const totalCount = parseInt(countResult.rows[0].count, 10);

  return { posts, totalCount };
}

// 오류 보고 게시글 등록
async function addReportWithImages({ userId, type, title, content, images }) {
  try {
    await db.query("BEGIN");

    const insertReportQuery = `
      INSERT INTO report (user_id, type, title, content)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const reportResult = await db.query(insertReportQuery, [
      userId,
      type,
      title,
      content,
    ]);
    const reportId = reportResult.rows[0].id;

    if (images && images.length > 0) {
      const insertImageQuery = `
        INSERT INTO report_image (report_id, url)
        VALUES ${images.map((_, i) => `($1, $${i + 2})`).join(", ")}
      `;

      const imagePaths = images.map(
        (file) => `/uploads/${file.filename}`
      );
      await db.query(insertImageQuery, [reportId, ...imagePaths]);
    }

    await db.query("COMMIT");
    return reportId;
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}

module.exports = {
  getReportBoardList,
  addReportWithImages,
};
