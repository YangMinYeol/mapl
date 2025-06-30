const express = require("express");
const router = express.Router();
const assetController = require("../controller/assetController");
const verifyToken = require("../middleware/authMiddleware");

// 자산 가져오기
router.get("/", verifyToken, assetController.getAsset);

module.exports = router;
