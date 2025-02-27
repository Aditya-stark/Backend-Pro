/**
 * This module initializes the server and connects to the MongoDB database.
 * It imports necessary configurations and modules, establishes a connection to the database,
 * and starts the server on the specified port.
 *
 * @module index
 *
 * @requires dotenv/config
 * @requires ./db/index.js
 * @requires ./app.js
 *
 * @function connectDB
 * @description Establishes a connection to the MongoDB database.
 *
 * @function app.on
 * @param {string} event - The event type.
 * @param {function} listener - The callback function to handle the event.
 *
 * @function app.listen
 * @param {number} port - The port number on which the server listens.
 * @param {function} callback - The callback function to execute once the server starts.
 *
 * @constant {string} process.env.PORT - The port number from environment variables.
 *
 */

import "dotenv/config";
import connectDB from "./db/index.js";
import app from "./app.js";

// Connect to the database and start the server
connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error connecting to MONGO DB", error);
    });

    app.listen(process.env.PORT, () => {
      console.log("⚙️ Server is started on PORT", process.env.PORT);
    });
  })
  .catch((err) => {
    console.log("Error connecting to MONGO DB", err);
  });

/** 
import express from "express";

(async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      "Connected to the database",
      connectionInstance.connection.host
    );
    const app = express();
    app.on("error", (error) => {
      console.log("Error connecting to database", error);
    });
    app.listen(process.env.PORT, () => {
      console.log(`App is listening on PORT ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("error connecting the databse", error);
  }
})();

**/
