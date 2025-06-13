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

module.exports = {
  getReportBoardList,
  addReport,
};
