// userModel.ts

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNo: { type: String, required: true },
    address: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    roleId: {
      type: String,
      enum: ["developer", "owner", "agent"],
      required: true,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("user", userSchema);
