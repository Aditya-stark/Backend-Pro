import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
  deleteOldFileCloundinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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

// REGISTER A NEW USER
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

// LOGIN A USER
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
  if (!email && !password) {
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

//LOGOUT A USER
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id, //here req.user is coming from verifyJWT middleware
    {
      $unset: {
        refreshToken: 1,
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

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// REFRESH TOKEN ENDPOINT
const refreshToken = asyncHandler(async (req, res) => {
  // Get the refresh token from the request body or cookies
  // Verify the refresh token
  // Find the user with the id from the token in the database
  // Match the refresh token from the database
  // Generate new access and refresh tokens
  // Send the cookie with the new refresh token

  try {
    // Get the refresh token from the request body or cookies
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Verify the refresh token
    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find the user with the id from the token in the database
    const user = await User.findById(decodedRefreshToken._id);
    if (!user) {
      throw new ApiError(404, "User not found Invalid refresh token");
    }
    // Match the refresh token from the database
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or invalid");
    }

    // Generate new access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    // Send the cookie with the new refresh and access tokens
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Refresh and access token generated successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Error:" + error.message);
  }
});

// CHANGE CURRECT PASSWORD
const changeCurrentPassword = asyncHandler(async (req, res) => {
  // Take the field from req body
  const { oldPassword, newPassword } = req.body;

  //Find user in db by user._id
  const user = await User.findById(req.user?._id);

  //Verify the password by bcrypt method
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(404, "❌ Invalid Old Password");
  }

  //Set New Password in db
  user.password = newPassword;

  //save db
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "New Password Saved Successfully"));
});

// GET CURRENT USER
const getCurrentUser = asyncHandler(async (req, res) => {
  const currentUser = req.user;

  return res
    .status(200)
    .json(new ApiResponse(200, { currentUser }, "Current user fetched"));
});

//UPDATING ACCOUNT USER DETAILS
const updateAccountUserDetails = asyncHandler(async (req, res) => {
  // Get fields to be update
  const { fullName, email } = req.body;

  //Validation
  if (!fullName || !email) {
    throw new ApiError(400, "All Fields are required");
  }

  //Find user and update by METHOD findByIdAndUpdate
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  //return updated user
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

// UPDATE USER AVATAR
const updateUserAvatar = asyncHandler(async (req, res) => {
  // Get file path from multer
  const avatarLocalPath = req.file?.path; //here "file" not "files" because only 1 file
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  //Upload On Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Failed to upload avatar");
  }

  //Deleting the Old image from the cloudinary
  const oldAvatarURL = req.user?.avatar;
  await deleteOldFileCloundinary(oldAvatarURL);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

// Update User Cover Image
const updateUserCoverImage = asyncHandler(async (req, res) => {
  // Getting cover image path from multer middleware
  const coverImageLocalPath = req.file?.path;

  // Uploading cover image to cloudinary
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(400, "Failed to Upload Cover Image");
  }

  //Delete Old Cover Image from cloudinary
  const oldCoverImageUrl = req.user?.coverImage;
  await deleteOldFileCloundinary(oldCoverImageUrl);

  //Update new cover image in db
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

//Get User Channel Profile Info
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) {
    new ApiError(400, "Failed to load user");
  }

  //Here we are using aggregation pipeline to get the user channel profile data with some extra fields. Aggregation pipeline is used to perform some operations on the data before returning it.
  const channel = await User.aggregate([
    {
      //STAGE_1: Match (Finding) the user with the username in the database
      $match: {
        username: username?.toLowerCase(),
      },
    },
    //STAGE_2: To Find Subscribers
    // The Subscription collection will look like this:
    // {
    //    subscriber: "userId",
    //    channel: "channelId"
    // }
    {
      $lookup: {
        from: "subscription", //subscription collection main se data chahiye
        localField: "_id", //User Collection main buhot saare users honge toh particular user ki id se hum data find karenge subscription collection main channel ke andar
        foreignField: "channel", //So foreginField channel hoga aur jitne bhi channel main user ki id match hongi woh saari data hume mil jayega
        as: "subscribers", //aur kaise save karenge as "subscribers"
      },
    },
    //STAGE_3: To Find SubscribedTo Channels
    {
      $lookup: {
        from: "subscription",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User Channel fetched successfully")
    );
});

// Get User Watch History with LookUp from watchHistory model
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    //STEP_1: Match the user id in mongodb with user id in watchHistory collection
    {
      //will match the user id in mongodb with user id in watchHistory collection. createFromHexString is used to convert string id to object id which mongodb uses to find the data
      $match: {
        _id: mongoose.Types.ObjectId.createFromHexString(req.user?._id),
      },
    },
    //STEP_2: Lookup the video details from video collection using watchHistory
    //Here watchHistory in user model is an array of video ids. So we are using $lookup to get the video details from video collection using video id from watchHistory. secondly in each video there is owner field which is user id. we are using $lookup to get the owner(user) details from user collection using owner id from video collection. lastly owner field is filter out using $project to get only required fields from owner(user) collection
    {
      $lookup: {
        from: "video",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        //add more pipeline to get owner details (nested pipeline)
        pipeline: [
          {
            //get owner details from user collection
            $lookup: {
              from: "user",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              //more nested pipeline to filter the owner details
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch History Fetched Successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountUserDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
