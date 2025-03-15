import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlayListById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { verifiedPlaylist } from "../middlewares/playlist.middleware.js";
import { verifiedVideo } from "../middlewares/video.middleware.js";

const router = Router();

router
  .route("/")
  .get(verifyJWT, getUserPlaylists)
  .post(verifyJWT, createPlaylist);

router
  .route("/:playlistId")
  .get(verifiedPlaylist, getPlayListById)
  .patch(verifyJWT, verifiedPlaylist, updatePlaylist)
  .delete(verifyJWT, verifiedPlaylist, deletePlaylist);

router
  .route("/:playlistId/videos/:videoId")
  .post(verifyJWT, verifiedPlaylist, verifiedVideo, addVideoToPlaylist)
  .delete(verifyJWT, verifiedPlaylist, verifiedVideo, removeVideoFromPlaylist);

export default router;
