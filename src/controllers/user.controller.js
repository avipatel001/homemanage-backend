import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";

let otpStorage = {};
console.log(otpStorage);

// Function to generate a random OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999); // Generates a 6-digit OTP
}

// async function sendOTP(email) {
//   try {
//     let user = await User.findOne({ email: email });

//     if (user) {
//       throw new ApiError(400, "User already exists");
//     } else {
//       let transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: process.env.EMAIL_USER, // Your Gmail address from .env
//           pass: process.env.EMAIL_PASS, // Your Gmail password or app password from .env
//         },
//       });

//       const otp = generateOTP();

//       let mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: "Your OTP for Registration",
//         text: `Your OTP is ${otp}. Please use this to complete your registration.`,
//         html: `<p>Your OTP is <b>${otp}</b>. Please use this to complete your registration.</p>`,
//       };

//       let info = await transporter.sendMail(mailOptions);
//       console.log("Email sent: " + info.response);

//       // Store OTP and email temporarily (e.g., in database or Redis)
//       otpStorage[email] = { otp: otp, createdAt: Date.now() };
//       console.log(otpStorage);

//       return otp;
//     }
//   } catch (error) {
//     throw "Error sending email: " + error;
//   }
// }

async function sendOTP(email) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const otp = generateOTP();

  const user = await User.findOne({ email: email });

  if (!user) {
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Registration",
      text: `Your OTP is ${otp}. Please use this to complete your registration.`,
      html: `<p>Your OTP is <b>${otp}</b>. Please use this to complete your registration.</p>`,
    };

    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);

    otpStorage[email] = { otp, createdAt: Date.now() };
  } else {
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for change password",
      text: `Your OTP is ${otp}. Please use this to Change your password.`,
      html: `<p>Your OTP is <b>${otp}</b>. Please use this to Change your password.</p>`,
    };

    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);

    otpStorage[email] = { otp, createdAt: Date.now() };
  }

  return true;
}

// Function to verify the OTP
function verifyOTP(email, enteredOTP) {
  const storedOTP = otpStorage[email];

  if (!storedOTP) {
    throw new Error("OTP not found or expired");
  }

  const isExpired = Date.now() - storedOTP.createdAt > 5 * 60 * 1000; // OTP expires in 5 minutes
  if (isExpired) {
    delete otpStorage[email]; // Clean up expired OTP
    throw new Error("OTP expired");
  }

  if (storedOTP.otp === parseInt(enteredOTP, 10)) {
    // OTP is correct, proceed to create the user
    delete otpStorage[email]; // Clean up after verification
    return true;
  } else {
    throw new Error("Invalid OTP");
  }
}

// const sendOTPController = asyncHandler(async (req, res) => {
//   const { email } = req.body;

//   const sendotp = await sendOTP(email);

//   console.log("sendotp", sendotp);

//   if (!sendotp) {
//     throw new ApiError(500, "Failed to send OTP");
//   }

//   res.status(200).json(new ApiResponse(200, sendotp, "OTP sent successfully"));
// });

const sendOTPController = asyncHandler(async (req, res) => {
  const { email } = req.body;

  let user = await User.findOne({ email: email });

  if (user) {
    throw new ApiError(400, "User already exists");
  } else {
    const sendotp = await sendOTP(email);
    if (!sendotp) {
      throw new ApiError(500, "Failed to send OTP");
    }
    res
      .status(200)
      .json(new ApiResponse(200, sendotp, "OTP sent successfully"));
  }
});

const otpVerifyController = asyncHandler(async (req, res) => {
  const { data } = req.body;
  console.log(req.body);
  let email = data.email;
  let enteredOTP = data.otp;

  const storedOTP = otpStorage[email];

  if (!storedOTP) {
    throw new ApiError(400, "OTP not found or expired");
  }

  const isExpired = Date.now() - storedOTP.createdAt > 5 * 60 * 1000; // OTP expires in 5 minutes
  if (isExpired) {
    delete otpStorage[email]; // Clean up expired OTP
    throw new ApiError(400, "OTP expired");
  }

  if (storedOTP.otp === parseInt(enteredOTP, 10)) {
    // OTP is correct, proceed to create the user
    delete otpStorage[email]; // Clean up after verification
  } else {
    throw new ApiError(400, "Invalid OTP");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, email, "OTP verified successfully"));
});

const createUser = asyncHandler(async (req, res) => {
  const allUsers = await User.find();

  const id = allUsers.length + 1;
  if (!id) {
    throw new ApiError(500, "Failed to create user");
  }

  const user = await User.create({
    ...req.body.data,
    id: id,
  });
  if (!user) {
    throw new ApiError(500, "Failed to create user");
  }
  res.status(200).json(new ApiResponse(200, user, "User created successfully"));
});

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  const user = await User.findOne({ email: email });

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  if (!(await user.isValidPassword(password))) {
    throw new ApiError(400, "Invalid password");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "User logged in successfully"));
});

const forgotPasswordOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log(req.body);

  const user = await User.findOne({ email: email });

  if (!user) {
    throw new ApiError(400, "User not found");
  } else {
    const otp = sendOTP(email);

    if (!otp) {
      throw new ApiError(500, "Failed to send OTP");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, otp, "OTP sent successfully"));
  }
});

const verifyForgotPasswordOTP = asyncHandler(async (req, res) => {
  let email = req.body.email;
  let enteredOTP = req.body.otp;

  const storedOTP = otpStorage[email];

  if (!storedOTP) {
    throw new ApiError(400, "OTP not found or expired");
  }

  const isExpired = Date.now() - storedOTP.createdAt > 5 * 60 * 1000; // OTP expires in 5 minutes
  if (isExpired) {
    delete otpStorage[email]; // Clean up expired OTP
    throw new ApiError(400, "OTP expired");
  }

  if (storedOTP.otp === parseInt(enteredOTP, 10)) {
    // OTP is correct, proceed to create the user
    delete otpStorage[email]; // Clean up after verification
  } else {
    throw new ApiError(400, "Invalid OTP");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, email, "OTP verified successfully"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email: email });

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user = await User.updateOne(
    { email: email },
    { $set: { password: hashedPassword } },
    { new: true }
  );

  if (!user) {
    throw new ApiError(500, "Failed to reset password");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Password reset successfully"));
});

export {
  sendOTPController,
  otpVerifyController,
  createUser,
  userLogin,
  forgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword,
};
