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
const express_1 = __importDefault(require("express"));
const service_1 = require("../service/serverService/service");
const middleware_1 = require("../middleware");
const logic_1 = __importDefault(require("../service/vpnService/logic"));
const outline_helper_1 = require("../helper/outline_helper");
const router = express_1.default.Router();
// Create a new VPN key
router.post("/create", middleware_1.authenticateToken, middleware_1.requireOwnerAndDeveloper, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serverId, duration, dataLimitBytes, expiresAt, status } = req.body;
        // Construct payload with user data from req.user
        // Get server data
        const serverData = yield (0, service_1.getServerById)(serverId);
        if (serverData.code !== "200") {
            return res.status(400).json(serverData);
        }
        const OUTLINE_API = serverData.data.serverUrl;
        const serverObjectId = serverData.data._id || serverId;
        // Create access key on the Outline server before saving to DB
        let createdKey;
        try {
            createdKey = yield (0, outline_helper_1.createVpnKey)(String(req.user.id) || "", OUTLINE_API);
        }
        catch (err) {
            console.error("Failed to create outline access key:", err);
            return res.status(500).json({ error: "Failed to create access key on server" });
        }
        const payload = {
            userId: String(req.user.id),
            createdBy: String(req.user.id),
            createdByRole: String(req.user.roleId),
            serverId: String(serverObjectId),
            outlineKeyId: createdKey.id || createdKey.key || "",
            accessUrl: OUTLINE_API,
            duration,
            dataLimitBytes,
            expiresAt,
            status,
        };
        // Save to DB via logic; if DB save fails, delete the created access key
        const result = yield logic_1.default.createVpnKeyLogic(payload);
        if (!result || result.code !== "200") {
            try {
                if (payload.outlineKeyId) {
                    yield (0, outline_helper_1.deleteVpnKey)(payload.outlineKeyId, OUTLINE_API);
                }
            }
            catch (delErr) {
                console.error("Failed to delete outline key after DB failure:", delErr);
            }
        }
        return res.status(result && result.code === "200" ? 200 : 400).json(result);
    }
    catch (error) {
        console.error("Error creating VPN key:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Update a VPN key
router.put("/:vpnKeyId", middleware_1.authenticateToken, middleware_1.requireOwnerAndDeveloper, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vpnKeyId } = req.params;
        const userId = req.user.id;
        const { useName } = req.body;
        if (!useName) {
            return res.status(400).json({ error: "useName is required" });
        }
        // Ensure user is authorized and get vpn key info
        const vpnKeyResp = yield logic_1.default.getVpnKeyByIdLogic(vpnKeyId);
        if (vpnKeyResp.code !== "200")
            return res.status(404).json(vpnKeyResp);
        const vpnKey = vpnKeyResp.data;
        const createdBy = vpnKey.createdBy;
        const createdById = createdBy._id ? String(createdBy._id) : String(createdBy);
        if (createdById !== String(userId)) {
            return res.status(403).json({ error: "You can only update VPN keys you created" });
        }
        const outlineKeyId = vpnKey.outlineKeyId;
        const OUTLINE_API = vpnKey.accessUrl;
        try {
            const updated = yield (0, outline_helper_1.updateVpnKeyName)(outlineKeyId, useName, OUTLINE_API);
            return res.status(200).json({ code: "200", status: "OK", data: updated });
        }
        catch (err) {
            console.error("Failed to update outline key name:", err);
            return res.status(500).json({ error: "Failed to update access key name on server" });
        }
    }
    catch (error) {
        console.error("Error updating VPN key:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Delete a VPN key
router.delete("/:vpnKeyId", middleware_1.authenticateToken, middleware_1.requireOwnerAndDeveloper, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vpnKeyId } = req.params;
        const userId = req.user.id;
        const result = yield logic_1.default.deleteVpnKeyLogic(vpnKeyId, String(userId));
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Error deleting VPN key:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// List VPN keys with pagination
router.post("/", middleware_1.authenticateToken, middleware_1.requireOwnerAndDeveloper, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        console.log("req.body :", req.body);
        const { page = 1, limit = 10, sort_by = "createdAt", sort_order = "desc", serverId, status = "active",
        // createdByRole,  
         } = req.body;
        const userRole = req.user.roleId;
        const currentUserId = req.user.id;
        const filters = {};
        if (serverId)
            filters.serverId = serverId;
        if (status)
            filters.status = status;
        // if (createdByRole) filters.createdByRole = createdByRole;
        // Role-based filtering
        if (userRole === "owner") {
            // Owner can only see VPN keys they created
            filters.createdBy = currentUserId;
        }
        // Developer can see all VPN keys (no additional filter needed)
        console.log("User role:", userRole);
        console.log("Current user ID:", currentUserId);
        console.log("Applied filters:", filters);
        // If serverId provided, fetch real server keys and merge with DB keys
        if (serverId) {
            const serverData = yield (0, service_1.getServerById)(serverId);
            console.log("Server Data :", serverData);
            if (serverData.code !== "200") {
                return res.status(400).json(serverData);
            }
            const OUTLINE_API = serverData.data.serverUrl;
            let serverKeys = [];
            try {
                serverKeys = yield (0, outline_helper_1.listVpnKeys)(OUTLINE_API);
            }
            catch (err) {
                console.error("Failed to list outline keys:", err);
                // continue with DB result but include an error note
            }
            const dbResult = yield logic_1.default.getVpnKeysLogic(Number(page), Number(limit), sort_by, sort_order, filters);
            const dbVpnKeys = ((_a = dbResult.data) === null || _a === void 0 ? void 0 : _a.vpnKeys) || (dbResult === null || dbResult === void 0 ? void 0 : dbResult.vpnKeys) || [];
            // Create a map for quick lookup
            const dbMap = new Map(dbVpnKeys.map((k) => [String(k.outlineKeyId), k]));
            const serverMap = new Map(serverKeys.map((k) => [String(k.id || k.key), k]));
            // Merge: collect all unique outline key IDs from both sources
            const allOutlineIds = new Set([...dbMap.keys(), ...serverMap.keys()]);
            const mergedVpnKeys = Array.from(allOutlineIds).map((outlineId) => ({
                db: dbMap.get(outlineId) || null,
                server: serverMap.get(outlineId) || null,
            }));
            // Return with merged structure
            return res.status(200).json({
                code: "200",
                status: "OK",
                message: "No Error",
                data: {
                    // vpnKeys: mergedVpnKeys,
                    vpnKeys: serverKeys,
                    pagination: ((_b = dbResult.data) === null || _b === void 0 ? void 0 : _b.pagination) || (dbResult === null || dbResult === void 0 ? void 0 : dbResult.pagination) || {
                        currentPage: page,
                        limit,
                        rowsPerPage: 0,
                        total: 0,
                    },
                },
            });
        }
        // const result = await logic.getVpnKeysLogic(Number(page), Number(limit), sort_by as string, sort_order as string, filters);
        // return res.status(200).json(result);
    }
    catch (error) {
        console.error("Error fetching VPN keys:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Get VPN key by ID
router.get("/:vpnKeyId", middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Call vpnKeyId");
        const { vpnKeyId } = req.params;
        const userId = req.user.id;
        const vpnKeyData = yield logic_1.default.getVpnKeyByIdLogic(vpnKeyId);
        if (vpnKeyData.code !== "200") {
            return res.status(404).json(vpnKeyData);
        }
        if (!vpnKeyData.data || !vpnKeyData.data.createdBy) {
            return res.status(404).json({ error: "VPN key data or creator information not found" });
        }
        const createdBy = vpnKeyData.data.createdBy;
        const createdById = createdBy._id ? String(createdBy._id) : String(createdBy);
        if (createdById !== String(userId)) {
            return res.status(403).json({ error: "You can only view VPN keys you created" });
        }
        return res.status(200).json(vpnKeyData);
    }
    catch (error) {
        console.error("Error fetching VPN key:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Get VPN keys by user ID
router.get("/user/:userId", middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;
        // Only allow users to see VPN keys they created for any user
        const filters = { createdBy: currentUserId, userId };
        const result = yield logic_1.default.getVpnKeysLogic(1, 1000, "createdAt", "desc", filters);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Error fetching user VPN keys:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Revoke VPN key
// router.put("/:vpnKeyId/revoke", authenticateToken, requireAdmin, async (req, res) => {
//   try {
//     const { vpnKeyId } = req.params;
//     // Get VPN key data to get server info
//     const vpnKeyData: any = await theBroker.call("vpn.getById", { vpnKeyId });
//     if (vpnKeyData.code !== "200") {
//       return res.status(404).json(vpnKeyData);
//     }
//     // Check if VPN key data and serverId exist
//     if (!vpnKeyData.data || !vpnKeyData.data.serverId) {
//       return res.status(400).json({ error: "VPN key data or server information not found" });
//     }
//     // Get server data to determine the correct service call
//     const serverData = await getServerById(vpnKeyData.data.serverId);
//     if (serverData.code !== "200") {
//       return res.status(400).json(serverData);
//     }
//     const servicecall = serverData.data.servicecall;
//     const result = await theBroker.call(`${servicecall}.revoke`, { vpnKeyId });
//     res.status(200).json(result);
//   } catch (error) {
//     console.error("Error revoking VPN key:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
exports.default = router;
