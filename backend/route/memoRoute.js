const express = require("express");
const router = express.Router();
const memoController = require("../controller/memoController");
const verifyToken = require("../middleware/authMiddleware");

// 메모 목록
router.get("/", verifyToken, memoController.getMemos);

// 달력 메모 목록
router.get("/calendar", verifyToken, memoController.getCalendarMemos);

// 메모 추가
router.post("/", verifyToken, memoController.addMemo);

// 메모 수정
router.patch("/", verifyToken, memoController.updateMemo);

// 메모 삭제
router.delete("/", verifyToken, memoController.deleteMemo);

// 링크된 메모 일괄 삭제
router.delete("/linked/:linkId", verifyToken, memoController.deleteLinkedMemos);

// 메모 완료 상태 변경
router.post("/complete", verifyToken, memoController.toggleMemoCompletion);

// 링크된 메모 완료 상태 일괄 변경
router.post(
  "/complete-linked",
  verifyToken,
  memoController.toggleLinkedMemosCompletion
);

// 메모 미루기
router.post("/postpone", verifyToken, memoController.postponeMemo);


module.exports = router;
