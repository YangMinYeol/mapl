const accountBookModel = require("../model/accountBookModel");

async function getDashboardAccountBooks(req, res) {
  const { userId, startDate, endDate } = req.query;
  try {
    const result = await accountBookModel.getDashboardAccountBooks(
      userId,
      startDate,
      endDate
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("가계부 목록 오류:", error);
    return res
      .status(500)
      .json({ message: "가계부 목록을 불러오던 중 문제가 발생하였습니다." });
  }
}

// 가계부 항목 추가
async function addItem(req, res) {
  const { userId, type, occurredAt, categoryId, assetId, content, amount } =
    req.body;
  try {
    await accountBookModel.addItem(
      userId,
      assetId,
      type,
      occurredAt,
      categoryId,
      content,
      amount
    );

    return res.status(200).json({ message: "가계부 항목이 추가되었습니다." });
  } catch (error) {
    console.error("가계부 항목 등록 오류:", error);
    return res
      .status(500)
      .json({ message: "가계부 항목 등록 중 문제가 발생하였습니다." });
  }
}

// 가계부 항목 삭제
async function deleteAccountBookItem(req, res) {
  const { itemId } = req.body;

  try {
    await accountBookModel.deleteAccountBookItem(itemId);
    return res.status(200).json({ message: "가계부 항목이 삭제되었습니다." });
  } catch (error) {
    console.error("가계부 항목 삭제 오류", error);
    return res
      .status(500)
      .json({ message: "가계부 항목 삭제 중 서버에서 문제가 발생하였습니다." });
  }
}

module.exports = {
  getDashboardAccountBooks,
  addItem,
  deleteAccountBookItem,
};
