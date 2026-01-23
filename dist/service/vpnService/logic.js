"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const repository_1 = require("./repository");
const responseStatus_1 = __importDefault(require("../../helper/responseStatus"));
const mongoose_1 = __importDefault(require("mongoose"));
const vpnModel_1 = require("../../models/vpnModel");
const broker_1 = __importDefault(require("../../broker/broker"));
const createVpnKeyLogic = (payload) => __awaiter(void 0, void 0, void 0, function* () {
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
        const { serverId } = payload;
        // Call server-specific service based on server choice
        let serverResult;
        if (payload.server) {
            try {
                serverResult = yield broker_1.default.call(`${payload.server}.createVpnKey`, payload);
            }
            catch (error) {
                console.error(`Error calling service ${payload.server}.createVpnKey:`, error);
                return responseStatus_1.default.UNKNOWN(`Failed to create VPN key on server ${payload.server}`);
            }
        }
        const vpnKeyPayload = Object.assign(Object.assign({}, payload), { expiresAt, status: payload.status || "active", outlineKeyId: (serverResult === null || serverResult === void 0 ? void 0 : serverResult.outlineKeyId) || payload.outlineKeyId, accessUrl: (serverResult === null || serverResult === void 0 ? void 0 : serverResult.accessUrl) || payload.accessUrl });
        // Ensure required fields are present
        if (!vpnKeyPayload.outlineKeyId || !vpnKeyPayload.accessUrl) {
            return responseStatus_1.default.INVALID_ARGUMENT("outlineKeyId and accessUrl are required");
        }
        const vpnKey = yield (0, repository_1.createVpnKey)(vpnKeyPayload);
        if (!vpnKey) {
            return responseStatus_1.default.NOT_IMPLEMENTED("VPN key could not be created");
        }
        return responseStatus_1.default.OK(vpnKey, "VPN key created successfully");
    }
    catch (error) {
        console.error("Error creating VPN key:", error);
        return responseStatus_1.default.UNKNOWN("Failed to create VPN key");
    }
});
const updateVpnKeyLogic = (vpnKeyId, currentUserId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // First check if the VPN key exists and if the current user is the creator
        const existingVpnKey = yield (0, repository_1.getVpnKeyById)(vpnKeyId);
        if (!existingVpnKey) {
            return responseStatus_1.default.NOT_FOUND("VPN key not found");
        }
        // Check if the current user is the creator of this VPN key
        if (existingVpnKey.createdBy.toString() !== currentUserId) {
            return responseStatus_1.default.PERMISSION_DENIED("You can only update VPN keys you created");
        }
        // Recalculate expiresAt if duration is being updated
        let updatePayload = Object.assign({}, payload);
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
        const vpnKey = yield (0, repository_1.updateVpnKey)(vpnKeyId, updatePayload);
        if (!vpnKey) {
            return responseStatus_1.default.NOT_FOUND("VPN key not found");
        }
        return responseStatus_1.default.OK(vpnKey, "VPN key updated successfully");
    }
    catch (error) {
        console.error("Error updating VPN key:", error);
        return responseStatus_1.default.UNKNOWN("Failed to update VPN key");
    }
});
const deleteVpnKeyLogic = (vpnKeyId, currentUserId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // First check if the VPN key exists and if the current user is the creator
        const existingVpnKey = yield (0, repository_1.getVpnKeyById)(vpnKeyId);
        if (!existingVpnKey) {
            return responseStatus_1.default.NOT_FOUND("VPN key not found");
        }
        // Check if the current user is the creator of this VPN key
        if (existingVpnKey.createdBy._id.toString() !== currentUserId) {
            return responseStatus_1.default.PERMISSION_DENIED("You can only delete VPN keys you created");
        }
        const vpnKey = yield (0, repository_1.deleteVpnKey)(vpnKeyId);
        if (!vpnKey) {
            return responseStatus_1.default.NOT_FOUND("VPN key not found");
        }
        return responseStatus_1.default.OK(null, "VPN key deleted successfully");
    }
    catch (error) {
        console.error("Error deleting VPN key:", error);
        return responseStatus_1.default.UNKNOWN("Failed to delete VPN key");
    }
});
const getVpnKeysLogic = (currentPage_1, limit_1, ...args_1) => __awaiter(void 0, [currentPage_1, limit_1, ...args_1], void 0, function* (currentPage, limit, sort_by = "createdAt", sort_order = -1, filters = {}) {
    try {
        const page = Math.max(Number(currentPage), 1);
        const perPage = Math.max(Number(limit), 1);
        const total = yield (0, repository_1.countVpnKeys)(filters);
        const vpnKeys = yield (0, repository_1.getVpnKeys)(page, perPage, sort_by, sort_order, filters);
        if (total === 0) {
            return responseStatus_1.default.OK({
                vpnKeys: [],
                pagination: {
                    currentPage: page,
                    limit: perPage,
                    rowsPerPage: 0,
                    total: 0,
                },
            });
        }
        return responseStatus_1.default.OK({
            vpnKeys,
            pagination: {
                currentPage: page,
                limit: perPage,
                rowsPerPage: Math.ceil(total / perPage),
                total,
            },
        }, "VPN keys fetched successfully");
    }
    catch (error) {
        console.error("Error fetching VPN keys:", error);
        return responseStatus_1.default.UNKNOWN("Failed to fetch VPN keys");
    }
});
const getVpnKeyByIdLogic = (vpnKeyId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("getVpnKeyByIdLogic ");
        const vpnKey = yield (0, repository_1.getVpnKeyById)(vpnKeyId);
        console.log("vpnKey 211 : ", vpnKey);
        if (!vpnKey) {
            return responseStatus_1.default.NOT_FOUND("VPN key not found");
        }
        return responseStatus_1.default.OK(vpnKey, "VPN key fetched successfully");
    }
    catch (error) {
        console.error("Error fetching VPN key:", error);
        return responseStatus_1.default.UNKNOWN("Failed to fetch VPN key");
    }
});
const getVpnKeysByUserIdLogic = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vpnKeys = yield (0, repository_1.getVpnKeysByUserId)(userId);
        return responseStatus_1.default.OK(vpnKeys, "User VPN keys fetched successfully");
    }
    catch (error) {
        console.error("Error fetching user VPN keys:", error);
        return responseStatus_1.default.UNKNOWN("Failed to fetch user VPN keys");
    }
});
const revokeVpnKeyLogic = (vpnKeyId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vpnKey = yield (0, repository_1.revokeVpnKey)(vpnKeyId);
        if (!vpnKey) {
            return responseStatus_1.default.NOT_FOUND("VPN key not found");
        }
        return responseStatus_1.default.OK(vpnKey, "VPN key revoked successfully");
    }
    catch (error) {
        console.error("Error revoking VPN key:", error);
        return responseStatus_1.default.UNKNOWN("Failed to revoke VPN key");
    }
});
const parseVpnFilters = (filters = {}) => {
    const match = {};
    if (filters.userId) {
        match.userId = new mongoose_1.default.Types.ObjectId(filters.userId);
    }
    if (filters.createdBy) {
        match.createdBy = new mongoose_1.default.Types.ObjectId(filters.createdBy);
    }
    if (filters.serverId) {
        match.serverId = new mongoose_1.default.Types.ObjectId(filters.serverId);
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
const expireVpnKeys = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        const result = yield vpnModel_1.VpnKey.updateMany({
            status: "active",
            expiresAt: { $lte: now }
        }, {
            status: "expired"
        });
        console.log(`Expired ${result.modifiedCount} VPN keys`);
        return result;
    }
    catch (error) {
        console.error("Error expiring VPN keys:", error);
        throw error;
    }
});
exports.default = {
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
