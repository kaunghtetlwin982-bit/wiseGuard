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
exports.revokeVpnKey = exports.getVpnKeysByUserId = exports.getVpnKeyById = exports.countVpnKeys = exports.getVpnKeys = exports.deleteVpnKey = exports.updateVpnKey = exports.createVpnKey = void 0;
const vpnModel_1 = require("../../models/vpnModel");
const mongoose_1 = __importDefault(require("mongoose"));
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
            _id: 1,
            id: { $toString: "$_id" },
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
    console.log("vpnKeyId : ", vpnKeyId);
    console.log("VpnKey collection:", vpnModel_1.VpnKey.collection.name);
    return vpnModel_1.VpnKey.findById(vpnKeyId)
        .populate('userId', 'name email roleId')
        .populate('createdBy', 'name email roleId')
        .populate('serverId', 'name serverUrl location');
});
exports.getVpnKeyById = getVpnKeyById;
const getVpnKeysByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("getVpnKeysByUserId : ", exports.getVpnKeysByUserId);
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        return [];
    }
    console.log(vpnModel_1.VpnKey.collection.name);
    return vpnModel_1.VpnKey.find({
        userId: new mongoose_1.default.Types.ObjectId(userId),
    })
        .populate("serverId", "name serverUrl location")
        .sort({ createdAt: -1 });
});
exports.getVpnKeysByUserId = getVpnKeysByUserId;
const revokeVpnKey = (vpnKeyId) => __awaiter(void 0, void 0, void 0, function* () {
    return vpnModel_1.VpnKey.findByIdAndUpdate(vpnKeyId, { status: "inactive" }, { new: true });
});
exports.revokeVpnKey = revokeVpnKey;
