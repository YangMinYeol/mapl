const express = require("express");
const router = express.Router();
const accountBookController = require("../controller/accountBookController");
const verifyToken = require("../middleware/authMiddleware");

// 가계부 대시보드 목록
router.get("/", verifyToken, accountBookController.getDashboardAccountBooks);

// 가계부 항목 추가
router.post("/", verifyToken, accountBookController.addItem);

// 가계부 항목 삭제
router.delete("/", verifyToken, accountBookController.deleteAccountBookItem);

module.exports = router;
