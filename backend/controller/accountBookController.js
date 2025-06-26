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

module.exports = {
  getDashboardAccountBooks,
};
