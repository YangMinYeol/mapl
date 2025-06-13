const express = require("express");
const reportController = require("../controller/reportController");
const verifyToken = require("../middleware/authMiddleware");
const { upload } = require("../middleware/multer");

const router = express.Router();

router.get("/", reportController.getReportBoardList);

router.post(
  "/",
  verifyToken,
  upload.array("images", 6),
  reportController.addReport
);

module.exports = router;
