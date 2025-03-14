import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  try {
    // Get the channelId (userId) to subscribe to from req.params
    // Find the channel (user) using channelId (userId)
    // Check if the user is trying to subscribe to themselves
    // Check if the user is already subscribed to the channel
    // If the user is already subscribed, unsubscribe them
    // If the user is not subscribed, subscribe them
    // Send the updated user as response

    // Get the channelId (userId) to subscribe to from req.params
    const { userId } = req.params;

    // Find the channel (user) using channelId (userId)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    // Check if the user is trying to subscribe to themselves
    if (req.user._id.toString() === userId) {
      return res
        .status(400)
        .json(new ApiError(400, "You cannot subscribe to yourself"));
    }

    // Check if the user is already subscribed to the channel
    const isSubscribed = await Subscription.findOne({
      subscriber: req.user._id,
      channel: userId,
    });

    // Unsubscribe
    if (isSubscribed) {
      await Subscription.findByIdAndDelete(isSubscribed._id);
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { subscribed: false },
            "Unsubscribed successfully"
          )
        );
    } else {
      // Subscribe
      const newSubscription = await Subscription.create({
        subscriber: req.user._id,
        channel: userId,
      });

      return res.status(201).json(
        new ApiResponse(
          201,
          {
            subscribed: true,
            subscriptionId: newSubscription._id,
          },
          "Subscribed successfully"
        )
      );
    }
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error while toggling subscription"));
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  try {
    // Get the user from req.user
    // Find all the subscribers of the user
    // Send the subscribers as response

    // Get the user from req.user
    const user = req.user;

    // Find all the subscribers of the user
    const subscribers = await Subscription.find({ channel: user._id }).populate(
      "subscriber",
      "username avatar"
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error while getting subscribers"));
  }
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  try {
    const user = req.user;

    const subscribedTo = await Subscription.find({
      subscriber: user._id,
    }).populate("channel", "username avatar");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscribedTo,
          "Subscribed channels fetched successfully"
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error while getting subscribed channels"));
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
