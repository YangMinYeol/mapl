const colorModel = require("../model/colorModel");

// 색상 목록 불러오기
async function getColor(req, res) {
  try {
    const result = await colorModel.getColor();
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("색상 목록 오류: ", error);
    return res
      .status(500)
      .json({ message: "색상 목록을 불러오던 중 문제가 발생하였습니다." });
  }
}

module.exports = {
  getColor,
};
