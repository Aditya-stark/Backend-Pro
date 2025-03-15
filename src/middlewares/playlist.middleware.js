import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifiedPlaylist = asyncHandler(async (req, res, next) => {
  const { playlistId } = req.params;
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    return res.status(404).json(new ApiError(404, "Playlist not found"));
  }

  req.playlist = playlist;
  next();
});

export { verifiedPlaylist };
