const accountBookModel = require("../model/accountBookModel");

// 대시보드용 가계부 목록 불러오기
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

// 달력용 가계부 목록 불러오기
async function getCalendarAccountBooks(req, res) {
  const { userId, currentDate } = req.query;
  try {
    const result = await accountBookModel.getCalendarAccountBooks(
      userId,
      currentDate
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("달력 가계부 목록 오류:", error);
    return res.status(500).json({
      message: "달력 가계부 목록을 불러오던 중 문제가 발생하였습니다.",
    });
  }
}

// 가계부 항목 추가
async function addAccountBookItem(req, res) {
  const { userId, type, occurredAt, categoryId, assetId, content, amount } =
    req.body;
  try {
    await accountBookModel.addAccountBookItem(
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

// 가계부 항목 수정
async function updateAccountBookItem(req, res) {
  const { itemId, type, occurredAt, categoryId, content, amount } = req.body;
  try {
    await accountBookModel.updateAccountBookItem(
      itemId,
      type,
      occurredAt,
      categoryId,
      content,
      amount
    );

    return res.status(200).json({ message: "가계부 항목이 수정되었습니다." });
  } catch (error) {
    console.error("가계부 수정 변경 오류:", error);
    return res
      .status(500)
      .json({ message: "가계부 항목 수정 중 문제가 발생하였습니다." });
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
  getCalendarAccountBooks,
  addAccountBookItem,
  updateAccountBookItem,
  deleteAccountBookItem,
};
