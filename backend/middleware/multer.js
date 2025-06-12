const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 저장할 폴더 경로 설정
const uploadDir = path.join(process.cwd(), "uploads");

// 폴더가 없다면 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// multer 저장소 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// 파일 필터 (선택 사항: 이미지 파일만 받기)
function fileFilter(req, file, cb) {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed."));
  }
}

// 업로드 미들웨어 생성 (최대 6개 이미지 업로드 예시)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한 (필요시 변경)
});

module.exports = { upload };
