import {
  createVpnKey,
  updateVpnKey,
  deleteVpnKey,
  getVpnKeys,
  countVpnKeys,
  getVpnKeyById,
  getVpnKeysByUserId,
  revokeVpnKey
} from "./repository";
import Response from "../../helper/responseStatus";
import mongoose from "mongoose";
import { VpnKey } from "../../models/vpnModel";
import broker from "../../broker/broker";

const createVpnKeyLogic = async (payload: {
  userId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdByRole: "owner" | "agent" | "developer";
  serverId: mongoose.Types.ObjectId;
  server?: string; // Add server as optional string
  outlineKeyId: string;
  accessUrl: string;
  duration: "oneMonth" | "twoMonth" | "threeMonth";
  dataLimitBytes?: number;
  expiresAt?: Date;
  status?: "active" | "expired" | "revoked";
}) => {
  try {
    // Calculate expiresAt based on duration if not provided
    let expiresAt = payload.expiresAt;
    if (!expiresAt && payload.duration) {
      const now = new Date();
      switch (payload.duration) {
        case "oneMonth":
          expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
          break;
        case "twoMonth":
          expiresAt = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days
          break;
        case "threeMonth":
          expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days
          break;
      }
    }
    const {serverId}= payload;

    // Call server-specific service based on server choice
    let serverResult: { outlineKeyId?: string; accessUrl?: string } | undefined;
    if (payload.server) {
      try {
        serverResult = await broker.call(`${payload.server}.createVpnKey`, payload);
      } catch (error) {
        console.error(`Error calling service ${payload.server}.createVpnKey:`, error);
        return Response.UNKNOWN(`Failed to create VPN key on server ${payload.server}`);
      }
    }

    const vpnKeyPayload = {
      ...payload,
      expiresAt,
      status: payload.status || "active",
      outlineKeyId: serverResult?.outlineKeyId || payload.outlineKeyId,
      accessUrl: serverResult?.accessUrl || payload.accessUrl,
    };

    // Ensure required fields are present
    if (!vpnKeyPayload.outlineKeyId || !vpnKeyPayload.accessUrl) {
      return Response.INVALID_ARGUMENT("outlineKeyId and accessUrl are required");
    }

    const vpnKey = await createVpnKey(vpnKeyPayload);
    if (!vpnKey) {
      return Response.NOT_IMPLEMENTED("VPN key could not be created");
    }
    return Response.OK(vpnKey, "VPN key created successfully");
  } catch (error) {
    console.error("Error creating VPN key:", error);
    return Response.UNKNOWN("Failed to create VPN key");
  }
};

const updateVpnKeyLogic = async (
  vpnKeyId: string,
  currentUserId: string,
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
  try {
    // First check if the VPN key exists and if the current user is the creator
    const existingVpnKey = await getVpnKeyById(vpnKeyId);
    if (!existingVpnKey) {
      return Response.NOT_FOUND("VPN key not found");
    }

    // Check if the current user is the creator of this VPN key
    if (existingVpnKey.createdBy.toString() !== currentUserId) {
      return Response.PERMISSION_DENIED("You can only update VPN keys you created");
    }

    // Recalculate expiresAt if duration is being updated
    let updatePayload = { ...payload };
    if (payload.duration && !payload.expiresAt) {
      const now = new Date();
      switch (payload.duration) {
        case "oneMonth":
          updatePayload.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
        case "twoMonth":
          updatePayload.expiresAt = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
          break;
        case "threeMonth":
          updatePayload.expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    const vpnKey = await updateVpnKey(vpnKeyId, updatePayload);
    if (!vpnKey) {
      return Response.NOT_FOUND("VPN key not found");
    }
    return Response.OK(vpnKey, "VPN key updated successfully");
  } catch (error) {
    console.error("Error updating VPN key:", error);
    return Response.UNKNOWN("Failed to update VPN key");
  }
};

const deleteVpnKeyLogic = async (vpnKeyId: string, currentUserId: string) => {
  try {
    // First check if the VPN key exists and if the current user is the creator
    const existingVpnKey = await getVpnKeyById(vpnKeyId);
    if (!existingVpnKey) {
      return Response.NOT_FOUND("VPN key not found");
    }

    // Check if the current user is the creator of this VPN key
    if (existingVpnKey.createdBy.toString() !== currentUserId) {
      return Response.PERMISSION_DENIED("You can only delete VPN keys you created");
    }

    const vpnKey = await deleteVpnKey(vpnKeyId);
    if (!vpnKey) {
      return Response.NOT_FOUND("VPN key not found");
    }
    return Response.OK(null, "VPN key deleted successfully");
  } catch (error) {
    console.error("Error deleting VPN key:", error);
    return Response.UNKNOWN("Failed to delete VPN key");
  }
};

const getVpnKeysLogic = async (
  currentPage: number,
  limit: number,
  sort_by: string = "createdAt",
  sort_order: string | 1 | -1 = -1,
  filters: any = {}
) => {
  try {
    const page = Math.max(Number(currentPage), 1);
    const perPage = Math.max(Number(limit), 1);

    const total = await countVpnKeys(filters);
    const vpnKeys = await getVpnKeys(page, perPage, sort_by, sort_order, filters);

    if (total === 0) {
      return Response.OK({
        vpnKeys: [],
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
        vpnKeys,
        pagination: {
          currentPage: page,
          limit: perPage,
          rowsPerPage: Math.ceil(total / perPage),
          total,
        },
      },
      "VPN keys fetched successfully"
    );
  } catch (error) {
    console.error("Error fetching VPN keys:", error);
    return Response.UNKNOWN("Failed to fetch VPN keys");
  }
};

const getVpnKeyByIdLogic = async (vpnKeyId: string) => {
  try {
    console.log("getVpnKeyByIdLogic ")
    const vpnKey = await getVpnKeyById(vpnKeyId);
    console.log("vpnKey : ", vpnKey)

    if (!vpnKey) {
      return Response.NOT_FOUND("VPN key not found");
    }
    

    return Response.OK(vpnKey, "VPN key fetched successfully");
  } catch (error) {
    console.error("Error fetching VPN key:", error);
    return Response.UNKNOWN("Failed to fetch VPN key");
  }
};


const getVpnKeysByUserIdLogic = async (userId: string) => {
  try {
    const vpnKeys = await getVpnKeysByUserId(userId);
    return Response.OK(vpnKeys, "User VPN keys fetched successfully");
  } catch (error) {
    console.error("Error fetching user VPN keys:", error);
    return Response.UNKNOWN("Failed to fetch user VPN keys");
  }
};

const revokeVpnKeyLogic = async (vpnKeyId: string) => {
  try {
    const vpnKey = await revokeVpnKey(vpnKeyId);
    if (!vpnKey) {
      return Response.NOT_FOUND("VPN key not found");
    }
    return Response.OK(vpnKey, "VPN key revoked successfully");
  } catch (error) {
    console.error("Error revoking VPN key:", error);
    return Response.UNKNOWN("Failed to revoke VPN key");
  }
};

const parseVpnFilters = (filters: any = {}) => {
  const match: any = {};

  if (filters.userId) {
    match.userId = new mongoose.Types.ObjectId(filters.userId);
  }

  if (filters.createdBy) {
    match.createdBy = new mongoose.Types.ObjectId(filters.createdBy);
  }

  if (filters.serverId) {
    match.serverId = new mongoose.Types.ObjectId(filters.serverId);
  }

  if (filters.status) {
    match.status = filters.status;
  }

  if (filters.createdByRole) {
    match.createdByRole = filters.createdByRole;
  }

  if (filters.duration) {
    match.duration = filters.duration;
  }

  if (filters.outlineKeyId) {
    match.outlineKeyId = filters.outlineKeyId;
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

  if (filters.expiresAt) {
    match.expiresAt = { $lte: new Date() };
  }

  return match;
};

const expireVpnKeys = async () => {
  try {
    const now = new Date();
    const result = await VpnKey.updateMany(
      {
        status: "active",
        expiresAt: { $lte: now }
      },
      {
        status: "expired"
      }
    );

    console.log(`Expired ${result.modifiedCount} VPN keys`);
    return result;
  } catch (error) {
    console.error("Error expiring VPN keys:", error);
    throw error;
  }
};

export default {
  createVpnKeyLogic,
  updateVpnKeyLogic,
  deleteVpnKeyLogic,
  getVpnKeysLogic,
  getVpnKeyByIdLogic,
  getVpnKeysByUserIdLogic,
  revokeVpnKeyLogic,
  parseVpnFilters,
  expireVpnKeys,
};
//   sort_by: string,
//   sort_order: string,
//   filters: any,
//   userRoleName?: string,
//   roleEntityId?: string
// ) => {

//   console.log("In logic ratingList 64", {
//   currentPage,
//   limit,
//   sort_by,
//   sort_order,
//   filters,
//   userRoleName,
//   roleEntityId,
// });

//   const page = Math.max(Number(currentPage), 1);
//   const perPage = Math.max(Number(limit), 1);

//   const appliedFilters = parseRatingFilters(filters);
//   const validSortOrder = (sort_order === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc' | undefined;

//   let total = 0;
//   let ratings = [];

  
//   //  ROLE HANDLING
//   switch (userRoleName) {
//     case "admin":
//       total = await repo.countBatchAverageRatings(appliedFilters);
//       ratings = await repo.getBatchAverageRatings(
//         page,
//         perPage,
//         // sort_by,
//         validSortOrder,
//         appliedFilters,
//         // true // admin

//       );
//       break;

//     case "lecturer":
//       if (!roleEntityId) throw new Error("Lecturer ID missing");

//       total = await repo.countBatchAverageRatingsByLecturer(roleEntityId, appliedFilters);
//       ratings = await repo.getBatchAverageRatingsByLecturer(
//         roleEntityId,
//         page,
//         perPage,
//         validSortOrder || "asc",
//         appliedFilters
//       );
//       break;

//     case "student":
//       appliedFilters.studentId = new mongoose.Types.ObjectId(roleEntityId!);

//       total = await repo.countRatings(appliedFilters);
//       ratings = await repo.getRatings(
//         page,
//         perPage,
//         sort_by,
//         validSortOrder,
//         appliedFilters,
//         false
//       );
//       break;

//     default:
//       throw new Error("Invalid role");
//   }

//   if (total === 0) {
//     return Response.OK({
//       by: [],
//       pagination: {
//         currentPage: page,
//         limit: perPage,
//         rowsPerPage: 0,
//         total: 0,
//       },
//     });
//   }

//   return Response.OK(
//     {
//       by: ratings,
//       pagination: {
//         currentPage: page,
//         limit: perPage,
//         rowsPerPage: Math.ceil(total / perPage),
//         total,
//       },
//     },
//     "Ratings fetched successfully"
//   );
// };


// const createRating = async (
//   batchId: string,
//   rating: number,
//   feedback: string,
//   studentId: string
// ) => {
//   // return repo.runInTransaction(async (session) => {
//   const rate = await repo.createRating({batchId,
//   studentId,
//   rating,
//   feedback,}
// );
//   console.log("Created Rating :", rate);
//   if (!rate) {
//     return Response.NOT_IMPLEMENTED("Rating could not be created");
//   }
//   return Response.OK(null, "Rating created successfully");
//   // });
// };



// export default {
//   ratingList,
//   // listRatings,
//   createRating,
//   // getStudentsByCourse,
// };
