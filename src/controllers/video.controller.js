import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteOldFileCloundinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
  // Extract query parameters from the request (page, limit, query, sortBy, sortType, userId)
  // Convert page and limit to numbers and ensure they have valid values
  // Validate and sanitize the query parameters
  // Build a search filter object based on the query (e.g., title, description, tags, etc.)
  // If userId is provided, filter videos uploaded by the specific user
  // Construct sorting options based on sortBy and sortType (e.g., newest first, most viewed, etc.)
  // Fetch videos from the database with applied filters, pagination, and sorting
  // Populate necessary fields if references exist (e.g., user details, comments, etc.)
  // Handle cases where no videos are found and return an appropriate response
  // Return the paginated list of videos along with metadata (total count, current page, total pages)
  // Handle any errors and send an appropriate error response

  // Extract query parameters from the request (page, limit, query, sortBy, sortType, userId)
  const {
    page = 1,
    limit = 10,
    query,
    sortBy,
    sortType,
    userId = "NA",
  } = req.query;

  // Convert page and limit to numbers and ensure they have valid values
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  // Validate and sanitize the query parameters
  if (
    isNaN(parsedPage) ||
    isNaN(parsedLimit) ||
    parsedPage < 1 ||
    parsedLimit < 1
  ) {
    return res.status(400).json(new ApiError(400, "Invalid page or limit"));
  }
  // Validating sortBy and sortType
  if (sortBy && !["latest", "oldest", "most-viewed"].includes(sortBy)) {
    return res.status(400).json(new ApiError(400, "Invalid sortBy value"));
  }
  if (sortType && !["asc", "desc"].includes(sortType)) {
    return res.status(400).json(new ApiError(400, "Invalid sortType value"));
  }

  // Build a search filter object based on the query (e.g., title, description, tags, etc.)
  let searchFilter = {};
  if (query) {
    searchFilter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  if (userId && userId !== "NA") {
    // Check if userId is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(userId)) {
      searchFilter.owner = new mongoose.Types.ObjectId(userId);
    } else {
      // If invalid userId, return no results or an error
      throw new ApiError(400, "Invalid user ID format");
    }
  }

  // Construct sorting options based on sortBy and sortType (latest, older, most-viewed, and asc, des etc.)
  // 1 (Ascending): Sorts values from smallest to largest
  //   For text: A → Z (alphabetical order)
  //   For numbers: 1 → 999 (smallest to largest)
  //   For dates: oldest → newest (earliest to latest)

  // -1 (Descending): Sorts values from largest to smallest
  //   For text: Z → A (reverse alphabetical order)
  //   For numbers: 999 → 1 (largest to smallest)
  //   For dates: newest → oldest (latest to earliest)

  let sort = {};
  if (sortBy === "latest") {
    sort.createdAt = sortType === "asc" ? 1 : -1;
  } else if (sortBy === "oldest") {
    sort.createdAt = sortType === "asc" ? 1 : -1;
  } else if (sortBy === "most-viewed") {
    sort.views = -1;
  } else {
    sort.createdAt = -1; //default latest first
  }

  // Fetch videos from the database with applied filters, pagination and sorting
  // const videos = await Video.aggregatePaginate(
  //   Video.find(searchFilter).sort(sort),
  //   {
  //     page: parsedPage,
  //     limit: parseLimit,
  //     populate: { path: "owner", select: "username avatar" },
  //   }
  // );

  const aggregateQuery = Video.aggregate([
    { $match: searchFilter },
    { $sort: sort },
  ]);

  const videos = await Video.aggregatePaginate(aggregateQuery, {
    page: parsedPage,
    limit: parsedLimit,
    populate: { path: "owner", select: "username avatar" },
  });

  // Handle cases where no videos are found and return an appropriate response
  if (!videos) {
    return res.status(404).json(new ApiError(404, "No videos found"));
  }

  // Return the paginated list of videos along with metadata (total count, current page, total pages)
  res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos Fetched Successfully"));
});
// Publish a video
const publishAVideo = asyncHandler(async (req, res) => {
  // Get information from the req.body
  // Get Video and thumbnail file
  // Validate information not empty
  // upload to cloudinary
  // create a video document in the database
  // add all information to the video document
  // return the video document

  // Get information from the req.body
  const { title, description, isPublished } = req.body;
  if ([title, description].some((field) => field?.trim() === "")) {
    return res.status(400).json(new ApiError(400, "All fields are required"));
  }

  // Get Video and thumbnail
  const videoLocalPath = req.files?.video[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video and thumbnail files are required");
  }

  // Upload to cloundinary
  const videoCloudinary = await uploadOnCloudinary(videoLocalPath);
  const thumbnailCloudinary = await uploadOnCloudinary(thumbnailLocalPath);

  // create a video document in the database
  const video = await Video.create({
    videoFile: videoCloudinary.url,
    thumbnail: thumbnailCloudinary.url,
    title,
    description,
    owner: req.user._id,
    views: 0,
    isPublished,
  });

  //Return the video document
  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video Published succesfully"));
});

// Get Video by Id
const getVideoById = asyncHandler(async (req, res) => {
  try {
    // Get the videoId from the request parameters
    // Find the video with the given videoId
    // If the video is not found, return an error response
    // Increment the view count of the video
    // Populate the owner field with the username and avatar
    // Return the video details along with the owner details

    // Get the videoId from the request parameters
    const { videoId } = req.params;

    // Find the video with the given videoId
    const video = await Video.findById(videoId).populate(
      "owner",
      "username avatar"
    );

    // If the video is not found, return an error response
    if (!video) {
      return res.status(404).json(new ApiError(404, "Video not found"));
    }
    // Increment the view count of the video
    video.views += 1;
    await video.save();

    // Return the video details along with the owner details
    return res.status(200).json(new ApiResponse(200, video, "Video Found"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
});

//Updated the video
const updatedVideo = asyncHandler(async (req, res) => {
  // Get the updated information from the req.body
  // Get the thumbnail from the req.file
  // Get Video from verifiedVideo middleware
  // Check if the user is the owner of the video
  // Upload the thumbnail to cloudinary
  // Delete the old thumbnail from cloudinary
  // Update the video with the new information
  // Return the updated video

  // Get the updated information from the req.body
  const { title, description } = req.body;
  // Get the thumbnail from the req.file
  const thumbnailLocalPath = req.file?.path;

  if ([title, description].some((field) => field?.trim() === "")) {
    console.log("Error1");

    return res.status(400).json(new ApiError(400, "All fields are required"));
  }

  if (!thumbnailLocalPath) {
    console.log("Error2");
    return res.status(400).json(new ApiError(400, "Thumbnail is required"));
  }

  // Get Video from verifiedVideo middleware
  const video = req.video;

  // Check if the user is the owner of the video
  if (video.owner.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json(new ApiError(403, "You are not allowed to update this video"));
  }

  // Upload the thumbnail to cloudinary
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail.url) {
    return res.status(500).json(new ApiError(500, "Error uploading thumbnail"));
  }

  //Delete the old thumbnail from cloudinary
  await deleteOldFileCloundinary(video.thumbnail);

  // Update the video with the new information
  video.title = title;
  video.description = description;
  video.thumbnail = thumbnail.url;
  await video.save();

  // Return the updated video
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Updated Successfully"));
});

// Delete Video by Id
const deleteVideo = asyncHandler(async (req, res) => {
  // Get the videoId from the request parameters
  // Find the video with the given videoId
  // If the video is not found, return an error response
  // Check if the user is the owner of the video
  // Delete the video from the database
  // Delete the video file and thumbnail from cloudinary
  // Return a success response

  try {
    // Get the videoId from the request parameter
    const { videoId } = req.params;

    // Find the video with the given videoId
    const video = await Video.findById(videoId);

    // If the video is not found, return an error response
    if (!video) {
      console.log("Video does not exist");

      return res.status(400).json(new ApiError(400, "Video does not exist"));
    }

    // Check if the user is the owner of the video
    if (video.owner.toString() !== req.user._id.toString()) {
      console.log("You are not allowed to delete this video");
      return res
        .status(400)
        .json(new ApiError(403, "You are not allowed to delete this video"));
    }

    // Delete the video from the database
    await Video.findByIdAndDelete(videoId);

    // Delete the video file and thumbnail from cloudinary
    await deleteOldFileCloundinary(video.videoFile);
    await deleteOldFileCloundinary(video.thumbnail);

    // Return a success response
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video deleted successfully"));
  } catch (error) {
    console.log("Error while deleting Video:", error);
    return res.status(500).json(new ApiError(500, "Failed to delete video"));
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  try {
    // Get Video Id from the params
    // Find the video with the given videoId
    // If the video is not found, return an error response
    // Check if the user is the owner of the video
    // Toggle the publish status of the video
    // Return the updated video

    // Get Video Id from the params
    const { videoId } = req.params;

    // Find the video with the given videoId
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json(new ApiError(404, "Video Not Found"));
    }
    //Check if the user is the owner of the video
    if (video.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(new ApiError(403, "You are not allowed to update this video"));
    }
    //Toggle the publish status of the video
    video.isPublished = !video.isPublished;
    await video.save();

    //Return the updated video
    return res
      .status(200)
      .json(
        new ApiResponse(200, video, "Publised toggle changed successfully")
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error while toggling the video status"));
  }
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updatedVideo,
  deleteVideo,
  togglePublishStatus,
};
