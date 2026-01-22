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
const service_1 = require("../service/vpnService/service");
const middleware_1 = require("../middleware");
const router = express_1.default.Router();
// Create a new VPN key
router.post("/create", middleware_1.authenticateToken, middleware_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, service_1.createVpnKey)(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error creating VPN key:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Update a VPN key
router.put("/:vpnKeyId", middleware_1.authenticateToken, middleware_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vpnKeyId } = req.params;
        const result = yield (0, service_1.updateVpnKey)(vpnKeyId, req.body);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error updating VPN key:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Delete a VPN key
router.delete("/:vpnKeyId", middleware_1.authenticateToken, middleware_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vpnKeyId } = req.params;
        const result = yield (0, service_1.deleteVpnKey)(vpnKeyId);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error deleting VPN key:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// List VPN keys with pagination
router.get("/", middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, sort_by = "createdAt", sort_order = "desc", userId, serverId, status, createdByRole, } = req.query;
        const filters = {};
        if (userId)
            filters.userId = userId;
        if (serverId)
            filters.serverId = serverId;
        if (status)
            filters.status = status;
        if (createdByRole)
            filters.createdByRole = createdByRole;
        const result = yield (0, service_1.getVpnKeys)(Number(page), Number(limit), sort_by, sort_order, filters);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error fetching VPN keys:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Get VPN key by ID
router.get("/:vpnKeyId", middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vpnKeyId } = req.params;
        const result = yield (0, service_1.getVpnKeyById)(vpnKeyId);
        res.status(200).json(result);
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
        const result = yield (0, service_1.getVpnKeysByUserId)(userId);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error fetching user VPN keys:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Revoke VPN key
router.put("/:vpnKeyId/revoke", middleware_1.authenticateToken, middleware_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vpnKeyId } = req.params;
        const result = yield (0, service_1.revokeVpnKey)(vpnKeyId);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error revoking VPN key:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
exports.default = router;
