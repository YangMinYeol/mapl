const express = require("express");
const router = express.Router();
const memoController = require("../controller/memoController");

// 메모 목록
router.get("/get", memoController.getMemo);

// 메모 추가
router.post("/add", memoController.addMemo);

// 메모 삭제
router.delete("/delete", memoController.deleteMemo);

// 메모 완료 상태 변경
router.post("/complete", memoController.toggleMemoCompletion);

module.exports = router;
