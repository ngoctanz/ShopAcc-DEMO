import express from "express";
import multer from "multer";
import {
  uploadSingle,
  uploadMultiple,
  uploadFromUrl,
  deleteFile,
  deleteMultiple,
} from "../controllers/upload.controller.js";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "video/mp4",
      "video/webm",
      "video/ogg",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`), false);
    }
  },
});

// Require admin authentication for all upload routes
router.use(authenticate, requireAdmin);

// Upload single file
router.post("/", upload.single("file"), uploadSingle);

// Upload multiple files (max 10)
router.post("/multiple", upload.array("files", 10), uploadMultiple);

// Upload from URL
router.post("/url", uploadFromUrl);

// Delete single file
router.delete("/:publicId", deleteFile);

// Delete multiple files
router.post("/delete-multiple", deleteMultiple);

export default router;
