import { Like } from "../models/like.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLikes = asyncHandler(async (req, res) => {
  const video = req.video;

  // Check if the user has already liked the video
  const isVideoLiked = await Like.findOne({
    video: video._id,
    likedBy: req.user._id,
  });

  if (isVideoLiked) {
    // Unlike the video
    await Like.deleteOne({
      video: video._id,
      likedBy: req.user._id,
    });

    return res.status(200).json(new ApiResponse(200, {}, "Video unliked"));
  } else {
    //Like the video
    await Like.create({
      video: video._id,
      likedBy: req.user._id,
    });

    return res.status(201).json(new ApiResponse(201, {}, "Video liked"));
  }
});

const toggleCommentLikes = asyncHandler(async (res, req) => {
  const isCommentLiked = await Like.findOne({
    comment: req.comment._id,
    likedBy: req.user._id,
  });

  if (isCommentLiked) {
    // Unlike the comment
    await Like.deleteOne({
      comment: req.comment._id,
      likedBy: req.user._id,
    });

    return res.status(200).json(new ApiResponse(200, {}, "Comment unliked"));
  } else {
    // Like the comment
    await Like.create({
      comment: req.comment._id,
      likedBy: req.user._id,
    });

    return res.status(201).json(new ApiResponse(201, {}, "Comment liked"));
  }
});

const toggleTweetLikes = asyncHandler(async (req, res) => {
  const isTweetLiked = await Like.findOne({
    tweet: req.tweet._id,
    likedBy: req.user._id,
  });

  if (isTweetLiked) {
    await Like.deleteOne({
      tweet: req.tweet._id,
      likedBy: req.user._id,
    });
    return res.status(200).json(new ApiResponse(200, {}, "Tweet unliked"));
  } else {
    await Like.create({
      tweet: req.tweet._id,
      likedBy: req.user._id,
    });
    return res.status(201).json(new ApiResponse(201, {}, "Tweet liked"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.find({
    likedBy: req.user._id,
    video: { $exists: true },
  }).populate("video");

  return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "Liked videos fetched"));
});

export {
  toggleVideoLikes,
  toggleCommentLikes,
  toggleTweetLikes,
  getLikedVideos,
};
