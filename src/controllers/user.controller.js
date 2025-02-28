import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Method for generating access and refresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating refresh and access tokens");
  }
};

// Register a new user
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
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // upload to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  // upload cover image if available
  let coverImage = { url: "" };
  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  }

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

// Login a user
const loginUser = asyncHandler(async (req, res) => {
  // Get email, username and password from the request
  // Validation of email, username and password
  // Find the user with email or username
  // Password check
  // Generate access token and refresh token
  // Send the cookie with refresh token

  // Get email, username and password from the request
  const { email, password, username } = req.body;

  // Validation of email, username and password
  if (!email || !password) {
    throw new ApiError(400, "Email or Username is required");
  }

  // Find the user with email or username
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Password check
  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Password is incorrect");
  }

  // Generate access token and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Send the cookie with refresh token
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // options for cookie
  const options = {
    httpOnly: true,
    secure: true,
  };

  // return the response with cookie containing tokens and user details
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

//Logout a user
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id, //here req.user is coming from verifyJWT middleware
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
