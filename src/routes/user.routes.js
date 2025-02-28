import { Router } from "express";
import { logoutUser, registerUser } from "../controllers/user.controller.js";
import { loginUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Register a new user
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

// Login a user
router.route("/login").post(loginUser);

// SECURED ROUTES
// Logout a user
router.route("/logout").post(logoutUser);

export default router;
