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

      const imagePaths = images.map((file) => `/uploads/${file.filename}`);
      await db.query(insertImageQuery, [reportId, ...imagePaths]);
    }

    await db.query("COMMIT");
    return reportId;
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}

// 오류 보고 게시글 삭제
async function deleteReport(reportId) {
  const query = `DELETE FROM report WHERE id = $1`;
  return db.query(query, [reportId]);
}

// 게시글 수정
async function updateReportWithImages({
  reportId,
  userId,
  type,
  title,
  content,
  serverImages,
  newImages,
}) {
  try {
    await db.query("BEGIN");

    // 게시글 수정
    const updateReportQuery = `
      UPDATE report
      SET user_id = $1, type = $2, title = $3, content = $4
      WHERE id = $5
    `;
    await db.query(updateReportQuery, [userId, type, title, content, reportId]);

    // 기존 이미지 삭제 (남겨둔 서버 이미지 외 나머지 삭제)
    const selectQuery = `SELECT url FROM report_image WHERE report_id = $1`;
    const existing = await db.query(selectQuery, [reportId]);
    const existingImages = existing.rows.map((row) => row.url);

    const imagesToDelete = existingImages.filter(
      (url) => !serverImages.includes(url)
    );
    if (imagesToDelete.length > 0) {
      const deleteQuery = `
        DELETE FROM report_image 
        WHERE report_id = $1 AND url = ANY($2)
      `;
      await db.query(deleteQuery, [reportId, imagesToDelete]);
    }

    // 새 이미지 삽입
    if (newImages.length > 0) {
      const insertQuery = `
        INSERT INTO report_image (report_id, url)
        VALUES ${newImages.map((_, i) => `($1, $${i + 2})`).join(", ")}
      `;
      const newImagePaths = newImages.map(
        (file) => `/uploads/${file.filename}`
      );
      await db.query(insertQuery, [reportId, ...newImagePaths]);
    }

    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}

module.exports = {
  getReportBoardList,
  addReportWithImages,
  deleteReport,
  updateReportWithImages,
};
