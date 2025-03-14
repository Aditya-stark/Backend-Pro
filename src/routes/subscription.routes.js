import { Router } from "express";
import { verifiedUser, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();

router
  .route("/subscribed-to/:userId")
  .get(verifiedUser, getSubscribedChannels);

router
  .route("/:userId")
  .get(verifiedUser, getUserChannelSubscribers)
  .post(verifyJWT, toggleSubscription);

export default router;
