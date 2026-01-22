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
const express_1 = __importDefault(require("express"));
// import ServiceBroker from "../broker/broker";
const logic_1 = __importDefault(require("../service/userSevice/logic"));
const router = express_1.default.Router();
// Create a new user
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield logic_1.default.createUserLogic(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Update a user
router.put("/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const result = yield logic_1.default.updateUserLogic(userId, req.body);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Delete a user
router.delete("/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const result = yield logic_1.default.deleteUserLogic(userId);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// List users with pagination
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.query, { page = 1, limit = 10, sort_by = "createdAt", sort_order = "desc" } = _a, filters = __rest(_a, ["page", "limit", "sort_by", "sort_order"]);
        const sortOrder = sort_order === "desc" ? -1 : 1;
        const result = yield logic_1.default.getUsersLogic(parseInt(page), parseInt(limit), sort_by, sortOrder, filters);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Get a single user by ID
router.get("/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const result = yield logic_1.default.getUsersLogic(1, 1, "createdAt", -1, { _id: userId });
        if (result.data && result.data.users && result.data.users.length > 0) {
            res.status(200).json(result.data.users[0]);
        }
        else {
            res.status(404).json({ error: "User not found" });
        }
    }
    catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
exports.default = router;
