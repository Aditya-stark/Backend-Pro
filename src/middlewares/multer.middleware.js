/**
 * Middleware for handling file uploads using multer. file is uploaded on the server temperarily.
 *
 * This middleware uses disk storage to save uploaded files to the "./public/temp" directory.
 * The filenames are appended with a timestamp to ensure uniqueness.
 *
 * @module middlewares/multer.middleware
 */

import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname + "-" + Date.now());
  },
});

export const upload = multer({
  storage,
});
