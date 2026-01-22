import mongoose, { Schema, Document } from "mongoose";

export interface IVpnKey extends Document {
  userId: mongoose.Types.ObjectId;        // who uses the VPN
  createdBy: mongoose.Types.ObjectId;     // who created the key
  createdByRole: "owner" | "agent" | "developer";
  serverId: mongoose.Types.ObjectId;      // which server the VPN is on
  outlineKeyId: string;
  accessUrl: string;

  duration: "oneMonth" | "twoMonth" | "threeMonth";  // Duration type
  dataLimitBytes?: number;
  expiresAt?: Date;

  status: "active" | "expired" | "revoked";
}

const vpnKeySchema = new Schema<IVpnKey>(
  {
    // VPN OWNER
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },

    // CREATOR (agent / owner / admin)
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    createdByRole: {
      type: String,
      enum: ["owner", "agent", "developer"],
      required: true,
    },

    // SERVER INFO
    serverId: {
      type: Schema.Types.ObjectId,
      ref: "server", // assuming you have a server model
      required: true,
      index: true,
    },

    // Outline info
    outlineKeyId: {
      type: String,
      required: true,
      unique: true,
    },

    accessUrl: {
      type: String,
      required: true,
    },

    duration: {
      type: String,
      enum: ["oneMonth", "twoMonth", "threeMonth"],
      required: true,
    },

    dataLimitBytes: {
      type: Number,
    },

    expiresAt: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["active", "expired", "revoked"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const VpnKey = mongoose.model<IVpnKey>("vpn_key", vpnKeySchema);
