"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireOwnerAndDeveloper = exports.requireOwner = exports.requireAdmin = void 0;
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const requireAdmin = (req, res, next) => {
    try {
        // Check if user is authenticated (should be set by authenticateToken middleware)
        if (!req.user) {
            res.status(401).json(responseStatus_1.default.UNAUTHENTICATED("Authentication required"));
            return;
        }
        // Check if user has admin/owner role
        const allowedRoles = ["developer"]; // Adjust based on your role system
        if (!allowedRoles.includes(req.user.roleId)) {
            res.status(403).json(responseStatus_1.default.PERMISSION_DENIED("Admin access required"));
            return;
        }
        next();
    }
    catch (error) {
        console.error("Admin authorization error:", error);
        res.status(500).json(responseStatus_1.default.UNKNOWN("Authorization failed"));
    }
};
exports.requireAdmin = requireAdmin;
const requireOwner = (req, res, next) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            res.status(401).json(responseStatus_1.default.UNAUTHENTICATED("Authentication required"));
            return;
        }
        console.log("userData : ", req.user);
        // Check if user has owner role specifically
        if (req.user.roleId !== "owner") {
            res.status(403).json(responseStatus_1.default.PERMISSION_DENIED("Owner access required"));
            return;
        }
        next();
    }
    catch (error) {
        console.error("Owner authorization error:", error);
        res.status(500).json(responseStatus_1.default.UNKNOWN("Authorization failed"));
    }
};
exports.requireOwner = requireOwner;
const requireOwnerAndDeveloper = (req, res, next) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            res.status(401).json(responseStatus_1.default.UNAUTHENTICATED("Authentication required"));
            return;
        }
        console.log("userData : ", req.user);
        // Check if user has owner role specifically
        if (req.user.roleId === "agent") {
            res.status(403).json(responseStatus_1.default.PERMISSION_DENIED("Owner and Develoepr access required"));
            return;
        }
        next();
    }
    catch (error) {
        console.error("Owner authorization error:", error);
        res.status(500).json(responseStatus_1.default.UNKNOWN("Authorization failed"));
    }
};
exports.requireOwnerAndDeveloper = requireOwnerAndDeveloper;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            // Check if user is authenticated
            if (!req.user) {
                res.status(401).json(responseStatus_1.default.UNAUTHENTICATED("Authentication required"));
                return;
            }
            // Check if user has one of the allowed roles
            if (!allowedRoles.includes(req.user.roleId)) {
                res.status(403).json(responseStatus_1.default.PERMISSION_DENIED(`One of the following roles required: ${allowedRoles.join(", ")}`));
                return;
            }
            next();
        }
        catch (error) {
            console.error("Role authorization error:", error);
            res.status(500).json(responseStatus_1.default.UNKNOWN("Authorization failed"));
        }
    };
};
exports.requireRole = requireRole;
