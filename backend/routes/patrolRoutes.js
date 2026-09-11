const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const controller = require("../controllers/patrolController");

// 1. Cấu hình vị trí lưu file và tên file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Thư mục lưu ảnh trên server
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "patrol-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/check", upload.single("photo"), controller.checkPatrol);

router.get("/history", controller.getHistory);

router.get("/history/month", controller.getMonthlyHistory);

router.get("/dashboard", controller.getDashboard);

module.exports = router;
