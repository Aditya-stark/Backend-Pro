import { Router } from "express";
import {
  getAllVideos,
  getVideoById,
  publishAVideo,
  updatedVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifiedVideo } from "../middlewares/video.middleware.js";

const router = Router();

//Get Videos according to the search query
router.route("/getAllVideo").get(getAllVideos);
//Publish a video
router.route("/publish").post(
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  verifyJWT,
  publishAVideo
);
//Get Video by Id
router.route("/video/:videoId").get(getVideoById);

//Update Video
router.route("/update/:videoId").patch(upload.single("thumbnail") ,verifiedVideo, verifyJWT, updatedVideo);

export default router;
