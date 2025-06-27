const db = require("../db");

function mapNoticeRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    images: row.image_paths || [],
  };
}

// 공지사항 목록 가져오기
async function getNoticeBoardList(page) {
  const query = `
    SELECT
      n.*,
      u.name,
      COALESCE(array_agg(ni.url) FILTER (WHERE ni.url IS NOT NULL), '{}') AS image_paths
    FROM notice n
    LEFT JOIN notice_image ni ON n.id = ni.notice_id
    LEFT JOIN users u ON n.user_id = u.id
    GROUP BY n.id, u.name
    ORDER BY n.id DESC, n.created_at DESC
    LIMIT 15 OFFSET ($1 - 1) * 15
  `;

  const result = await db.query(query, [page]);
  const posts = result.rows.map(mapNoticeRow);

  // 전체 게시글 수 가져오기
  const countQuery = `SELECT COUNT(*) FROM notice`;
  const countResult = await db.query(countQuery);
  const totalCount = parseInt(countResult.rows[0].count, 10);

  return { posts, totalCount };
}

// 공지사항 게시글 등록
async function addNoticeWithImages({ userId, title, content, images }) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const insertNoticeQuery = `
      INSERT INTO notice (user_id, title, content)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const noticeResult = await client.query(insertNoticeQuery, [
      userId,
      title,
      content,
    ]);
    const noticeId = noticeResult.rows[0].id;

    if (images && images.length > 0) {
      const insertImageQuery = `
        INSERT INTO notice_image (notice_id, url)
        VALUES ${images.map((_, i) => `($1, $${i + 2})`).join(", ")}
      `;

      const imagePaths = images.map((file) => `/uploads/${file.filename}`);
      await client.query(insertImageQuery, [noticeId, ...imagePaths]);
    }

    await client.query("COMMIT");
    return noticeId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// 공지사항 수정
async function updateNoticeWithImages({
  noticeId,
  userId,
  title,
  content,
  serverImages,
  newImages,
}) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // 게시글 수정
    const updateNoticeQuery = `
      UPDATE notice
      SET user_id = $1, title = $2, content = $3
      WHERE id = $4
    `;
    await client.query(updateNoticeQuery, [userId, title, content, noticeId]);

    // 기존 이미지 삭제 (남겨둔 서버 이미지 외 나머지 삭제)
    const selectQuery = `SELECT url FROM notice_image WHERE notice_id = $1`;
    const existing = await client.query(selectQuery, [noticeId]);
    const existingImages = existing.rows.map((row) => row.url);

    const imagesToDelete = existingImages.filter(
      (url) => !serverImages.includes(url)
    );
    if (imagesToDelete.length > 0) {
      const deleteQuery = `
        DELETE FROM notice_image 
        WHERE notice_id = $1 AND url = ANY($2)
      `;
      await client.query(deleteQuery, [noticeId, imagesToDelete]);
    }

    // 새 이미지 삽입
    if (newImages.length > 0) {
      const insertQuery = `
        INSERT INTO notice_image (notice_id, url)
        VALUES ${newImages.map((_, i) => `($1, $${i + 2})`).join(", ")}
      `;
      const newImagePaths = newImages.map(
        (file) => `/uploads/${file.filename}`
      );
      await client.query(insertQuery, [noticeId, ...newImagePaths]);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// 공지사항 게시글 삭제
async function deleteNotice(noticeId) {
  const query = `DELETE FROM notice WHERE id = $1`;
  return db.query(query, [noticeId]);
}

module.exports = {
  getNoticeBoardList,
  addNoticeWithImages,
  updateNoticeWithImages,
  deleteNotice,
};
