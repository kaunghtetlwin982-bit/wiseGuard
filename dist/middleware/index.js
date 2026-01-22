"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireOwner = exports.requireAdmin = exports.authenticateToken = void 0;
var authMiddleware_1 = require("./authMiddleware");
Object.defineProperty(exports, "authenticateToken", { enumerable: true, get: function () { return authMiddleware_1.authenticateToken; } });
var adminMiddleware_1 = require("./adminMiddleware");
Object.defineProperty(exports, "requireAdmin", { enumerable: true, get: function () { return adminMiddleware_1.requireAdmin; } });
Object.defineProperty(exports, "requireOwner", { enumerable: true, get: function () { return adminMiddleware_1.requireOwner; } });
Object.defineProperty(exports, "requireRole", { enumerable: true, get: function () { return adminMiddleware_1.requireRole; } });
