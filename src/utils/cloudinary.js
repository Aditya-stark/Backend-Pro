/**
 * @fileoverview Utility functions for uploading files to Cloudinary.
 * This module provides a function to upload files to Cloudinary and handle
 * the configuration and error handling associated with the upload process.
 *
 * @module utils/cloudinary
 */
/**
 * Uploads a file to Cloudinary.
 *
 * @async
 * @function uploadOnCloudinary
 * @param {string} localFilePath - The path to the local file to be uploaded.
 * @returns {Promise<Object|null>} The response from Cloudinary if the upload is successful, or null if an error occurs.
 *
 * @throws Will throw an error if the upload fails.
 */

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

//configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



//upload file to cloudinary and return the response
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null; //if no file is uploaded
    //upload file to cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("File uploaded on cloudinary", response.url);
    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    fs.unlinkSync(localFilePath); //delete file from local storage
    return null;
  }
};

export { uploadOnCloudinary };
