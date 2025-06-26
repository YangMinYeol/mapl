const express = require("express");
const router = express.Router();
const accountBookCategoryController = require("../controller/accountBookCategoryController");
const verifyToken = require("../middleware/authMiddleware");

// 유저별 가계부 카테고리 목록 불러오기
router.get(
  "/",
  verifyToken,
  accountBookCategoryController.getCategoriesByUser
);

module.exports = router;
