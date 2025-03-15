import { Router } from "express";
import {
  getLikedVideos,
  toggleCommentLikes,
  toggleTweetLikes,
  toggleVideoLikes, 
} from "../controllers/like.controller.js";
import { verifiedVideo } from "../middlewares/video.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifiedComment } from "../middlewares/comment.middleware.js";
import { verifiedTweet } from "../middlewares/tweet.middleware.js";

const router = Router();

router
  .route("/video/:videoId")
  .get(verifyJWT, verifiedVideo, getLikedVideos)
  .post(verifyJWT, verifiedVideo, toggleVideoLikes);
router
  .route("/comment/:commentId")
  .post(verifyJWT, verifiedComment, toggleCommentLikes);
router
  .route("/tweet/:tweetId")
  .post(verifyJWT, verifiedTweet, toggleTweetLikes);

export default router;
