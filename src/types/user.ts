import { get } from "config";
import { Request } from "express";
import { Document } from "mongoose";

export interface UserDocument extends Document {
  name: string;
  email: string;
  role: "user" | "publisher" | "admin";
  password: string;
  resetPasswordToken: string | undefined;
  resetPasswordExpire: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  getSignedJwtToken: () => string;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
  getResetPasswordToken: () => string;
}

export interface RequestWithUser extends Request {
  user?: UserDocument | null;
}
