import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifiedVideo } from "../middlewares/video.middleware.js";
import {
  addComment,
  getVideoComments,
  updateComment,
  deleteComment,
  getParticularComment,
} from "../controllers/comment.controller.js";
import {
  verifiedComment,
  verifiedCommentOwnerShip,
} from "../middlewares/comment.middleware.js";

const router = Router();

//Add Comment to a video
router
  .route("/video/:videoId")
  .get(verifiedVideo, getVideoComments)
  .post(verifyJWT, verifiedVideo, addComment);

router
  .route("/:commentId")
  .get(verifiedComment, getParticularComment)
  .patch(verifyJWT, verifiedComment, verifiedCommentOwnerShip, updateComment)
  .delete(verifyJWT, verifiedComment, verifiedCommentOwnerShip, deleteComment);

export default router;
