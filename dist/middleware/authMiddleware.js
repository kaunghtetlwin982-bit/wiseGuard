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
exports.authenticateToken = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const userModel_1 = require("../models/userModel");
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const config_1 = __importDefault(require("../config/config"));
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
        if (!token) {
            res.status(401).json(responseStatus_1.default.UNAUTHENTICATED("Access token is required"));
            return;
        }
        console.log('token : ', token);
        console.log("config.JWT_SECRET : ", config_1.default.JWT_SECRET);
        // Verify JWT token
        const decoded = jwt.verify(token, config_1.default.JWT_SECRET || "your-secret-key");
        console.log("decoded : ", decoded);
        // Check if user exists and is active
        const user = yield userModel_1.User.findById(decoded.userId);
        console.log("user : ", user);
        if (!user) {
            res.status(401).json(responseStatus_1.default.UNAUTHENTICATED("User not found"));
            return;
        }
        if (user.status !== "active") {
            res.status(403).json(responseStatus_1.default.PERMISSION_DENIED("Account is not active"));
            return;
        }
        // Attach user to request object
        req.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            roleId: user.roleId,
        };
        next();
    }
    catch (error) {
        console.error("Authentication error:", error);
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json(responseStatus_1.default.UNAUTHENTICATED("Invalid token"));
            return;
        }
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json(responseStatus_1.default.UNAUTHENTICATED("Token expired"));
            return;
        }
        res.status(500).json(responseStatus_1.default.UNKNOWN("Authentication failed"));
    }
});
exports.authenticateToken = authenticateToken;
