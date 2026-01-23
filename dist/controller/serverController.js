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
const router = express_1.default.Router();
// Create a new server
router.post("/create", middleware_1.authenticateToken, middleware_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = Object.assign(Object.assign({}, req.body), { createdBy: req.user.id // Assuming req.user is set by authenticateToken middleware
         });
        const result = yield (0, service_1.createServer)(payload);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error creating server:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Update a server
router.put("/:serverId", middleware_1.authenticateToken, middleware_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serverId } = req.params;
        const result = yield (0, service_1.updateServer)(serverId, req.body);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error updating server:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Delete a server
router.delete("/:serverId", middleware_1.authenticateToken, middleware_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serverId } = req.params;
        const result = yield (0, service_1.deleteServer)(serverId);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error deleting server:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Get server by ID
router.get("/:serverId", middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serverId } = req.params;
        const result = yield (0, service_1.getServerById)(serverId);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error fetching server:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// List servers with pagination and filters
router.get("/", middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, sort_by = "createdAt", sort_order = "desc", name, ip, servicecall, location, provider, status, createdBy, startDate, endDate } = req.query;
        const filters = {};
        if (name)
            filters.name = name;
        if (ip)
            filters.ip = ip;
        if (servicecall)
            filters.servicecall = servicecall;
        if (location)
            filters.location = location;
        if (provider)
            filters.provider = provider;
        if (status)
            filters.status = status;
        if (createdBy)
            filters.createdBy = createdBy;
        if (startDate)
            filters.startDate = startDate;
        if (endDate)
            filters.endDate = endDate;
        const result = yield (0, service_1.getServers)(parseInt(page), parseInt(limit), sort_by, sort_order, filters);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error fetching servers:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Get servers by user ID
router.get("/user/:userId", middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const result = yield (0, service_1.getServersByUserId)(userId);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error fetching servers by user ID:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
exports.default = router;
