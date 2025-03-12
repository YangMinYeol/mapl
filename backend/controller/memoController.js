const memoModel = require("../model/memoModel");

// 메모 목록 불러오기
async function getMemo(req, res) {
  const { userId, startDate } = req.query;
  try {
    const result = await memoModel.getMemo(userId, startDate);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("메모 목록 오류:", error);
    return res
      .status(500)
      .json({ message: "메모 목록을 불러오던 중 문제가 발생하였습니다." });
  }
}

// 메모 추가
async function addMemo(req, res) {
  const { userId, content, startDate } = req.body;

  try {
    await memoModel.addMemo({
      userId,
      content,
      startDate,
    });

    return res.status(200).json({ message: "메모가 추가되었습니다." });
  } catch (error) {
    console.error("메모 추가 오류:", error);
    return res
      .status(500)
      .json({ message: "메모 추가 중 서버에서 문제가 발생하였습니다." });
  }
}

module.exports = { getMemo, addMemo };
