const express = require("express");
const reportController = require("../controller/reportController");
const verifyToken = require("../middleware/authMiddleware");
const { upload } = require("../middleware/multer");

const router = express.Router();

// 오류 보고 게시글 목록
router.get("/", reportController.getReportBoardList);

// 오류 보고 게시글 등록
router.post(
  "/",
  verifyToken,
  upload.array("images", 6),
  reportController.addReport
);

// 오류 보고 게시글 삭제
router.delete("/:id", verifyToken, reportController.deleteReport);

module.exports = router;
