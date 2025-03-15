import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if ([name, description].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "Name and description are required");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const playlists = await Playlist.find({ owner: req.user._id })
    .populate("video", "title thumbnail views ")
    .populate("owner", "username avatar");
  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "User playlists"));
});

const getPlayListById = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.playlist, "Playlist fetched"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const video = req.video;
  const playlist = req.playlist;

  const videoExists = playlist.video.some(
    (id) => id.toString() === video._id.toString()
  );

  if (videoExists) {
    throw new ApiError(400, "Video already exists in playlist");
  }

  playlist.video.push(video._id);
  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video added to playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const video = req.video;
  const playlist = req.playlist;

  const videoExists = playlist.video.some(
    (id) => id.toString() === video._id.toString()
  );

  if (!videoExists) {
    throw new ApiError(400, "Video not in playlist");
  }

  playlist.video = playlist.video.filter(
    (id) => id.toString() !== video._id.toString()
  );

  await playlist.save();

  return res.status(200).json(new ApiResponse(200, playlist, "Video removed"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  await Playlist.deleteOne({ _id: req.playlist._id });
  return res.status(200).json(new ApiResponse(200, {}, "Playlist deleted"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const playlist = req.playlist;

  if ([name, description].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "Name and description are required");
  }

  playlist.name = name;
  playlist.description = description;
  await playlist.save();
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlayListById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
