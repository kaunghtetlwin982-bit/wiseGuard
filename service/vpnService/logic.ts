// service/course.logic.ts
import repo from "./repository";
import Response from "../helper/responseStatus";
import { createType, updateType } from "../type/type";
import mongoose, { get, Types } from "mongoose";

// const parseFilters = (filters: any) => {
//   if (!filters) return {};
//   const parsed: any = {};

//   Object.keys(filters).forEach((key) => {
//     if (filters[key]) parsed[key] = filters[key];
//   });

//   return parsed;
// };

const parseRatingFilters = (filters: any = {}) => {
  const match: any = {};

  if (filters.batchId) {
    match.batchId = new mongoose.Types.ObjectId(filters.batchId);
  }

  if (filters.studentId) {
    match.studentId = new mongoose.Types.ObjectId(filters.studentId);
  }

  if (filters.rating) {
    match.rating = Number(filters.rating);
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




const ratingList = async (
  currentPage: number,
  limit: number,
  sort_by: string,
  sort_order: string,
  filters: any,
  userRoleName?: string,
  roleEntityId?: string
) => {

  console.log("In logic ratingList 64", {
  currentPage,
  limit,
  sort_by,
  sort_order,
  filters,
  userRoleName,
  roleEntityId,
});

  const page = Math.max(Number(currentPage), 1);
  const perPage = Math.max(Number(limit), 1);

  const appliedFilters = parseRatingFilters(filters);
  const validSortOrder = (sort_order === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc' | undefined;

  let total = 0;
  let ratings = [];

  
  //  ROLE HANDLING
  switch (userRoleName) {
    case "admin":
      total = await repo.countBatchAverageRatings(appliedFilters);
      ratings = await repo.getBatchAverageRatings(
        page,
        perPage,
        // sort_by,
        validSortOrder,
        appliedFilters,
        // true // admin

      );
      break;

    case "lecturer":
      if (!roleEntityId) throw new Error("Lecturer ID missing");

      total = await repo.countBatchAverageRatingsByLecturer(roleEntityId, appliedFilters);
      ratings = await repo.getBatchAverageRatingsByLecturer(
        roleEntityId,
        page,
        perPage,
        validSortOrder || "asc",
        appliedFilters
      );
      break;

    case "student":
      appliedFilters.studentId = new mongoose.Types.ObjectId(roleEntityId!);

      total = await repo.countRatings(appliedFilters);
      ratings = await repo.getRatings(
        page,
        perPage,
        sort_by,
        validSortOrder,
        appliedFilters,
        false
      );
      break;

    default:
      throw new Error("Invalid role");
  }

  if (total === 0) {
    return Response.OK({
      by: [],
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
      by: ratings,
      pagination: {
        currentPage: page,
        limit: perPage,
        rowsPerPage: Math.ceil(total / perPage),
        total,
      },
    },
    "Ratings fetched successfully"
  );
};


const createRating = async (
  batchId: string,
  rating: number,
  feedback: string,
  studentId: string
) => {
  // return repo.runInTransaction(async (session) => {
  const rate = await repo.createRating({batchId,
  studentId,
  rating,
  feedback,}
);
  console.log("Created Rating :", rate);
  if (!rate) {
    return Response.NOT_IMPLEMENTED("Rating could not be created");
  }
  return Response.OK(null, "Rating created successfully");
  // });
};



export default {
  ratingList,
  // listRatings,
  createRating,
  // getStudentsByCourse,
};
