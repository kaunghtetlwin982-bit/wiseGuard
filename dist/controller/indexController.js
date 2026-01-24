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
const userController_1 = __importDefault(require("./userController"));
const authController_1 = __importDefault(require("./authController"));
const vpnConroller_1 = __importDefault(require("./vpnConroller"));
const serverController_1 = __importDefault(require("./serverController"));
const outline_helper_1 = require("../helper/outline_helper");
const router = express_1.default.Router();
// Mount auth routes
router.use("/auth", authController_1.default);
// Mount user routes
router.use("/users", userController_1.default);
// Mount VPN routes
router.use("/vpn", vpnConroller_1.default);
// Mount server routes
router.use("/servers", serverController_1.default);
router.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const result = yield (0, outline_helper_1.createVpnKey)(name);
        res.json(result);
    }
    catch (error) {
        res.json(error);
    }
}));
exports.default = router;
