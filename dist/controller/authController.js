"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const jwt = __importStar(require("jsonwebtoken"));
const bcrypt = __importStar(require("bcrypt"));
const userModel_1 = require("../models/userModel");
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const config_1 = __importDefault(require("../config/config"));
const router = express_1.default.Router();
// Login endpoint
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json(responseStatus_1.default.INVALID_ARGUMENT("Email and password are required"));
        }
        // Find user by email
        const user = yield userModel_1.User.findOne({ email });
        if (!user) {
            return res.status(401).json(responseStatus_1.default.UNAUTHENTICATED("Invalid email or password"));
        }
        // Check if user is active
        if (user.status !== "active") {
            return res.status(403).json(responseStatus_1.default.PERMISSION_DENIED("Account is not active"));
        }
        // Verify password
        const isPasswordValid = yield bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json(responseStatus_1.default.UNAUTHENTICATED("Invalid email or password"));
        }
        // Generate JWT token
        const token = jwt.sign({
            userId: user._id,
            email: user.email,
            roleId: user.roleId
        }, config_1.default.JWT_SECRET || "your-secret-key", {
            expiresIn: "7d" // Token expires in 7 days
        });
        // Return user data and token
        res.status(200).json(responseStatus_1.default.OK({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                roleId: user.roleId,
                phoneNo: user.phoneNo,
                address: user.address,
                status: user.status,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        }, "Login successful"));
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json(responseStatus_1.default.UNKNOWN("Login failed"));
    }
}));
// Logout endpoint (client-side token removal)
router.post("/logout", authMiddleware_1.authenticateToken, (req, res) => {
    // With JWT, logout is typically handled client-side by removing the token
    // Server-side logout would require token blacklisting (not implemented here)
    res.status(200).json(responseStatus_1.default.OK(null, "Logged out successfully"));
});
// Get current user profile
router.get("/me", authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // User data is already attached by authenticateToken middleware
        const user = yield userModel_1.User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json(responseStatus_1.default.NOT_FOUND("User not found"));
        }
        res.status(200).json(responseStatus_1.default.OK({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                roleId: user.roleId,
                phoneNo: user.phoneNo,
                address: user.address,
                status: user.status,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        }, "Profile retrieved successfully"));
    }
    catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json(responseStatus_1.default.UNKNOWN("Failed to get profile"));
    }
}));
// Register new user (optional - you might want to restrict this)
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, phoneNo, address, roleId } = req.body;
        // Validate required fields
        if (!name || !email || !password || !phoneNo || !address) {
            return res.status(400).json(responseStatus_1.default.INVALID_ARGUMENT("All fields are required"));
        }
        // Check if user already exists
        const existingUser = yield userModel_1.User.findOne({ email });
        if (existingUser) {
            return res.status(409).json(responseStatus_1.default.ALREADY_EXISTS("User with this email already exists"));
        }
        // Create new user
        const saltRounds = 10;
        const hashedPassword = yield bcrypt.hash(password, saltRounds);
        const newUser = yield userModel_1.User.create({
            name,
            email,
            password: hashedPassword,
            phoneNo,
            address,
            roleId: roleId || "developer", // Default role
            status: "active"
        });
        // Generate JWT token for immediate login
        const token = jwt.sign({
            userId: newUser._id,
            email: newUser.email,
            roleId: newUser.roleId
        }, config_1.default.JWT_SECRET || "your-secret-key", {
            expiresIn: "7d"
        });
        res.status(201).json(responseStatus_1.default.OK({
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                roleId: newUser.roleId,
                phoneNo: newUser.phoneNo,
                address: newUser.address,
                status: newUser.status,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt
            }
        }, "Registration successful"));
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json(responseStatus_1.default.UNKNOWN("Registration failed"));
    }
}));
// Refresh token endpoint (optional)
router.post("/refresh", authMiddleware_1.authenticateToken, (req, res) => {
    try {
        // Generate new token with same payload
        const token = jwt.sign({
            userId: req.user.id,
            email: req.user.email,
            roleId: req.user.roleId
        }, config_1.default.JWT_SECRET || "your-secret-key", {
            expiresIn: "7d"
        });
        res.status(200).json(responseStatus_1.default.OK({ token }, "Token refreshed successfully"));
    }
    catch (error) {
        console.error("Token refresh error:", error);
        res.status(500).json(responseStatus_1.default.UNKNOWN("Token refresh failed"));
    }
});
exports.default = router;
