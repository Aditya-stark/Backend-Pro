import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getVideoComments = asyncHandler(async (req, res) => {
  try {
    // Get VideoId from req.params
    // Find all Comments of the Video using aggregation pipeline
    // Match video (id in "Comment") to the "Video" collection
    // Sort and limit comments count
    // Lookup comment owner details from "User" collection
    // Project feilds we only need
    // Count total comments count for pagination

    // Get VideoId from req.params
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 10;
    const skip = (parsedPage - 1) * parsedLimit;

    // Find all comments of the video using aggreation pipeline
    const result = await Comment.aggregate([
      //Match video (id in "Comment") to the "Video" collection
      {
        $match: {
          video: mongoose.Types.ObjectId.createFromHexString(videoId),
        },
      },
      {
        $facet: {
          comments: [
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $skip: skip,
            },
            {
              $limit: parsedLimit,
            },

            //Lookup comment owner details from "User" collection
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

            //HERE WE CAN ADD COMMENT LINK COUNT AND FETCH COMMENT--> COMMENTS DATA (AGGERGATION) (COMPLEX THING🥲)

            // Project feilds we only need
            {
              $project: {
                commentContent: 1,
                createdAt: 1,
                updatedAt: 1,
                ownerDetails: {
                  _id: 1,
                  name: 1,
                  email: 1,
                },
              },
            },
          ],
          totalCount: [
            {
              $count: "count",
            },
          ],
        },
      },
    ]);

    //Extract results from the facet operation
    const comments = result[0].comments || [];
    const totalComments = result[0].totalCount[0]?.count || 0;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          comments,
          pagination: {
            totalPages: Math.ceil(totalComments / parsedLimit),
            currentPage: parsedPage,
            hasNextPage: skip + comments.length < totalComments,
            hasPrevPage: parsedPage > 1,
          },
        },
        "Comments fetched successfully"
      )
    );
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
});

const getParticularComment = asyncHandler(async (req, res) => {
  try {
    const comment = req.comment;
    await comment.populate("owner", "_id username avatar");
    return res
      .status(200)
      .json(new ApiResponse(200, comment, "Comment fetched"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error while fetching the comment"));
  }
});

const addComment = asyncHandler(async (req, res) => {
  try {
    // Get VideoId from req.video
    // Get commentContent from req.body
    // Get userId from req.user
    // Create a new comment
    // Save the comment
    // Return the comment

    // Get VideoId from req.params
    const videoId = req.video._id;
    // Get contents from req.body
    const { commentContent } = req.body;
    // Get userdId from req.user
    const ownerId = req.user._id;

    if (
      !commentContent ||
      commentContent.trim() === "" ||
      commentContent.length > 280
    ) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            "Comment content is required and should be less than 280 characters"
          )
        );
    }

    const comment = await Comment.create({
      commentContent,
      video: videoId,
      owner: ownerId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, comment, "Tweet created successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error while commenting " + error.message));
  }
});

const updateComment = asyncHandler(async (req, res) => {
  try {
    const comment = req.comment;
    const { commentContent } = req.body;

    if (
      !commentContent ||
      commentContent.trim() === "" ||
      commentContent.length > 280
    ) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            "Comment content is required and should be less than 280 characters"
          )
        );
    }

    comment.commentContent = commentContent;
    comment.updatedAt = Date.now();
    await comment.save();
    return res
      .status(200)
      .json(new ApiResponse(200, comment, "Comment updated successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error while updating the comment"));
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  try {
    await req.comment.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Comment deleted successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error while deleting the comment"));
  }
});

export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
  getParticularComment,
};
