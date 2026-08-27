const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================================================
// Upload Directory
// ======================================================

const uploadDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}
 
// ======================================================
// Storage Configuration
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// ======================================================
// File Filter
// ======================================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;

  const extension = path.extname(file.originalname).toLowerCase();

  const mimeType = allowedTypes.test(file.mimetype);

  const fileExtension = allowedTypes.test(extension);

  if (mimeType && fileExtension) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed."), false);
  }
};

// ======================================================
// Multer Configuration
// ======================================================

const upload = multer({
  storage: storage,

  fileFilter: fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

module.exports = upload;
