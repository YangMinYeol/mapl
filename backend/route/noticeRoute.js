const express = require("express");
const noticeController = require("../controller/noticeController");
const verifyToken = require("../middleware/authMiddleware");
const { upload } = require("../middleware/multer");

const router = express.Router();

// 공지사항 목록
router.get("/", noticeController.getNoticeBoardList);

// 공지사항 게시글 등록
router.post(
  "/",
  verifyToken,
  upload.array("newImages", 6),
  noticeController.addNotice
);

// 공지사항 게시글 삭제
router.delete("/:id", verifyToken, noticeController.deleteNotice);

// 공지사항 게시글 수정
router.put(
  "/:id",
  verifyToken,
  upload.array("newImages", 6),
  noticeController.updateNotice
);

module.exports = router;
