import mongoose, { Schema, Document } from "mongoose";

export interface IServer extends Document {
  name: string;                    // Server name/identifier
  ip: string;                      // Server IP address
  servicecall: string;             // Service call identifier (e.g., "outline.two")
  serverUrl: string;              // Server URL/endpoint
  location?: string;              // Server location (country/city)
  provider?: string;              // Cloud provider (AWS, DigitalOcean, etc.)
  capacity?: number;              // Maximum number of VPN connections
  status: "active" | "inactive" | "maintenance";
  createdBy: mongoose.Types.ObjectId;  // Who created this server
}

const serverSchema = new Schema<IServer>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    ip: {
      type: String,
      required: true,
      trim: true,
    },

    servicecall: {
      type: String,
      required: true,
      trim: true,
    },

    serverUrl: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    provider: {
      type: String,
      trim: true,
    },

    capacity: {
      type: Number,
      min: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
serverSchema.index({ status: 1 });
serverSchema.index({ location: 1 });

export const Server = mongoose.model<IServer>("server", serverSchema);