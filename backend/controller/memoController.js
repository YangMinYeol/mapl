const memoModel = require("../model/memoModel");

// 메모 목록 불러오기
async function getMemos(req, res) {
  const { userId, selectedDate } = req.query;
  try {
    const result = await memoModel.getMemo(userId, selectedDate);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("메모 목록 오류:", error);
    return res
      .status(500)
      .json({ message: "메모 목록을 불러오던 중 문제가 발생하였습니다." });
  }
}

// 달력 메모 불러오기
async function getCalendarMemos(req, res) {
  const { userId, currentDate } = req.query;
  try {
    const result = await memoModel.getCalendarMemo(userId, currentDate);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("달력 메모 목록 오류:", error);
    return res
      .status(500)
      .json({ message: "달력 메모 목록을 불러오던 중 문제가 발생하였습니다." });
  }
}

// 메모 추가
async function addMemo(req, res) {
  const memos = req.body;

  try {
    await memoModel.addMemo(memos);

    return res.status(200).json({ message: "메모가 추가되었습니다." });
  } catch (error) {
    console.error("메모 추가 오류:", error);
    return res
      .status(500)
      .json({ message: "메모 추가 중 서버에서 문제가 발생하였습니다." });
  }
}

// 메모 수정
async function updateMemo(req, res) {
  const memo = req.body;

  try {
    await memoModel.updateMemo(memo);

    return res.status(200).json({ message: "메모가 수정되었습니다." });
  } catch (error) {
    console.error("메모 수정 오류:", error);
    return res
      .status(500)
      .json({ message: "메모 수정 중 서버에서 문제가 발생하였습니다." });
  }
}

// 메모 삭제
async function deleteMemo(req, res) {
  const { memoId } = req.body;

  try {
    await memoModel.deleteMemo(memoId);
    return res.status(200).json({ message: "메모가 삭제되었습니다." });
  } catch (error) {
    console.error("메모 삭제 오류", error);
    return res
      .status(500)
      .json({ message: "메모 삭제 중 서버에서 문제가 발생하였습니다." });
  }
}

// 링크 연결된 메모 일괄 삭제
async function deleteLinkedMemos(req, res) {
  const { linkId } = req.params;
  try {
    await memoModel.deleteLinkedMemos(linkId);
    return res.status(200).json({ message: "메모가 삭제되었습니다." });
  } catch (error) {
    console.error("메모 삭제 오류", error);
    return res
      .status(500)
      .json({ message: "메모 삭제 중 서버에서 문제가 발생하였습니다." });
  }
}

// 메모 완료 상태 변경
async function toggleMemoCompletion(req, res) {
  const { memoId } = req.body;
  try {
    await memoModel.toggleMemoCompletion(memoId);
    return res.status(200).json({ message: "메모 상태가 변경되었습니다." });
  } catch (error) {
    console.error("메모 상태 변경 오류", error);
    return res
      .status(500)
      .json({ message: "메모 상태 변경 중 서버에서 문제가 발생하였습니다." });
  }
}

// 링크 연결된 메모 상태 일괄 변경
async function toggleLinkedMemosCompletion(req, res) {
  const { linkId } = req.body;
  try {
    await memoModel.toggleLinkedMemosCompletion(linkId);
    return res.status(200).json({ message: "메모 상태가 변경되었습니다." });
  } catch (error) {
    console.error("메모 상태 변경 오류", error);
    return res
      .status(500)
      .json({ message: "메모 상태 변경 중 서버에서 문제가 발생하였습니다." });
  }
}

// 메모 미루기
async function postponeMemo(req, res) {
  const { memoId, startDate, endDate } = req.body;
  try {
    await memoModel.postponeMemo(memoId, startDate, endDate);
    return res.status(200).json({ message: "메모가 미루어졌습니다." });
  } catch (error) {
    console.error("메모 미루기 오류", error);
    return res
      .status(500)
      .json({ message: "메모 미루기 중 서버에서 문제가 발생하였습니다." });
  }
}

module.exports = {
  getMemos,
  getCalendarMemos,
  addMemo,
  updateMemo,
  deleteMemo,
  deleteLinkedMemos,
  toggleMemoCompletion,
  toggleLinkedMemosCompletion,
  postponeMemo,
};
