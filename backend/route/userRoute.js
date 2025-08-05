const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const verifyToken = require("../middleware/authMiddleware");

// 로그인
router.post("/login", userController.login);

// 회원가입
router.post("/signup", userController.signup);

// 아이디 중복 검사
router.post("/check-duplicate", userController.checkUserIdOrEmail);

// 리프레시 토큰 갱신
router.post("/refresh", userController.refreshToken);

// 비밀번호 검증
router.post("/verify-password", verifyToken, userController.verifyPassword);

// 회원탈퇴
router.delete("/me", verifyToken, userController.deleteAccount);

// 회원 정보 수정
router.patch("/me", verifyToken, userController.updateProfile);

module.exports = router;
