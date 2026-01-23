import {
  createServer,
  updateServer,
  deleteServer,
  getServers,
  countServers,
  getServerById,
  getServersByUserId
} from "./repository";
import Response from "../../helper/responseStatus";
import mongoose from "mongoose";

const createServerLogic = async (payload: {
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
  try {
    const server = await createServer(payload);
    if (!server) {
      return Response.NOT_IMPLEMENTED("Server could not be created");
    }
    return Response.OK(server, "Server created successfully");
  } catch (error) {
    console.error("Error creating server:", error);
    return Response.UNKNOWN("Failed to create server");
  }
};

const updateServerLogic = async (
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
  try {
    const server = await updateServer(serverId, payload);
    if (!server) {
      return Response.NOT_FOUND("Server not found");
    }
    return Response.OK(server, "Server updated successfully");
  } catch (error) {
    console.error("Error updating server:", error);
    return Response.UNKNOWN("Failed to update server");
  }
};

const deleteServerLogic = async (serverId: string) => {
  try {
    const server = await deleteServer(serverId);
    if (!server) {
      return Response.NOT_FOUND("Server not found");
    }
    return Response.OK(server, "Server deleted successfully");
  } catch (error) {
    console.error("Error deleting server:", error);
    return Response.UNKNOWN("Failed to delete server");
  }
};

const getServersLogic = async (
  currentPage: number,
  limit: number,
  sort_by?: string,
  sort_order?: string | 1 | -1,
  filters?: any
) => {
  try {
    const page = Math.max(Number(currentPage), 1);
    const perPage = Math.max(Number(limit), 1);

    const parsedFilters = parseServerFilters(filters);
    const total = await countServers(parsedFilters);
    const servers = await getServers(page, perPage, sort_by, sort_order, parsedFilters);

    if (total === 0) {
      return Response.OK({
        servers: [],
        pagination: {
          currentPage: page,
          limit: perPage,
          rowsPerPage: 0,
          total: 0,
        },
      });
    }

    return Response.OK(
      {
        servers,
        pagination: {
          currentPage: page,
          limit: perPage,
          rowsPerPage: Math.ceil(total / perPage),
          total,
        },
      },
      "Servers fetched successfully"
    );
  } catch (error) {
    console.error("Error fetching servers:", error);
    return Response.UNKNOWN("Failed to fetch servers");
  }
};

const getServerByIdLogic = async (serverId: string) => {
  try {
    const server = await getServerById(serverId);
    if (!server) {
      return Response.NOT_FOUND("Server not found");
    }
    return Response.OK(server, "Server fetched successfully");
  } catch (error) {
    console.error("Error fetching server:", error);
    return Response.UNKNOWN("Failed to fetch server");
  }
};

const getServersByUserIdLogic = async (userId: string) => {
  try {
    const servers = await getServersByUserId(userId);
    return Response.OK(servers, "Servers fetched successfully");
  } catch (error) {
    console.error("Error fetching servers by user ID:", error);
    return Response.UNKNOWN("Failed to fetch servers");
  }
};

const parseServerFilters = (filters: any = {}) => {
  const match: any = {};

  if (filters.name) {
    match.name = { $regex: filters.name, $options: "i" };
  }

  if (filters.ip) {
    match.ip = { $regex: filters.ip, $options: "i" };
  }

  if (filters.servicecall) {
    match.servicecall = { $regex: filters.servicecall, $options: "i" };
  }

  if (filters.location) {
    match.location = { $regex: filters.location, $options: "i" };
  }

  if (filters.provider) {
    match.provider = { $regex: filters.provider, $options: "i" };
  }

  if (filters.status) {
    match.status = filters.status;
  }

  if (filters.createdBy) {
    match.createdBy = new mongoose.Types.ObjectId(filters.createdBy);
  }

  if (filters.capacity) {
    match.capacity = filters.capacity;
  }

  if (filters.startDate || filters.endDate) {
    match.createdAt = {};
    if (filters.startDate) {
      match.createdAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      match.createdAt.$lte = new Date(filters.endDate);
    }
  }

  return match;
};

export default {
  createServerLogic,
  updateServerLogic,
  deleteServerLogic,
  getServersLogic,
  getServerByIdLogic,
  getServersByUserIdLogic,
  parseServerFilters,
};