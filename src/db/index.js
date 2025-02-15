/**
 * Connects to the MongoDB database using Mongoose.
 *
 * This function attempts to establish a connection to the MongoDB database
 * using the connection URI specified in the environment variable `MONGODB_URI`
 * and the database name imported from the constants file. If the connection
 * is successful, it logs the host of the connected database. If the connection
 * fails, it logs the error and exits the process with a status code of 1.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} A promise that resolves when the connection is established.
 * @throws Will throw an error if the connection to the database fails.
 */

import mongoose from "mongoose";
import DB_NAME from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `✅MONGO DB Connected !! ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGO DB Connection Error", error);
    process.exit(1);
  }
};

export default connectDB;
