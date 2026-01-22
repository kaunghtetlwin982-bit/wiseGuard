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
const createUserLogic = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, repository_1.createUser)(payload);
        if (!user) {
            return responseStatus_1.default.NOT_IMPLEMENTED("User could not be created");
        }
        return responseStatus_1.default.OK(user, "User created successfully");
    }
    catch (error) {
        console.error("Error creating user:", error);
        return responseStatus_1.default.UNKNOWN("Failed to create user");
    }
});
const updateUserLogic = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, repository_1.updateUser)(userId, payload);
        if (!user) {
            return responseStatus_1.default.NOT_FOUND("User not found");
        }
        return responseStatus_1.default.OK(user, "User updated successfully");
    }
    catch (error) {
        console.error("Error updating user:", error);
        return responseStatus_1.default.UNKNOWN("Failed to update user");
    }
});
const deleteUserLogic = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, repository_1.deleteUser)(userId);
        if (!user) {
            return responseStatus_1.default.NOT_FOUND("User not found");
        }
        return responseStatus_1.default.OK(null, "User deleted successfully");
    }
    catch (error) {
        console.error("Error deleting user:", error);
        return responseStatus_1.default.UNKNOWN("Failed to delete user");
    }
});
const getUsersLogic = (currentPage_1, limit_1, ...args_1) => __awaiter(void 0, [currentPage_1, limit_1, ...args_1], void 0, function* (currentPage, limit, sort_by = "createdAt", sort_order = -1, filters = {}) {
    try {
        const page = Math.max(Number(currentPage), 1);
        const perPage = Math.max(Number(limit), 1);
        const total = yield (0, repository_1.countUsers)(filters);
        const users = yield (0, repository_1.getUsers)(page, perPage, sort_by, sort_order, filters);
        if (total === 0) {
            return responseStatus_1.default.OK({
                users: [],
                pagination: {
                    currentPage: page,
                    limit: perPage,
                    rowsPerPage: 0,
                    total: 0,
                },
            });
        }
        return responseStatus_1.default.OK({
            users,
            pagination: {
                currentPage: page,
                limit: perPage,
                rowsPerPage: Math.ceil(total / perPage),
                total,
            },
        }, "Users fetched successfully");
    }
    catch (error) {
        console.error("Error fetching users:", error);
        return responseStatus_1.default.UNKNOWN("Failed to fetch users");
    }
});
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
exports.default = {
    createUserLogic,
    updateUserLogic,
    deleteUserLogic,
    getUsersLogic,
};
