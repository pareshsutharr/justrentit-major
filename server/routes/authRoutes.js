const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const multer = require("multer");
const path = require("path");

// Multer setup for profile photo
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed"));
        }
        cb(null, true);
    },
});

router.post("/register", upload.single("profilePhoto"), authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleAuth);

module.exports = router;
