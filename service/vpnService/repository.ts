import mongoose, { get, Types, SortOrder } from "mongoose";
// import { Rating } from "../model/ratingModel";
// import { createType, listType, updateType } from "../type/type";
import Response from "../helper/responseStatus";
import { backup } from "node:sqlite";
import { start } from "repl";
// import { count } from "console";
import { format } from "path";
import { Batch } from "mongodb";

// const countRatings = async (filters: any = {}) => {
//   const count = await Rating.aggregate([
//     { $match: filters },
//     { $count: "total" },
//   ]);

//   return count[0]?.total || 0;
// };


// const getRatings = async (
//   currentPage: number,
//   limit: number,
//   sort_by: string = "createdAt",
//   sort_order: string | 1 | -1 = -1,
//   filters: any = {},
//   admin: boolean = false
// ) => {
//   const order: 1 | -1 = sort_order === "desc" ? -1 : 1;

//   const pipeline: any[] = [
//     { $match: filters },
//     { $sort: { [sort_by]: order } },
//     { $skip: (currentPage - 1) * limit },
//     { $limit: limit },
//   ];

 
//   // Final projection depends on role
//   pipeline.push({
//     $project: {
//       _id: 0,
//       id: "$_id",
//       rating: 1,
//       feedback: 1,
//       batchId: 1,

//       ...(admin && {
//         student: {
//           id: "$student._id",
//           name: "$user.name",
//           email: "$user.email",
//           phone: "$user.phoneNo",
//         },
//       }),

//       createdAt: {
//         $dateToString: {
//           format: "%Y-%m-%d",
//           date: "$createdAt",
//         },
//       },
//       updatedAt: {
//         $dateToString: {
//           format: "%Y-%m-%d",
//           date: "$updatedAt",
//         },
//       },
//     },
//   });

//   return Rating.aggregate(pipeline);
// };


//admin only
// const countBatchAverageRatings = async (filters: any = {}) => {
//   // const match = parseRatingFilters(filters);

//   const result = await Rating.aggregate([
//     { $match: filters },
//     { $group: { _id: "$batchId" } },
//     { $count: "total" },
//   ]);

//   return result[0]?.total || 0;
// };



//admin only
// const getBatchAverageRatings = async (
//   currentPage: number,
//   limit: number,
//   sort_order: "asc" | "desc" = "desc",
//   filters: any = {}
// ) => {
//   const order: 1 | -1 = sort_order === "desc" ? -1 : 1;

//   const pipeline: any[] = [
//     // 1️⃣ Filter ratings
//     { $match: filters },

//     // 2️⃣ Group by batchId
//     {
//       $group: {
//         _id: "$batchId",
//         avgRating: { $avg: "$rating" },
//         totalRatings: { $sum: 1 },
//       },
//     },

//     // 3️⃣ Sort by avg rating
//     { $sort: { avgRating: order } },

//     // 4️⃣ Pagination AFTER grouping
//     { $skip: (currentPage - 1) * limit },
//     { $limit: limit },

//     // 5️⃣ Batch lookup
//     {
//       $lookup: {
//         from: "batches",
//         localField: "_id",
//         foreignField: "_id",
//         as: "batch",
//       },
//     },
//     { $unwind: "$batch" },

//     // 6️⃣ Lecturer lookup
//     {
//       $lookup: {
//         from: "lecturers",
//         localField: "batch.lecturerId",
//         foreignField: "_id",
//         as: "lecturer",
//       },
//     },
//     { $unwind: "$lecturer" },

//     // 7️⃣ Lecturer user lookup
//     {
//       $lookup: {
//         from: "users",
//         localField: "lecturer.userId",
//         foreignField: "_id",
//         as: "lecturerUser",
//       },
//     },
//     { $unwind: "$lecturerUser" },

//     // 8️⃣ Final response shape
//     {
//       $project: {
//         _id: 0,
//         batchId: "$_id",

//         avgRating: { $round: ["$avgRating", 1] },
//         totalRatings: 1,

//         batch: {
//           id: "$batch._id",
//           batchName: "$batch.batchName",
//           classType: "$batch.classType",
//           lecturer: {
//             id: "$lecturer._id",
//             name: "$lecturerUser.name",
//             email: "$lecturerUser.email",
//             specialization: "$lecturer.specialization",
//           },
//         },
//       },
//     },
//   ];

//   return Rating.aggregate(pipeline);
// };



// const countBatchAverageRatingsByLecturer = async (
//   lecturerId: string,
//   filters: any = {}
// ) => {
//   // const match = parseRatingFilters(filters);

//   const result = await Rating.aggregate([
//     { $match: filters },

//     {
//       $lookup: {
//         from: "batches",
//         localField: "batchId",
//         foreignField: "_id",
//         as: "batch",
//       },
//     },
//     { $unwind: "$batch" },

//     {
//       $match: {
//         "batch.lecturerId": new mongoose.Types.ObjectId(lecturerId),
//       },
//     },

//     { $group: { _id: "$batchId" } },
//     { $count: "total" },
//   ]);

//   return result[0]?.total || 0;
// };

// const getRatingsByLecturer = async (
//   lecturerId: string,
//   page: number,
//   limit: number,
//   sortBy: string,
//   sortOrder: 'asc' | 'desc'
// ) => {
//   return Rating.aggregate([
//     // Join batch
//     {
//       $lookup: {
//         from: "batches",
//         localField: "batchId",
//         foreignField: "_id",
//         as: "batch"
//       }
//     },

//     // Unwind batch array
//     { $unwind: "$batch" },

//     // Match lecturer
//     {
//       $match: {
//         "batch.lecturerId": new mongoose.Types.ObjectId(lecturerId)
//       }
//     },

//     //  Sort
//     {
//       $sort: {
//         [sortBy]: sortOrder === "desc" ? -1 : 1
//       }
//     },

//     // Pagination
//     { $skip: (page - 1) * limit },
//     { $limit: limit },

//     //  Project response
//     {
//       $project: {
//         _id: 0,
//         id: "$_id",
//         rating: 1,
//         feedback: 1,
//         batchId: 1,
//         batch: {
//           id: "$batch._id",
//           batchName: "$batch.batchName",
//           classType: "$batch.classType",
//         },
//         createdAt: {
//           $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
//         },
//         updatedAt: {
//           $dateToString: {
//             format: "%Y-%m-%d",
//             date: "$updatedAt",
//           },
//         },
//       }
//     }
//   ]);
// }

// const getBatchAverageRatingsByLecturer = async (
//   lecturerId: string,
//   page: number,
//   limit: number,
//   sortOrder: "asc" | "desc" = "desc",
//   filters: any = {}
// ) => {
//   const order: 1 | -1 = sortOrder === "desc" ? -1 : 1;
//   // const match = parseRatingFilters(filters);

//   return Rating.aggregate([
//     { $match: filters },

//     {
//       $lookup: {
//         from: "batches",
//         localField: "batchId",
//         foreignField: "_id",
//         as: "batch",
//       },
//     },
//     { $unwind: "$batch" },

//     {
//       $match: {
//         "batch.lecturerId": new mongoose.Types.ObjectId(lecturerId),
//       },
//     },

//     {
//       $group: {
//         _id: "$batchId",
//         avgRating: { $avg: "$rating" },
//         totalRatings: { $sum: 1 },
//         batch: { $first: "$batch" },
//       },
//     },

//     { $sort: { avgRating: order } },
//     { $skip: (page - 1) * limit },
//     { $limit: limit },

//     {
//       $project: {
//         _id: 0,
//         batchId: "$_id",
//         avgRating: { $round: ["$avgRating", 1] },
//         totalRatings: 1,
//         batch: {
//           id: "$batch._id",
//           batchName: "$batch.batchName",
//           classType: "$batch.classType",
//         },
//       },
//     },
//   ]);
// };



// const createRating = async ({
//   batchId,
//   studentId,
//   rating,
//   feedback,
// }: {
//   batchId: string;
//   studentId: string;
//   rating: number;
//   feedback: string;
// }) => {
//   return Rating.updateOne(
//     { batchId, studentId }, //  match condition
//     {
//       $set: {
//         rating,
//         feedback,
//       },
//     },
//     {
//       upsert: true,          // insert if not exists, update if exists
//       runValidators: true,
//     }
//   );
// }


// const runInTransaction = async (
//   operations: (session: mongoose.ClientSession) => Promise<any>
// ) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const result = await operations(session);
//     await session.commitTransaction();
//     session.endSession();
//     return result;
//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
//     const errorMessage = err instanceof Error ? err.message : String(err);
//     return Response.UNKNOWN(errorMessage);
//   }
// };

// export default {
//   countRatings,
//   getRatings,
//   countBatchAverageRatingsByLecturer,
//   countBatchAverageRatings,
//   // getRatingsByLecturer,
//   createRating,
//   runInTransaction,
//   getBatchAverageRatings,
//   getBatchAverageRatingsByLecturer
// };
