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
exports.updateVpnKeyOnServer = exports.deleteVpnKeyOnServer = exports.createVpnKeyOnServer = exports.callServerService = exports.getServersByUserId = exports.getServerById = exports.getServers = exports.deleteServer = exports.updateServer = exports.createServer = void 0;
const logic_1 = __importDefault(require("./logic"));
const broker_1 = __importDefault(require("../../broker/broker"));
const createServer = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return logic_1.default.createServerLogic(payload);
});
exports.createServer = createServer;
const updateServer = (serverId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return logic_1.default.updateServerLogic(serverId, payload);
});
exports.updateServer = updateServer;
const deleteServer = (serverId) => __awaiter(void 0, void 0, void 0, function* () {
    return logic_1.default.deleteServerLogic(serverId);
});
exports.deleteServer = deleteServer;
const getServers = (currentPage, limit, sort_by, sort_order, filters) => __awaiter(void 0, void 0, void 0, function* () {
    return logic_1.default.getServersLogic(currentPage, limit, sort_by, sort_order, filters);
});
exports.getServers = getServers;
const getServerById = (serverId) => __awaiter(void 0, void 0, void 0, function* () {
    return logic_1.default.getServerByIdLogic(serverId);
});
exports.getServerById = getServerById;
const getServersByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return logic_1.default.getServersByUserIdLogic(userId);
});
exports.getServersByUserId = getServersByUserId;
// Service call functionality
const callServerService = (serverId, action, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get server data first
        const serverData = yield (0, exports.getServerById)(serverId);
        if (serverData.code !== "200") {
            return serverData;
        }
        const servicecall = serverData.data.servicecall;
        // Make service call using broker
        const serviceResult = yield broker_1.default.call(`${servicecall}.${action}`, payload);
        return {
            code: "200",
            status: "OK",
            message: `Service call ${servicecall}.${action} successful`,
            data: serviceResult
        };
    }
    catch (error) {
        console.error(`Error calling service for server ${serverId}, action ${action}:`, error);
        return {
            code: "500",
            status: "INTERNAL_SERVER_ERROR",
            message: `Failed to call service for server ${serverId}`,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
});
exports.callServerService = callServerService;
const createVpnKeyOnServer = (serverId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.callServerService)(serverId, "createVpnKey", payload);
});
exports.createVpnKeyOnServer = createVpnKeyOnServer;
const deleteVpnKeyOnServer = (serverId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.callServerService)(serverId, "deleteVpnKey", payload);
});
exports.deleteVpnKeyOnServer = deleteVpnKeyOnServer;
const updateVpnKeyOnServer = (serverId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.callServerService)(serverId, "updateVpnKey", payload);
});
exports.updateVpnKeyOnServer = updateVpnKeyOnServer;
