import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const verifiedVideo = asyncHandler(async (req, res, next) => {
  try {
    // Get Video ID from the request parameters
    // Find the video with the given videoId
    // If the video is not found, return an error response
    // If the video is not published, return an error response
    // Return the video details

    // Get Video ID from the request parameters
    const { videoId } = req.params;

    //Find the video with the given videoId
    const video = await Video.findById(videoId);

    //If the video is not found, return an error response
    if (!video) {
      return res.status(404).json(new ApiError(404, "Video not found"));
    }

    // //If the video is not published, return an error response
    // if (!video.isPublised) {
    //   return res.status(403).json(new ApiError(403, "Video not published"));
    // }

    //Return the video details
    req.video = video;
    next();
  } catch (error) {
    throw new ApiError(401, "VERIFIED VIDEO ERROR" + error.message);
  }
});
