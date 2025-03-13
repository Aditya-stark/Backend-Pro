import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  try {
    // Get tweet content from req
    // Verify the content is not empty and less than 280 characters
    // Verify the user is logged in
    // Create a new tweet
    // Save the tweet
    // Send the tweet as response

    const { content } = req.body;
    // Verify the content is not empty and less than 280 characters
    if (!content || content.trim() === "" || content.length > 280) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            "Tweet content is required and should be less than 280 characters"
          )
        );
    }

    const tweet = await Tweet.create({
      content,
      owner: req.user._id,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, tweet, "Tweet created successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error while creating tweet"));
  }
});

//Get a Particular tweet by tweetId
const getParticularTweet = asyncHandler(async (req, res) => {
  try {
    const tweet = req.tweet;
    await tweet.populate("owner", "username avatar");

    return res
      .status(200)
      .json(new ApiResponse(200, tweet, "Tweet fetched successfully"));
  } catch (error) {
    return res
      .status(400)
      .json(new ApiError(400, "Error while get tweet" + error.message));
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  try {
    // Get UserId from params
    // Find all tweets of the user using aggregation pipeline
    // Match the owner (user) in tweet collection
    // Sort by creation date (newest first)
    // Skip and limit tweets for pagination
    // Lookup owner details from users
    // Lookup likes and comments count
    // Project only fields we need
    // Count total tweets for pagination info

    // Get UserId from params
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 10;
    const skip = (parsedPage - 1) * parsedLimit;

    // Find all tweets of the user using aggregation pipeline
    const tweets = await Tweet.aggregate([
      // Match the owner (user) in tweet collection
      {
        $match: {
          owner: mongoose.Types.ObjectId.createFromHexString(userId),
        },
      },
      // Sort by creation date (newest first)
      {
        $sort: {
          createdAt: -1,
        },
      },
      // Skip and limit for pagination
      {
        $skip: skip,
      },
      {
        $limit: parsedLimit,
      },
      //Lookup owner details
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerDetails",
        },
      },
      {
        $unwind: "$ownerDetails",
      },
      // Lookup likes and count likes and comments
      {
        $lookup: {
          from: "likes",
          let: { tweetId: "_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$tweet", "$$tweetId"] },
              },
            },
            {
              $count: "count",
            },
          ],
          as: "likesCount",
        },
      },
      //HERE WE CAN ADD COMMENTS COUNT AND FETCH COMMENTS DATA (AGGERGATION) (COMPLEX THING🥲)

      // Project only fields we need
      {
        $project: {
          content: 1,
          createdAt: 1,
          updatedAt: 1,
          owner: {
            _id: "$ownerDetails._id",
            username: "$ownerDetails.username",
            avatar: "$ownerDetails.avatar",
          },
          likesCount: {
            $cond: {
              if: { $gt: [{ $size: "$likesCount" }, 0] },
              then: { $arrayElemAt: ["$likesCount.count", 0] },
              else: 0,
            },
          },
        },
      },
    ]);

    //Count total tweets for pagination info
    const totalTweets = await Tweet.countDocuments({ owner: userId });

    //Return the tweets
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          tweets,
          pagination: {
            totalPages: Math.ceil(totalTweets / parsedLimit),
            currentPage: parsedPage,
            hasNextPage: skip + tweets.length < totalTweets,
            hasPreviousPage: parsedPage > 1,
          },
        },
        "User tweets fetched successfully"
      )
    );
  } catch (error) {
    console.log("Error fetching user tweets", error);
    return res
      .status(500)
      .json(new ApiError(500, "Error while fecthing the tweets"));
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  // Get content from the req
  const { content } = req.body;
  const tweet = req.tweet;

  //Validate the content
  if (!content || content.trim() === "" || content.length > 280) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "Tweet content is required and should be less than 280 characters"
        )
      );
  }
  //update tweet
  tweet.content = content;
  tweet.updatedAt = Date.now();
  await tweet.save();
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  await req.tweet.deleteOne();
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Tweet deleted successfully"));
});

export {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
  getParticularTweet,
};
