const freeModel = require("../model/freeModel");

// 자유게시판 게시글 목록 불러오기
async function getFreeBoardList(req, res) {
  const { page } = req.query;

  try {
    const result = await freeModel.getFreeBoardList(page);
    return res.status(200).json(result);
  } catch (error) {
    console.error("자유게시판 목록 오류:", error);
    return res.status(500).json({
      message: "자유게시판 목록을 불러오던 중 문제가 발생하였습니다.",
    });
  }
}

// 자유게시판 게시글 등록
async function addFree(req, res) {
  const { userId, title, content } = req.body;
  const images = req.files;

  try {
    const result = await freeModel.addFreePostWithImages({
      userId,
      title,
      content,
      images,
    });

    return res.status(200).json({ freeId: result });
  } catch (error) {
    console.error("자유게시판 게시글 등록 오류:", error);
    return res.status(500).json({
      message: "자유게시판 게시글 등록 중 문제가 발생하였습니다.",
    });
  }
}

// 자유게시판 게시글 수정
async function updateFree(req, res) {
  const freeId = req.params.id;
  const { userId, title, content } = req.body;
  const newImages = req.files || [];
  let serverImages = req.body.serverImages || [];

  if (typeof serverImages === "string") {
    serverImages = [serverImages];
  }

  try {
    await freeModel.updateFreePostWithImages({
      freeId,
      userId,
      title,
      content,
      serverImages,
      newImages,
    });

    return res
      .status(200)
      .json({ message: "자유게시판 게시글이 수정되었습니다." });
  } catch (error) {
    console.error("자유게시판 게시글 수정 오류:", error);
    return res.status(500).json({
      message: "자유게시판 게시글 수정 중 문제가 발생하였습니다.",
    });
  }
}

// 자유게시판 게시글 삭제
async function deleteFreePost(req, res) {
  const freeId = req.params.id;
  try {
    await freeModel.deleteFreePost(freeId);
    return res
      .status(200)
      .json({ message: "자유게시판 게시글이 삭제되었습니다." });
  } catch (error) {
    console.error("자유게시판 게시글 삭제 오류", error);
    return res.status(500).json({
      message: "자유게시판 게시글 삭제 중 서버에서 문제가 발생하였습니다.",
    });
  }
}

module.exports = {
  getFreeBoardList,
  addFree,
  updateFree,
  deleteFreePost,
};
