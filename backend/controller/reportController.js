const reportModel = require("../model/reportModel");

// 오류 보고 게시글 목록 불러오기
async function getReportBoardList(req, res) {
  const { page } = req.query;

  try {
    const result = await reportModel.getReportBoardList(page);
    return res.status(200).json(result);
  } catch (error) {
    console.error("오류 보고 게시글 목록 오류:", error);
    return res.status(500).json({
      message: "오류 보고 게시글 목록을 불러오던 중 문제가 발생하였습니다.",
    });
  }
}

// 오류 보고 게시글 등록
async function addReport(req, res) {
  const { userId, type, title, content } = req.body;
  const images = req.files;

  try {
    const result = await reportModel.addReportWithImages({
      userId,
      type,
      title,
      content,
      images,
    });

    return res.status(200).json({ reportId: result });
  } catch (error) {
    console.error("오류 보고 게시글 등록 오류:", error);
    return res.status(500).json({
      message: "오류 보고 게시글 등록 중 문제가 발생하였습니다.",
    });
  }
}

// 오류 보고 게시글 삭제
async function deleteReport(req, res) {
  const reportId = req.params.id;
  try {
    await reportModel.deleteReport(reportId);
    return res
      .status(200)
      .json({ message: "오류 보고 게시글이 삭제되었습니다." });
  } catch (error) {
    console.error("오류 보고 게시글 삭제 오류", error);
    return res.status(500).json({
      message: "오류 보고 게시글 삭제 중 서버에서 문제가 발생하였습니다.",
    });
  }
}

// 오류 보고 게시글 수정
async function updateReport(req, res) {
  const reportId = req.params.id;
  const { userId, type, title, content } = req.body;
  const newImages = req.files || [];
  let serverImages = req.body.serverImages || [];

  if (typeof serverImages === "string") {
    serverImages = [serverImages];
  }

  try {
    await reportModel.updateReportWithImages({
      reportId,
      userId,
      type,
      title,
      content,
      serverImages,
      newImages,
    });

    return res
      .status(200)
      .json({ message: "오류 보고 게시글이 수정되었습니다." });
  } catch (error) {
    console.error("오류 보고 게시글 수정 오류:", error);
    return res.status(500).json({
      message: "오류 보고 게시글 수정 중 문제가 발생하였습니다.",
    });
  }
}

// 진행 상태 변경
async function updateStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await reportModel.updateStatus(id, status);

    res.json({ message: "진행상태가 변경되었습니다." });
  } catch (error) {
    console.error("진행상태 변경 중 오류:", error);
    res.status(500).json({ message: "진행상태 변경 중 오류 발생" });
  }
}

module.exports = {
  getReportBoardList,
  addReport,
  deleteReport,
  updateReport,
  updateStatus,
};
