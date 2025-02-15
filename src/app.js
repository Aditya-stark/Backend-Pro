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

app.use(
  cors({
    orgin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));
app.use(cookieParser());

export default app;
