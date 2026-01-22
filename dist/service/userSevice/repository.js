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
exports.countUsers = exports.getUsers = exports.deleteUser = exports.updateUser = exports.createUser = void 0;
const userModel_1 = require("../../models/userModel");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return userModel_1.User.create(payload);
});
exports.createUser = createUser;
const updateUser = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return userModel_1.User.findByIdAndUpdate(userId, payload, { new: true });
});
exports.updateUser = updateUser;
const deleteUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return userModel_1.User.findByIdAndDelete(userId);
});
exports.deleteUser = deleteUser;
const getUsers = (currentPage_1, limit_1, ...args_1) => __awaiter(void 0, [currentPage_1, limit_1, ...args_1], void 0, function* (currentPage, limit, sort_by = "createdAt", sort_order = -1, filters = {}) {
    const order = sort_order === "desc" ? -1 : 1;
    const pipeline = [
        { $match: filters },
        { $sort: { [sort_by]: order } },
        { $skip: (currentPage - 1) * limit },
        { $limit: limit },
    ];
    // Final projection
    pipeline.push({
        $project: {
            _id: 0,
            id: "$_id",
            name: 1,
            email: 1,
            phoneNo: 1,
            address: 1,
            status: 1,
            roleId: 1,
            createdAt: {
                $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                },
            },
            updatedAt: {
                $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$updatedAt",
                },
            },
        },
    });
    return userModel_1.User.aggregate(pipeline);
});
exports.getUsers = getUsers;
const countUsers = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    var _a;
    const count = yield userModel_1.User.aggregate([
        { $match: filters },
        { $count: "total" },
    ]);
    return ((_a = count[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
});
exports.countUsers = countUsers;
