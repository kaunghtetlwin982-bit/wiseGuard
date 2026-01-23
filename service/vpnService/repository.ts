import { VpnKey } from "../../models/vpnModel";
import mongoose from "mongoose";

export const createVpnKey = async (payload: {
  userId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdByRole: "owner" | "agent" | "developer";
  serverId: mongoose.Types.ObjectId;
  outlineKeyId: string;
  accessUrl: string;
  duration: "oneMonth" | "twoMonth" | "threeMonth";
  dataLimitBytes?: number;
  expiresAt?: Date;
  status?: "active" | "expired" | "revoked";
}) => {
  return VpnKey.create(payload);
};

export const updateVpnKey = async (
  vpnKeyId: string,
  payload: Partial<{
    userId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    createdByRole: "owner" | "agent" | "developer";
    serverId: mongoose.Types.ObjectId;
    outlineKeyId: string;
    accessUrl: string;
    duration: "oneMonth" | "twoMonth" | "threeMonth";
    dataLimitBytes: number;
    expiresAt: Date;
    status: "active" | "expired" | "revoked";
  }>
) => {
  return VpnKey.findByIdAndUpdate(vpnKeyId, payload, { new: true });
};

export const deleteVpnKey = async (vpnKeyId: string) => {
  return VpnKey.findByIdAndDelete(vpnKeyId);
};

export const getVpnKeys = async (
  currentPage: number,
  limit: number,
  sort_by: string = "createdAt",
  sort_order: string | 1 | -1 = -1,
  filters: any = {}
) => {
  const order: 1 | -1 = sort_order === "desc" ? -1 : 1;

  const pipeline: any[] = [
    { $match: filters },
    { $sort: { [sort_by]: order } },
    { $skip: (currentPage - 1) * limit },
    { $limit: limit },
  ];

  // Add population for related data
  pipeline.unshift(
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "creator"
      }
    },
    {
      $lookup: {
        from: "servers",
        localField: "serverId",
        foreignField: "_id",
        as: "server"
      }
    },
    {
      $unwind: { path: "$user", preserveNullAndEmptyArrays: true }
    },
    {
      $unwind: { path: "$creator", preserveNullAndEmptyArrays: true }
    },
    {
      $unwind: { path: "$server", preserveNullAndEmptyArrays: true }
    }
  );

  // Final projection
  pipeline.push({
    $project: {
      _id: 1,
      id: { $toString: "$_id" },
      userId: 1,
      createdBy: 1,
      createdByRole: 1,
      serverId: 1,
      outlineKeyId: 1,
      accessUrl: 1,
      duration: 1,
      dataLimitBytes: 1,
      expiresAt: 1,
      status: 1,
      user: {
        id: "$user._id",
        name: "$user.name",
        email: "$user.email",
        roleId: "$user.roleId"
      },
      creator: {
        id: "$creator._id",
        name: "$creator.name",
        email: "$creator.email",
        roleId: "$creator.roleId"
      },
      server: {
        id: "$server._id",
        name: "$server.name",
        serverUrl: "$server.serverUrl",
        location: "$server.location"
      },
      createdAt: {
        $dateToString: {
          format: "%Y-%m-%dT%H:%M:%S.%LZ",
          date: "$createdAt",
        },
      },
      updatedAt: {
        $dateToString: {
          format: "%Y-%m-%dT%H:%M:%S.%LZ",
          date: "$updatedAt",
        },
      },
    },
  });

  return VpnKey.aggregate(pipeline);
};

export const countVpnKeys = async (filters: any = {}) => {
  const count = await VpnKey.aggregate([
    { $match: filters },
    { $count: "total" },
  ]);

  return count[0]?.total || 0;
};

export const getVpnKeyById = async (vpnKeyId: string) => {
  console.log("vpnKeyId : ",vpnKeyId)
  console.log("VpnKey collection:", VpnKey.collection.name);

  return VpnKey.findById(vpnKeyId)
    .populate('userId', 'name email roleId')
    .populate('createdBy', 'name email roleId')
    .populate('serverId', 'name serverUrl location');
};



export const getVpnKeysByUserId = async (userId: string) => {
   console.log("getVpnKeysByUserId : ", getVpnKeysByUserId)
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return [];
  }
console.log(VpnKey.collection.name);

  return VpnKey.find({
    userId: new mongoose.Types.ObjectId(userId),
  })
    .populate("serverId", "name serverUrl location")
    .sort({ createdAt: -1 });
};


export const revokeVpnKey = async (vpnKeyId: string) => {
  return VpnKey.findByIdAndUpdate(vpnKeyId, { status: "inactive" }, { new: true });
};
