import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifiedComment = asyncHandler(async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json(new ApiError(404, "No Comment Found"));
    }

    req.comment = comment;
    next();
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error verifying comment: " + error.message));
  }
});

const verifiedCommentOwnerShip = asyncHandler(async (req, res, next) => {
  try {
    // Since we know the comment must exist at this point,
    // we can optimize by directly comparing string IDs
    if (req.comment.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(
          new ApiError(403, "You don't have permission to modify this comment")
        );
    }
    next();
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(500, "Error verifying comment ownership: " + error.message)
      );
  }
});

export { verifiedComment, verifiedCommentOwnerShip };
