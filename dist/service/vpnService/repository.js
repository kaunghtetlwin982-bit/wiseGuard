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
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeVpnKey = exports.getVpnKeysByUserId = exports.getVpnKeyById = exports.countVpnKeys = exports.getVpnKeys = exports.deleteVpnKey = exports.updateVpnKey = exports.createVpnKey = void 0;
const vpnModel_1 = require("../../models/vpnModel");
const createVpnKey = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return vpnModel_1.VpnKey.create(payload);
});
exports.createVpnKey = createVpnKey;
const updateVpnKey = (vpnKeyId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return vpnModel_1.VpnKey.findByIdAndUpdate(vpnKeyId, payload, { new: true });
});
exports.updateVpnKey = updateVpnKey;
const deleteVpnKey = (vpnKeyId) => __awaiter(void 0, void 0, void 0, function* () {
    return vpnModel_1.VpnKey.findByIdAndDelete(vpnKeyId);
});
exports.deleteVpnKey = deleteVpnKey;
const getVpnKeys = (currentPage_1, limit_1, ...args_1) => __awaiter(void 0, [currentPage_1, limit_1, ...args_1], void 0, function* (currentPage, limit, sort_by = "createdAt", sort_order = -1, filters = {}) {
    const order = sort_order === "desc" ? -1 : 1;
    const pipeline = [
        { $match: filters },
        { $sort: { [sort_by]: order } },
        { $skip: (currentPage - 1) * limit },
        { $limit: limit },
    ];
    // Add population for related data
    pipeline.unshift({
        $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
        }
    }, {
        $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "creator"
        }
    }, {
        $lookup: {
            from: "servers",
            localField: "serverId",
            foreignField: "_id",
            as: "server"
        }
    }, {
        $unwind: { path: "$user", preserveNullAndEmptyArrays: true }
    }, {
        $unwind: { path: "$creator", preserveNullAndEmptyArrays: true }
    }, {
        $unwind: { path: "$server", preserveNullAndEmptyArrays: true }
    });
    // Final projection
    pipeline.push({
        $project: {
            _id: 0,
            id: "$_id",
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
    return vpnModel_1.VpnKey.aggregate(pipeline);
});
exports.getVpnKeys = getVpnKeys;
const countVpnKeys = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    var _a;
    const count = yield vpnModel_1.VpnKey.aggregate([
        { $match: filters },
        { $count: "total" },
    ]);
    return ((_a = count[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
});
exports.countVpnKeys = countVpnKeys;
const getVpnKeyById = (vpnKeyId) => __awaiter(void 0, void 0, void 0, function* () {
    return vpnModel_1.VpnKey.findById(vpnKeyId)
        .populate('userId', 'name email roleId')
        .populate('createdBy', 'name email roleId')
        .populate('serverId', 'name serverUrl location');
});
exports.getVpnKeyById = getVpnKeyById;
const getVpnKeysByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return vpnModel_1.VpnKey.find({ userId })
        .populate('serverId', 'name serverUrl location')
        .sort({ createdAt: -1 });
});
exports.getVpnKeysByUserId = getVpnKeysByUserId;
const revokeVpnKey = (vpnKeyId) => __awaiter(void 0, void 0, void 0, function* () {
    return vpnModel_1.VpnKey.findByIdAndUpdate(vpnKeyId, { status: "inactive" }, { new: true });
});
exports.revokeVpnKey = revokeVpnKey;
// //           name: "$user.name",
// //           email: "$user.email",
// //           phone: "$user.phoneNo",
// //         },
// //       }),
// //       createdAt: {
// //         $dateToString: {
// //           format: "%Y-%m-%d",
// //           date: "$createdAt",
// //         },
// //       },
// //       updatedAt: {
// //         $dateToString: {
// //           format: "%Y-%m-%d",
// //           date: "$updatedAt",
// //         },
// //       },
// //     },
// //   });
// //   return Rating.aggregate(pipeline);
// // };
// //admin only
// // const countBatchAverageRatings = async (filters: any = {}) => {
// //   // const match = parseRatingFilters(filters);
// //   const result = await Rating.aggregate([
// //     { $match: filters },
// //     { $group: { _id: "$batchId" } },
// //     { $count: "total" },
// //   ]);
// //   return result[0]?.total || 0;
// // };
// //admin only
// // const getBatchAverageRatings = async (
// //   currentPage: number,
// //   limit: number,
// //   sort_order: "asc" | "desc" = "desc",
// //   filters: any = {}
// // ) => {
// //   const order: 1 | -1 = sort_order === "desc" ? -1 : 1;
// //   const pipeline: any[] = [
// //     // 1️⃣ Filter ratings
// //     { $match: filters },
// //     // 2️⃣ Group by batchId
// //     {
// //       $group: {
// //         _id: "$batchId",
// //         avgRating: { $avg: "$rating" },
// //         totalRatings: { $sum: 1 },
// //       },
// //     },
// //     // 3️⃣ Sort by avg rating
// //     { $sort: { avgRating: order } },
// //     // 4️⃣ Pagination AFTER grouping
// //     { $skip: (currentPage - 1) * limit },
// //     { $limit: limit },
// //     // 5️⃣ Batch lookup
// //     {
// //       $lookup: {
// //         from: "batches",
// //         localField: "_id",
// //         foreignField: "_id",
// //         as: "batch",
// //       },
// //     },
// //     { $unwind: "$batch" },
// //     // 6️⃣ Lecturer lookup
// //     {
// //       $lookup: {
// //         from: "lecturers",
// //         localField: "batch.lecturerId",
// //         foreignField: "_id",
// //         as: "lecturer",
// //       },
// //     },
// //     { $unwind: "$lecturer" },
// //     // 7️⃣ Lecturer user lookup
// //     {
// //       $lookup: {
// //         from: "users",
// //         localField: "lecturer.userId",
// //         foreignField: "_id",
// //         as: "lecturerUser",
// //       },
// //     },
// //     { $unwind: "$lecturerUser" },
// //     // 8️⃣ Final response shape
// //     {
// //       $project: {
// //         _id: 0,
// //         batchId: "$_id",
// //         avgRating: { $round: ["$avgRating", 1] },
// //         totalRatings: 1,
// //         batch: {
// //           id: "$batch._id",
// //           batchName: "$batch.batchName",
// //           classType: "$batch.classType",
// //           lecturer: {
// //             id: "$lecturer._id",
// //             name: "$lecturerUser.name",
// //             email: "$lecturerUser.email",
// //             specialization: "$lecturer.specialization",
// //           },
// //         },
// //       },
// //     },
// //   ];
// //   return Rating.aggregate(pipeline);
// // };
// // const countBatchAverageRatingsByLecturer = async (
// //   lecturerId: string,
// //   filters: any = {}
// // ) => {
// //   // const match = parseRatingFilters(filters);
// //   const result = await Rating.aggregate([
// //     { $match: filters },
// //     {
// //       $lookup: {
// //         from: "batches",
// //         localField: "batchId",
// //         foreignField: "_id",
// //         as: "batch",
// //       },
// //     },
// //     { $unwind: "$batch" },
// //     {
// //       $match: {
// //         "batch.lecturerId": new mongoose.Types.ObjectId(lecturerId),
// //       },
// //     },
// //     { $group: { _id: "$batchId" } },
// //     { $count: "total" },
// //   ]);
// //   return result[0]?.total || 0;
// // };
// // const getRatingsByLecturer = async (
// //   lecturerId: string,
// //   page: number,
// //   limit: number,
// //   sortBy: string,
// //   sortOrder: 'asc' | 'desc'
// // ) => {
// //   return Rating.aggregate([
// //     // Join batch
// //     {
// //       $lookup: {
// //         from: "batches",
// //         localField: "batchId",
// //         foreignField: "_id",
// //         as: "batch"
// //       }
// //     },
// //     // Unwind batch array
// //     { $unwind: "$batch" },
// //     // Match lecturer
// //     {
// //       $match: {
// //         "batch.lecturerId": new mongoose.Types.ObjectId(lecturerId)
// //       }
// //     },
// //     //  Sort
// //     {
// //       $sort: {
// //         [sortBy]: sortOrder === "desc" ? -1 : 1
// //       }
// //     },
// //     // Pagination
// //     { $skip: (page - 1) * limit },
// //     { $limit: limit },
// //     //  Project response
// //     {
// //       $project: {
// //         _id: 0,
// //         id: "$_id",
// //         rating: 1,
// //         feedback: 1,
// //         batchId: 1,
// //         batch: {
// //           id: "$batch._id",
// //           batchName: "$batch.batchName",
// //           classType: "$batch.classType",
// //         },
// //         createdAt: {
// //           $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
// //         },
// //         updatedAt: {
// //           $dateToString: {
// //             format: "%Y-%m-%d",
// //             date: "$updatedAt",
// //           },
// //         },
// //       }
// //     }
// //   ]);
// // }
// // const getBatchAverageRatingsByLecturer = async (
// //   lecturerId: string,
// //   page: number,
// //   limit: number,
// //   sortOrder: "asc" | "desc" = "desc",
// //   filters: any = {}
// // ) => {
// //   const order: 1 | -1 = sortOrder === "desc" ? -1 : 1;
// //   // const match = parseRatingFilters(filters);
// //   return Rating.aggregate([
// //     { $match: filters },
// //     {
// //       $lookup: {
// //         from: "batches",
// //         localField: "batchId",
// //         foreignField: "_id",
// //         as: "batch",
// //       },
// //     },
// //     { $unwind: "$batch" },
// //     {
// //       $match: {
// //         "batch.lecturerId": new mongoose.Types.ObjectId(lecturerId),
// //       },
// //     },
// //     {
// //       $group: {
// //         _id: "$batchId",
// //         avgRating: { $avg: "$rating" },
// //         totalRatings: { $sum: 1 },
// //         batch: { $first: "$batch" },
// //       },
// //     },
// //     { $sort: { avgRating: order } },
// //     { $skip: (page - 1) * limit },
// //     { $limit: limit },
// //     {
// //       $project: {
// //         _id: 0,
// //         batchId: "$_id",
// //         avgRating: { $round: ["$avgRating", 1] },
// //         totalRatings: 1,
// //         batch: {
// //           id: "$batch._id",
// //           batchName: "$batch.batchName",
// //           classType: "$batch.classType",
// //         },
// //       },
// //     },
// //   ]);
// // };
// // const createRating = async ({
// //   batchId,
// //   studentId,
// //   rating,
// //   feedback,
// // }: {
// //   batchId: string;
// //   studentId: string;
// //   rating: number;
// //   feedback: string;
// // }) => {
// //   return Rating.updateOne(
// //     { batchId, studentId }, //  match condition
// //     {
// //       $set: {
// //         rating,
// //         feedback,
// //       },
// //     },
// //     {
// //       upsert: true,          // insert if not exists, update if exists
// //       runValidators: true,
// //     }
// //   );
// // }
// // const runInTransaction = async (
// //   operations: (session: mongoose.ClientSession) => Promise<any>
// // ) => {
// //   const session = await mongoose.startSession();
// //   session.startTransaction();
// //   try {
// //     const result = await operations(session);
// //     await session.commitTransaction();
// //     session.endSession();
// //     return result;
// //   } catch (err) {
// //     await session.abortTransaction();
// //     session.endSession();
// //     const errorMessage = err instanceof Error ? err.message : String(err);
// //     return Response.UNKNOWN(errorMessage);
// //   }
// // };
// // export default {
// //   countRatings,
// //   getRatings,
// //   countBatchAverageRatingsByLecturer,
// //   countBatchAverageRatings,
// //   // getRatingsByLecturer,
// //   createRating,
// //   runInTransaction,
// //   getBatchAverageRatings,
// //   getBatchAverageRatingsByLecturer
// // };
