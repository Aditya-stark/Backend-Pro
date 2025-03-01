import { Router } from "express";
import {
  logoutUser,
  refreshToken,
  registerUser,
} from "../controllers/user.controller.js";
import { loginUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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
router.route("/logout").post(verifyJWT, logoutUser);
//Verify the User and Give New Tokens
router.route("/refresh-token").post(refreshToken);

export default router;
