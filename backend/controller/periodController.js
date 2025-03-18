const periodModel = require("../model/periodModel");

// 기한 타입 목록 불러오기
async function getPeriodType(req, res) {
  try {
    const result = await periodModel.getPeriodType();
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("기한 타입 목록 오류:", error);
    return res
      .status(500)
      .json({ message: "기한 타입 목록을 불러오던 중 문제가 발생하였습니다." });
  }
}

module.exports = { getPeriodType };
