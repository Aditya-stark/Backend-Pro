import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user detail from front end form
  // validation -- Not Empty
  // Check if user is already registered --email or username
  // Check for images and avatar
  // upload to cloudinary
  // create user object -create entry in database
  // remove password from the response
  // check user created or not
  // return response

  // get user detail from front end
  const { fullName, email, password, username } = req.body;
  console.log(fullName + " " + email + " " + password + " " + username);

  // Validation -- Not Empty
  if (
    [fullName, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user is already registered --email or username
  const existUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existUser) {
    throw new ApiError(409, "User already exist with this email or username");
  }

  // Check for images and avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  console.log("👤 AVATAR LOCAL PATH: "+avatarLocalPath);
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  console.log("😍 COVER LOCAL PATH: "+ coverImageLocalPath);
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // upload to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  console.log(avatar);
  console.log(coverImage);
  if (!avatar) {
    throw new ApiError(400, "Avatar is not uploaded");
  }

  // create user object -create entry in database
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // remove password from the response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  // check user created or not
  if (!createdUser) {
    throw new ApiError(500, "User not created");
  }

  // return response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
});

export { registerUser };
