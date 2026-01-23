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
const createServerLogic = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const server = yield (0, repository_1.createServer)(payload);
        if (!server) {
            return responseStatus_1.default.NOT_IMPLEMENTED("Server could not be created");
        }
        return responseStatus_1.default.OK(server, "Server created successfully");
    }
    catch (error) {
        console.error("Error creating server:", error);
        return responseStatus_1.default.UNKNOWN("Failed to create server");
    }
});
const updateServerLogic = (serverId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const server = yield (0, repository_1.updateServer)(serverId, payload);
        if (!server) {
            return responseStatus_1.default.NOT_FOUND("Server not found");
        }
        return responseStatus_1.default.OK(server, "Server updated successfully");
    }
    catch (error) {
        console.error("Error updating server:", error);
        return responseStatus_1.default.UNKNOWN("Failed to update server");
    }
});
const deleteServerLogic = (serverId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const server = yield (0, repository_1.deleteServer)(serverId);
        if (!server) {
            return responseStatus_1.default.NOT_FOUND("Server not found");
        }
        return responseStatus_1.default.OK(server, "Server deleted successfully");
    }
    catch (error) {
        console.error("Error deleting server:", error);
        return responseStatus_1.default.UNKNOWN("Failed to delete server");
    }
});
const getServersLogic = (currentPage, limit, sort_by, sort_order, filters) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Math.max(Number(currentPage), 1);
        const perPage = Math.max(Number(limit), 1);
        const parsedFilters = parseServerFilters(filters);
        const total = yield (0, repository_1.countServers)(parsedFilters);
        const servers = yield (0, repository_1.getServers)(page, perPage, sort_by, sort_order, parsedFilters);
        if (total === 0) {
            return responseStatus_1.default.OK({
                servers: [],
                pagination: {
                    currentPage: page,
                    limit: perPage,
                    rowsPerPage: 0,
                    total: 0,
                },
            });
        }
        return responseStatus_1.default.OK({
            servers,
            pagination: {
                currentPage: page,
                limit: perPage,
                rowsPerPage: Math.ceil(total / perPage),
                total,
            },
        }, "Servers fetched successfully");
    }
    catch (error) {
        console.error("Error fetching servers:", error);
        return responseStatus_1.default.UNKNOWN("Failed to fetch servers");
    }
});
const getServerByIdLogic = (serverId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const server = yield (0, repository_1.getServerById)(serverId);
        if (!server) {
            return responseStatus_1.default.NOT_FOUND("Server not found");
        }
        return responseStatus_1.default.OK(server, "Server fetched successfully");
    }
    catch (error) {
        console.error("Error fetching server:", error);
        return responseStatus_1.default.UNKNOWN("Failed to fetch server");
    }
});
const getServersByUserIdLogic = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const servers = yield (0, repository_1.getServersByUserId)(userId);
        return responseStatus_1.default.OK(servers, "Servers fetched successfully");
    }
    catch (error) {
        console.error("Error fetching servers by user ID:", error);
        return responseStatus_1.default.UNKNOWN("Failed to fetch servers");
    }
});
const parseServerFilters = (filters = {}) => {
    const match = {};
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
        match.createdBy = new mongoose_1.default.Types.ObjectId(filters.createdBy);
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
exports.default = {
    createServerLogic,
    updateServerLogic,
    deleteServerLogic,
    getServersLogic,
    getServerByIdLogic,
    getServersByUserIdLogic,
    parseServerFilters,
};
