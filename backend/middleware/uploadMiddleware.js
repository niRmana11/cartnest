import multer from "multer";

/**
 * Multer Configuration
 *
 * Handles file uploads from frontend
 * Validates file size, type, and stores in memory buffer
 * Buffer is then uploaded to Cloudinary
 */

// Configure storage (memory storage — don't save to disk)
const storage = multer.memoryStorage();

// File filter (only allow images)
const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(
      new Error(
        `Invalid file type. Only JPEG, PNG, GIF, WebP allowed. Received: ${file.mimetype}`,
      ),
      false,
    );
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

/**
 * Middleware: Handle single file upload
 * Usage in routes: router.post('/product', uploadMiddleware.single('image'), controller)
 *
 * File available in req.file:
 * - req.file.buffer: File contents (for Cloudinary upload)
 * - req.file.originalname: Original filename
 * - req.file.mimetype: MIME type
 * - req.file.size: File size in bytes
 */
export const uploadSingle = upload.single("image");

/**
 * Middleware: Handle multiple file uploads
 * Usage: router.post('/products', uploadMiddleware.array('images', 5), controller)
 */
export const uploadMultiple = upload.array("images", 5);

/**
 * Error handler for multer errors
 * Usage: router.post('/product', uploadSingle, errorHandler)
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific error
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 5MB limit",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files",
      });
    }
  }

  if (err) {
    // Custom file filter error
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next(); // No error, proceed
};

export default {
  uploadSingle,
  uploadMultiple,
  handleUploadError,
};
