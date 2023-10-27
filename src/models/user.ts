import crypto from "crypto";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import config from "config";

import jwt from "jsonwebtoken";

import { UserDocument } from "../types/user";

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: [true, "Please enter a name."],
    },
    email: {
      type: String,
      required: [true, "Please enter an email."],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email.",
      ],
    },
    role: {
      type: String,
      enum: ["user", "publisher"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Please enter a password."],
      minlength: 6,
      select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true } // createdAt, updatedAt
);

// Encrypt password using bcrypt
userSchema.pre("save", async function (next) {
  // If password is not modified, skip
  if (!this.isModified("password")) next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  const jwtSecret = config.get<string>("jwtSecret");
  const jwtExpire = config.get<string>("jwtExpire");

  return jwt.sign({ id: this._id }, jwtSecret, { expiresIn: jwtExpire });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordToken = resetPasswordToken;

  // Set expire
  const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  this.resetPasswordExpire = new Date(resetPasswordExpire);

  return resetToken;
};

export default mongoose.model<UserDocument>("User", userSchema);
