/**
 * @fileoverview Main application file for setting up the Express server with middleware.
 *
 * This file configures and initializes an Express application with the following middleware:
 * - CORS (Cross-Origin Resource Sharing) with specified frontend URL and credentials support.
 * - JSON body parser with a request body size limit of 16kb.
 * - URL-encoded body parser with extended option and a request body size limit of 16kb.
 * - Static file serving from the "public" directory.
 * - Cookie parser for parsing cookies attached to the client request object.
 *
 * @requires express
 * @requires cors
 * @requires cookie-parser
 */

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//Configration
app.use(
  cors({
    orgin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import commentRouter from "./routes/comment.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";

//User Routes
app.use("/api/v1/users", userRouter);

//Video Routes
app.use("/api/v1/videos", videoRouter);
//Tweet Routes
app.use("/api/v1/tweets", tweetRouter);
//Comment Routes
app.use("/api/v1/comments", commentRouter);
//Subscription Routes
app.use("/api/v1/subscriptions", subscriptionRouter);
//Like Routes
app.use("/api/v1/likes", likeRouter);
//Playlist Routes
app.use("/api/v1/playlists", playlistRouter);

export default app;
