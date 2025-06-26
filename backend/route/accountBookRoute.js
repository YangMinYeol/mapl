const express = require("express");
const router = express.Router();
const accountBookController = require("../controller/accountBookController");
const verifyToken = require("../middleware/authMiddleware");

// 가계부 대시보드 목록
router.get("/", verifyToken, accountBookController.getDashboardAccountBooks);

module.exports = router;
