"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = __importDefault(require("./userController"));
const authController_1 = __importDefault(require("./authController"));
const vpnConroller_1 = __importDefault(require("./vpnConroller"));
const serverController_1 = __importDefault(require("./serverController"));
const router = express_1.default.Router();
// Mount auth routes
router.use("/auth", authController_1.default);
// Mount user routes
router.use("/users", userController_1.default);
// Mount VPN routes
router.use("/vpn", vpnConroller_1.default);
// Mount server routes
router.use("/servers", serverController_1.default);
exports.default = router;
