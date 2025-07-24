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
    WHERE abc.user_id = $1
    ORDER BY sort_order;
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

// 가계부 카테고리 수정
async function updateAccountBookCategory(id, name, colorId) {
  const query = `
    UPDATE account_book_category
    SET 
      name = $1,
      color_id = $2
    WHERE id = $3
  `;

  const result = await db.query(query, [name, colorId, id]);
  return result.rows[0];
}

// 가계부 카테고리 삭제
async function deleteAccountBookCategory(userId, type, categoryId) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    await moveItemsToDefaultCategoryOnDelete(client, userId, type, categoryId);

    const deleteQuery = `DELETE FROM account_book_category WHERE id = $1`;
    await client.query(deleteQuery, [categoryId]);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// 가계부 카테고리 삭제 시 포함 항목들 모두 default 데이터로 이동
async function moveItemsToDefaultCategoryOnDelete(
  client,
  userId,
  type,
  categoryId
) {
  // 기본 카테고리 조회
  const findDefaultCategoryQuery = `
    SELECT id FROM account_book_category
    WHERE user_id = $1 AND type = $2 AND is_default = true
    LIMIT 1
  `;
  const { rows } = await client.query(findDefaultCategoryQuery, [userId, type]);

  if (rows.length === 0) {
    throw new Error("기본 카테고리가 존재하지 않아 항목을 이동할 수 없습니다.");
  }

  const defaultCategoryId = rows[0].id;

  // account_book 항목의 categoryId를 기본 카테고리로 변경
  const updateQuery = `
    UPDATE account_book
    SET category_id = $1
    WHERE category_id = $2
  `;
  await client.query(updateQuery, [defaultCategoryId, categoryId]);
}

// 가계부 카테고리 재정렬
async function reorderAccountBookCategory(reorderList) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const query = `
      UPDATE account_book_category
      SET sort_order = $1
      WHERE id = $2;
    `;
    for (const { id, sortOrder } of reorderList) {
      await client.query(query, [sortOrder, id]);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw new Error("카테고리 정렬 실패: " + error.message);
  } finally {
    client.release();
  }
}

module.exports = {
  getCategoriesByUser,
  addAccountBookCategory,
  updateAccountBookCategory,
  deleteAccountBookCategory,
  reorderAccountBookCategory,
};
