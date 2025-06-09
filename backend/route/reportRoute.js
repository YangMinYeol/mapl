const express = require("express");
const router = express.Router();
const reportController = require("../controller/reportController");

// 오류 보고 게시글 목록
router.get("/", reportController.getReportBoardList);

module.exports = router;
