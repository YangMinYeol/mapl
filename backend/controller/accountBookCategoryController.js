const accountBookCategoryModel = require("../model/accountBookCategoryModel");

async function getCategoriesByUser(req, res) {
  const { userId } = req.query;
  try {
    const result = await accountBookCategoryModel.getCategoriesByUser(userId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("유저별 가계부 카테고리 오류:", error);
    return res.status(500).json({
      message: "유저별 가계부 카테고리를 불러오던 중 문제가 발생하였습니다.",
    });
  }
}

// 가계부 항목 추가
async function addAccountBookCategory(req, res) {
  const { userId, name, type, colorId } = req.body;
  try {
    await accountBookCategoryModel.addAccountBookCategory(
      userId,
      name,
      type,
      colorId
    );
    return res
      .status(200)
      .json({ message: "가계부 카테고리가 추가되었습니다." });
  } catch (error) {
    console.error("가계부 카테고리 추가 오류:", error);
    return res
      .status(500)
      .json({ message: "가계부 카테고리 추가 중 문제가 발생하였습니다." });
  }
}

// 가계부 카테고리 수정
async function updateAccountBookCategory(req, res) {
  const { id, name, colorId } = req.body;
  try {
    await accountBookCategoryModel.updateAccountBookCategory(id, name, colorId);
    return res
      .status(200)
      .json({ message: "가계부 카테고리가 수정되었습니다." });
  } catch (error) {
    console.error("가계부 카테고리 수정 오류:", error);
    return res
      .status(500)
      .json({ message: "가계부 카테고리 수정 중 문제가 발생하였습니다." });
  }
}

// 가계부 카테고리 삭제
async function deleteAccountBookCategory(req, res) {
  const { categoryId } = req.params;
  const {userId, type} = req.query;
  try {
    await accountBookCategoryModel.deleteAccountBookCategory(userId, type, categoryId);
    return res
      .status(200)
      .json({ message: "가계부 카테고리가 삭제되었습니다." });
  } catch (error) {
    console.error("가계부 카테고리 삭제 오류", error);
    return res.status(500).json({
      message: "가계부 카테고리 삭제 중 서버에서 문제가 발생하였습니다.",
    });
  }
}

// 가계부 카테고리 재정렬
async function reorderAccountBookCategory(req, res) {
  const reorderList = req.body;
  try {
    await accountBookCategoryModel.reorderAccountBookCategory(reorderList);
    return res
      .status(200)
      .json({ message: "가계부 카테고리가 재정렬되었습니다." });
  } catch (error) {
    console.error("가계부 카테고리 재정렬 오류:", error);
    return res
      .status(500)
      .json({ message: "가계부 카테고리 재정렬 중 문제가 발생하였습니다." });
  }
}

module.exports = {
  getCategoriesByUser,
  addAccountBookCategory,
  updateAccountBookCategory,
  deleteAccountBookCategory,
  reorderAccountBookCategory,
};
