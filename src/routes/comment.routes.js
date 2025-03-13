import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifiedVideo } from "../middlewares/video.middleware.js";
import {
  addComment,
  getVideoComments,
} from "../controllers/comment.controller.js";

const router = Router();

//Add Comment to a video
router
  .route("/video/:videoId")
  .get(verifiedVideo, getVideoComments)
  .post(verifyJWT, verifiedVideo, addComment);

export default router;
