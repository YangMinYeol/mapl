const express = require("express");
const router = express.Router();
const periodController = require("../controller/periodController");

// 기한 목록
router.get("/", periodController.getPeriodType);

module.exports = router;
