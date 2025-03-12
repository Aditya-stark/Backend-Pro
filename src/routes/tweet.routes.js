import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";
import {
  verifiedTweet,
  verifiedTweetOwnership,
} from "../middlewares/tweet.middleware.js";

const router = Router();

//Create Tweet
router.route("/").post(verifyJWT, createTweet);

//Get User All Tweet
router.route("/user/:userId").get(getUserTweets);

router
  .route("/:tweetId")
  .patch(verifyJWT, verifiedTweet, verifiedTweetOwnership, updateTweet)
  .delete(verifyJWT, verifiedTweet, verifiedTweetOwnership, deleteTweet);

export default router;
