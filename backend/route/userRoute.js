const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

// 로그인
router.post("/login", userController.login);

// 회원가입
router.post("/signup", userController.signup);

// 아이디 중복 검사
router.post("/check-duplicate", userController.checkUserIdOrEmail);

module.exports = router;
