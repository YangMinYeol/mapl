const express = require("express");
const router = express.Router();
const memoController = require("../controller/memoController");

// 메모 목록
router.get("/get", memoController.getMemo);

// 메모 추가
router.post("/add", memoController.addMemo);

module.exports = router;
