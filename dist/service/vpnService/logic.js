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
// service/course.logic.ts
const repository_1 = __importDefault(require("./repository"));
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const mongoose_1 = __importDefault(require("mongoose"));
// const parseFilters = (filters: any) => {
//   if (!filters) return {};
//   const parsed: any = {};
//   Object.keys(filters).forEach((key) => {
//     if (filters[key]) parsed[key] = filters[key];
//   });
//   return parsed;
// };
const parseRatingFilters = (filters = {}) => {
    const match = {};
    if (filters.batchId) {
        match.batchId = new mongoose_1.default.Types.ObjectId(filters.batchId);
    }
    if (filters.studentId) {
        match.studentId = new mongoose_1.default.Types.ObjectId(filters.studentId);
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
const ratingList = (currentPage, limit, sort_by, sort_order, filters, userRoleName, roleEntityId) => __awaiter(void 0, void 0, void 0, function* () {
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
    const validSortOrder = (sort_order === 'desc' ? 'desc' : 'asc');
    let total = 0;
    let ratings = [];
    //  ROLE HANDLING
    switch (userRoleName) {
        case "admin":
            total = yield repository_1.default.countBatchAverageRatings(appliedFilters);
            ratings = yield repository_1.default.getBatchAverageRatings(page, perPage, 
            // sort_by,
            validSortOrder, appliedFilters);
            break;
        case "lecturer":
            if (!roleEntityId)
                throw new Error("Lecturer ID missing");
            total = yield repository_1.default.countBatchAverageRatingsByLecturer(roleEntityId, appliedFilters);
            ratings = yield repository_1.default.getBatchAverageRatingsByLecturer(roleEntityId, page, perPage, validSortOrder || "asc", appliedFilters);
            break;
        case "student":
            appliedFilters.studentId = new mongoose_1.default.Types.ObjectId(roleEntityId);
            total = yield repository_1.default.countRatings(appliedFilters);
            ratings = yield repository_1.default.getRatings(page, perPage, sort_by, validSortOrder, appliedFilters, false);
            break;
        default:
            throw new Error("Invalid role");
    }
    if (total === 0) {
        return responseStatus_1.default.OK({
            by: [],
            pagination: {
                currentPage: page,
                limit: perPage,
                rowsPerPage: 0,
                total: 0,
            },
        });
    }
    return responseStatus_1.default.OK({
        by: ratings,
        pagination: {
            currentPage: page,
            limit: perPage,
            rowsPerPage: Math.ceil(total / perPage),
            total,
        },
    }, "Ratings fetched successfully");
});
const createRating = (batchId, rating, feedback, studentId) => __awaiter(void 0, void 0, void 0, function* () {
    // return repo.runInTransaction(async (session) => {
    const rate = yield repository_1.default.createRating({ batchId,
        studentId,
        rating,
        feedback, });
    console.log("Created Rating :", rate);
    if (!rate) {
        return responseStatus_1.default.NOT_IMPLEMENTED("Rating could not be created");
    }
    return responseStatus_1.default.OK(null, "Rating created successfully");
    // });
});
exports.default = {
    ratingList,
    // listRatings,
    createRating,
    // getStudentsByCourse,
};
