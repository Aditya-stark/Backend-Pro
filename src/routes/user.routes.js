import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  logoutUser,
  refreshToken,
  registerUser,
  updateAccountUserDetails,
  updateUserAvatar,
  updateUserCoverImage,
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
// Verify the User and Give New Tokens
router.route("/refresh-token").post(refreshToken);
// Change Password
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
// Get Current user
router.route("/current-user").get(verifyJWT, getCurrentUser);
// Update account details
router.route("/update-details").patch(verifyJWT, updateAccountUserDetails);

//Update Avatar
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
// Update Cover Image
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

//Get User Profile Details
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

//Get Watch History
router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
