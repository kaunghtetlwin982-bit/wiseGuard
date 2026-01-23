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
exports.countServers = exports.getServersByUserId = exports.getServerById = exports.getServers = exports.deleteServer = exports.updateServer = exports.createServer = void 0;
const serverModel_1 = require("../../models/serverModel");
const createServer = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return serverModel_1.Server.create(payload);
});
exports.createServer = createServer;
const updateServer = (serverId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return serverModel_1.Server.findByIdAndUpdate(serverId, payload, { new: true });
});
exports.updateServer = updateServer;
const deleteServer = (serverId) => __awaiter(void 0, void 0, void 0, function* () {
    return serverModel_1.Server.findByIdAndDelete(serverId);
});
exports.deleteServer = deleteServer;
const getServers = (currentPage_1, limit_1, ...args_1) => __awaiter(void 0, [currentPage_1, limit_1, ...args_1], void 0, function* (currentPage, limit, sort_by = "createdAt", sort_order = -1, filters = {}) {
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
            localField: "createdBy",
            foreignField: "_id",
            as: "creator"
        }
    }, {
        $unwind: { path: "$creator", preserveNullAndEmptyArrays: true }
    });
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
    const servers = yield serverModel_1.Server.aggregate(pipeline);
    return servers;
});
exports.getServers = getServers;
const getServerById = (serverId) => __awaiter(void 0, void 0, void 0, function* () {
    return serverModel_1.Server.findById(serverId).populate("createdBy", "name email");
});
exports.getServerById = getServerById;
const getServersByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return serverModel_1.Server.find({ createdBy: userId }).populate("createdBy", "name email");
});
exports.getServersByUserId = getServersByUserId;
const countServers = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    return serverModel_1.Server.countDocuments(filters);
});
exports.countServers = countServers;
