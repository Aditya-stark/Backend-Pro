import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
  getParticularTweet,
} from "../controllers/tweet.controller.js";
import {
  verifiedTweet,
  verifiedTweetOwnership,
} from "../middlewares/tweet.middleware.js";

const router = Router();

//Create Tweet
router.route("/").post(verifyJWT, createTweet);

//Get a particular tweet
router.route("/:tweetId").get(verifiedTweet, getParticularTweet);

//Get a User All Tweet
router.route("/user/:userId").get(verifyJWT, getUserTweets);

//Tweet Update and Delete Operations
router
  .route("/:tweetId")
  .patch(verifyJWT, verifiedTweet, verifiedTweetOwnership, updateTweet)
  .delete(verifyJWT, verifiedTweet, verifiedTweetOwnership, deleteTweet);

export default router;
