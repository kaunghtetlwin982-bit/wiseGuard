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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logic_1 = __importDefault(require("./logic"));
const mongoose_1 = __importDefault(require("mongoose"));
// Moleculer service schema for VPN
const vpnService = {
    name: "vpn",
    actions: {
        // Create a new VPN key
        create: {
            params: {
                userId: "string",
                createdBy: "string",
                createdByRole: { type: "string", enum: ["developer", "owner", "agent"] },
                serverId: "string",
                outlineKeyId: "string",
                accessUrl: "string",
                duration: { type: "string", enum: ["oneMonth", "twoMonth", "threeMonth"] },
                dataLimitBytes: { type: "number", optional: true },
                expiresAt: { type: "string", optional: true },
                status: { type: "string", enum: ["active", "expired", "revoked"], optional: true },
            },
            handler(ctx) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log("Calling vpn.create");
                    console.log("Params:", ctx.params);
                    const params = ctx.params;
                    // Convert string IDs to ObjectIds
                    const convertedParams = Object.assign(Object.assign({}, params), { userId: new mongoose_1.default.Types.ObjectId(params.userId), createdBy: new mongoose_1.default.Types.ObjectId(params.createdBy), serverId: new mongoose_1.default.Types.ObjectId(params.serverId), expiresAt: params.expiresAt ? new Date(params.expiresAt) : undefined });
                    return yield logic_1.default.createVpnKeyLogic(convertedParams);
                });
            },
        },
        // Update an existing VPN key
        update: {
            params: {
                vpnKeyId: "string",
                currentUserId: "string",
                userId: { type: "string", optional: true },
                createdBy: { type: "string", optional: true },
                createdByRole: { type: "string", enum: ["developer", "owner", "agent"], optional: true },
                serverId: { type: "string", optional: true },
                outlineKeyId: { type: "string", optional: true },
                accessUrl: { type: "string", optional: true },
                duration: { type: "string", enum: ["oneMonth", "twoMonth", "threeMonth"], optional: true },
                dataLimitBytes: { type: "number", optional: true },
                expiresAt: { type: "string", optional: true },
                status: { type: "string", enum: ["active", "expired", "revoked"], optional: true },
            },
            handler(ctx) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log("Calling vpn.update");
                    console.log("Params:", ctx.params);
                    const params = ctx.params;
                    const { vpnKeyId, currentUserId } = params, updateData = __rest(params, ["vpnKeyId", "currentUserId"]);
                    // Convert string IDs to ObjectIds in update data
                    const convertedUpdateData = Object.assign({}, updateData);
                    if (convertedUpdateData.userId) {
                        convertedUpdateData.userId = new mongoose_1.default.Types.ObjectId(convertedUpdateData.userId);
                    }
                    if (convertedUpdateData.createdBy) {
                        convertedUpdateData.createdBy = new mongoose_1.default.Types.ObjectId(convertedUpdateData.createdBy);
                    }
                    if (convertedUpdateData.serverId) {
                        convertedUpdateData.serverId = new mongoose_1.default.Types.ObjectId(convertedUpdateData.serverId);
                    }
                    if (convertedUpdateData.expiresAt) {
                        convertedUpdateData.expiresAt = new Date(convertedUpdateData.expiresAt);
                    }
                    return yield logic_1.default.updateVpnKeyLogic(vpnKeyId, currentUserId, convertedUpdateData);
                });
            },
        },
        // Delete a VPN key
        delete: {
            params: {
                vpnKeyId: "string",
                currentUserId: "string",
            },
            handler(ctx) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log("Calling vpn.delete");
                    console.log("Params:", ctx.params);
                    const params = ctx.params;
                    const { vpnKeyId, currentUserId } = params;
                    return yield logic_1.default.deleteVpnKeyLogic(vpnKeyId, currentUserId);
                });
            },
        },
        // List VPN keys with pagination
        list: {
            params: {
                currentPage: "number",
                limit: "number",
                sort_by: { type: "string", optional: true },
                sort_order: { type: "string", optional: true, enum: ["asc", "desc"] },
                filters: { type: "object", optional: true },
            },
            handler(ctx) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log("Calling vpn.list");
                    console.log("Params:", ctx.params);
                    const params = ctx.params;
                    const { currentPage, limit, sort_by = "createdAt", sort_order = "desc", filters = {}, } = params;
                    const sortOrder = sort_order === "desc" ? -1 : 1;
                    const parsedFilters = logic_1.default.parseVpnFilters(filters);
                    return yield logic_1.default.getVpnKeysLogic(currentPage, limit, sort_by, sortOrder, parsedFilters);
                });
            },
        },
        // Get VPN key by ID
        getById: {
            params: {
                vpnKeyId: "string",
            },
            handler(ctx) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log("Calling vpn.getById");
                    console.log("Params:", ctx.params);
                    const params = ctx.params;
                    const { vpnKeyId } = params;
                    return yield logic_1.default.getVpnKeyByIdLogic(vpnKeyId);
                });
            },
        },
        // Get VPN keys by user ID
        getByUserId: {
            params: {
                userId: "string",
            },
            handler(ctx) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log("Calling vpn.getByUserId");
                    console.log("Params:", ctx.params);
                    const params = ctx.params;
                    const { userId } = params;
                    return yield logic_1.default.getVpnKeysByUserIdLogic(userId);
                });
            },
        },
        // Revoke VPN key
        revoke: {
            params: {
                vpnKeyId: "string",
            },
            handler(ctx) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log("Calling vpn.revoke");
                    console.log("Params:", ctx.params);
                    const params = ctx.params;
                    const { vpnKeyId } = params;
                    return yield logic_1.default.revokeVpnKeyLogic(vpnKeyId);
                });
            },
        },
    },
};
exports.default = vpnService;
