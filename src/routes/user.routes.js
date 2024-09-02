import { Router } from "express";
import {
  otpVerifyController,
  sendOTPController,
  createUser,
  userLogin,
  forgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/sendOTP").post(sendOTPController);

router.route("/verifyOTP").post(otpVerifyController);

router.route("/createUser").post(createUser);

router.route("/login").post(userLogin);

router.route("/forgotPasswordOTP").post(forgotPasswordOTP);

router.route("/verifyForgotPasswordOTP").post(verifyForgotPasswordOTP);

router.route("/resetPassword").post(resetPassword);

export default router;
