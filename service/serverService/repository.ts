import { Server } from "../../models/serverModel";
import mongoose from "mongoose";

export const createServer = async (payload: {
  name: string;
  ip: string;
  servicecall: string;
  serverUrl: string;
  location?: string;
  provider?: string;
  capacity?: number;
  status?: "active" | "inactive" | "maintenance";
  createdBy: mongoose.Types.ObjectId;
}) => {
  return Server.create(payload);
};

export const updateServer = async (
  serverId: string,
  payload: Partial<{
    name: string;
    ip: string;
    servicecall: string;
    serverUrl: string;
    location: string;
    provider: string;
    capacity: number;
    status: "active" | "inactive" | "maintenance";
  }>
) => {
  return Server.findByIdAndUpdate(serverId, payload, { new: true });
};

export const deleteServer = async (serverId: string) => {
  return Server.findByIdAndDelete(serverId);
};

export const getServers = async (
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
        localField: "createdBy",
        foreignField: "_id",
        as: "creator"
      }
    },
    {
      $unwind: { path: "$creator", preserveNullAndEmptyArrays: true }
    }
  );

  // Final projection
  pipeline.push({
    $project: {
      _id: 0,
      id: "$_id",
      name: 1,
      ip: 1,
      servicecall: 1,
      serverUrl: 1,
      location: 1,
      provider: 1,
      capacity: 1,
      status: 1,
      createdBy: 1,
      createdAt: 1,
      updatedAt: 1,
      creator: {
        id: "$creator._id",
        name: "$creator.name",
        email: "$creator.email"
      }
    }
  });

  const servers = await Server.aggregate(pipeline);
  return servers;
};

export const getServerById = async (serverId: string) => {
  return Server.findById(serverId).populate("createdBy", "name email");
};

export const getServersByUserId = async (userId: string) => {
  return Server.find({ createdBy: userId }).populate("createdBy", "name email");
};

export const countServers = async (filters: any = {}) => {
  return Server.countDocuments(filters);
};