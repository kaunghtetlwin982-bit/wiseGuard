"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const generateQr_1 = __importDefault(require("./generateQr"));
const router = express_1.default.Router();
router.use("/", generateQr_1.default);
exports.default = router;
