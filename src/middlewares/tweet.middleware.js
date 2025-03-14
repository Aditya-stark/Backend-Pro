import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifiedTweet = asyncHandler(async (req, res, next) => {
  try {
    // Get tweetId from req
    const { tweetId } = req.params;
    // Search the tweet
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      return res.status(404).json(new ApiError(404, "No Tweet Found"));
    }

    // Return result
    req.tweet = tweet;
    next();
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error verifying tweet: " + error.message));
  }
});

// Middleware to verify tweet ownership
const verifiedTweetOwnership = asyncHandler(async (req, res, next) => {
  try {
    // Since we know the tweet must exist at this point,
    // we can optimize by directly comparing string IDs
    if (req.tweet.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(
          new ApiError(403, "You don't have permission to modify this tweet")
        );
    }
    next();
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(500, "Error verifying tweet ownership: " + error.message)
      );
  }
});

export { verifiedTweet, verifiedTweetOwnership };
