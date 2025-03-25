const express = require("express");
const router = express.Router();
const memoController = require("../controller/memoController");
const verifyToken = require("../middleware/authMiddleware");

// 메모 목록
router.get("/", verifyToken, memoController.getMemo);

// 메모 추가
router.post("/", verifyToken, memoController.addMemo);

// 메모 삭제
router.delete("/", verifyToken, memoController.deleteMemo);

// 메모 완료 상태 변경
router.post("/complete", verifyToken, memoController.toggleMemoCompletion);

module.exports = router;
