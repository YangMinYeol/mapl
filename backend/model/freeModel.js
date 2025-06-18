const db = require("../db");

function mapFreeRow(row) {
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

// 자유게시판 목록 가져오기
async function getFreeBoardList(page) {
  const query = `
    SELECT
      n.*,
      u.name,
      COALESCE(array_agg(ni.url) FILTER (WHERE ni.url IS NOT NULL), '{}') AS image_paths
    FROM free n
    LEFT JOIN free_image ni ON n.id = ni.free_id
    LEFT JOIN users u ON n.user_id = u.id
    GROUP BY n.id, u.name
    ORDER BY n.id DESC, n.created_at DESC
    LIMIT 15 OFFSET ($1 - 1) * 15
  `;

  const result = await db.query(query, [page]);
  const posts = result.rows.map(mapFreeRow);

  // 전체 게시글 수 가져오기
  const countQuery = `SELECT COUNT(*) FROM free`;
  const countResult = await db.query(countQuery);
  const totalCount = parseInt(countResult.rows[0].count, 10);

  return { posts, totalCount };
}

// 자유게시판 게시글 등록
async function addFreePostWithImages({ userId, title, content, images }) {
  try {
    await db.query("BEGIN");

    const insertFreeQuery = `
      INSERT INTO free (user_id, title, content)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const freeResult = await db.query(insertFreeQuery, [
      userId,
      title,
      content,
    ]);
    const freeId = freeResult.rows[0].id;

    if (images && images.length > 0) {
      const insertImageQuery = `
        INSERT INTO free_image (free_id, url)
        VALUES ${images.map((_, i) => `($1, $${i + 2})`).join(", ")}
      `;

      const imagePaths = images.map((file) => `/uploads/${file.filename}`);
      await db.query(insertImageQuery, [freeId, ...imagePaths]);
    }

    await db.query("COMMIT");
    return freeId;
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}

// 자유게시판 수정
async function updateFreePostWithImages({
  freeId,
  userId,
  title,
  content,
  serverImages,
  newImages,
}) {
  try {
    await db.query("BEGIN");

    // 게시글 수정
    const updateFreeQuery = `
      UPDATE free
      SET user_id = $1, title = $2, content = $3
      WHERE id = $4
    `;
    await db.query(updateFreeQuery, [userId, title, content, freeId]);

    // 기존 이미지 삭제 (남겨둔 서버 이미지 외 나머지 삭제)
    const selectQuery = `SELECT url FROM free_image WHERE free_id = $1`;
    const existing = await db.query(selectQuery, [freeId]);
    const existingImages = existing.rows.map((row) => row.url);

    const imagesToDelete = existingImages.filter(
      (url) => !serverImages.includes(url)
    );
    if (imagesToDelete.length > 0) {
      const deleteQuery = `
        DELETE FROM free_image 
        WHERE free_id = $1 AND url = ANY($2)
      `;
      await db.query(deleteQuery, [freeId, imagesToDelete]);
    }

    // 새 이미지 삽입
    if (newImages.length > 0) {
      const insertQuery = `
        INSERT INTO free_image (free_id, url)
        VALUES ${newImages.map((_, i) => `($1, $${i + 2})`).join(", ")}
      `;
      const newImagePaths = newImages.map(
        (file) => `/uploads/${file.filename}`
      );
      await db.query(insertQuery, [freeId, ...newImagePaths]);
    }

    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}

// 자유게시판 게시글 삭제
async function deleteFreePost(freeId) {
  const query = `DELETE FROM free WHERE id = $1`;
  return db.query(query, [freeId]);
}

module.exports = {
  getFreeBoardList,
  addFreePostWithImages,
  updateFreePostWithImages,
  deleteFreePost,
};
