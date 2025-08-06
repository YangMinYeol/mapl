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
  upload.array("newImages", 6),
  reportController.addReport
);

// 오류 보고 게시글 삭제
router.delete("/:id", verifyToken, reportController.deleteReport);

// 오류 보고 게시글 수정 추가
router.put(
  "/:id",
  verifyToken,
  upload.array("newImages", 6),
  reportController.updateReport
);

// 진행 상태 변경
router.patch("/:id/status", verifyToken, reportController.updateStatus);

module.exports = router;
