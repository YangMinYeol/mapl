const express = require("express");
const freeController = require("../controller/freeController");
const verifyToken = require("../middleware/authMiddleware");
const { upload } = require("../middleware/multer");

const router = express.Router();

// 자유게시판 목록
router.get("/", freeController.getFreeBoardList);

// 자유게시판 게시글 등록
router.post(
  "/",
  verifyToken,
  upload.array("newImages", 6),
  freeController.addFree
);

// 자유게시판 게시글 삭제
router.delete("/:id", verifyToken, freeController.deleteFreePost);

// 자유게시판 게시글 수정
router.put(
  "/:id",
  verifyToken,
  upload.array("newImages", 6),
  freeController.updateFree
);

module.exports = router;
