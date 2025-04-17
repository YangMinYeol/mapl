const express = require("express");
const router = express.Router();
const colorController = require("../controller/colorController");

// 색상 목록
router.get("/", colorController.getColor);

module.exports = router;
