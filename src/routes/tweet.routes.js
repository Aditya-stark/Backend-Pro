import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, getUserTweets } from "../controllers/tweet.controller.js";

const router = Router();

//Create Tweet
router.route("/create-tweet").post(verifyJWT, createTweet);

//Get User Tweet
router.route("/get-tweets/:userId").get(getUserTweets);

export default router;
