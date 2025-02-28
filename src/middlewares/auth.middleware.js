import { ApiError } from "../utils/ApiError";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Get tokens from the cookies
    const token =
      req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Verify the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find the user with the id from the token
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid access token");
  }
});
