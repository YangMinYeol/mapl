const noticeModel = require("../model/noticeModel");

// 공지사항 게시글 목록 불러오기
async function getNoticeBoardList(req, res) {
  const { page } = req.query;

  try {
    const result = await noticeModel.getNoticeBoardList(page);
    return res.status(200).json(result);
  } catch (error) {
    console.error("공지사항 목록 오류:", error);
    return res.status(500).json({
      message: "공지사항 목록을 불러오던 중 문제가 발생하였습니다.",
    });
  }
}

// 공지사항 게시글 등록
async function addNotice(req, res) {
  const { userId, title, content } = req.body;
  const images = req.files;

  try {
    const result = await noticeModel.addNoticeWithImages({
      userId,
      title,
      content,
      images,
    });

    return res.status(200).json({ noticeId: result });
  } catch (error) {
    console.error("공지사항 게시글 등록 오류:", error);
    return res.status(500).json({
      message: "공지사항 게시글 등록 중 문제가 발생하였습니다.",
    });
  }
}

// 공지사항 게시글 수정
async function updateNotice(req, res) {
  const noticeId = req.params.id;
  const { userId, title, content } = req.body;
  const newImages = req.files || [];
  let serverImages = req.body.serverImages || [];

  if (typeof serverImages === "string") {
    serverImages = [serverImages];
  }

  try {
    await noticeModel.updateNoticeWithImages({
      noticeId,
      userId,
      title,
      content,
      serverImages,
      newImages,
    });

    return res
      .status(200)
      .json({ message: "공지사항 게시글이 수정되었습니다." });
  } catch (error) {
    console.error("공지사항 게시글 수정 오류:", error);
    return res.status(500).json({
      message: "공지사항 게시글 수정 중 문제가 발생하였습니다.",
    });
  }
}

// 공지사항 게시글 삭제
async function deleteNotice(req, res) {
  const noticeId = req.params.id;
  try {
    await noticeModel.deleteNotice(noticeId);
    return res
      .status(200)
      .json({ message: "공지사항 게시글이 삭제되었습니다." });
  } catch (error) {
    console.error("공지사항 게시글 삭제 오류", error);
    return res.status(500).json({
      message: "공지사항 게시글 삭제 중 서버에서 문제가 발생하였습니다.",
    });
  }
}

module.exports = {
  getNoticeBoardList,
  addNotice,
  updateNotice,
  deleteNotice,
};
