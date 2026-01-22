"use strict";
// userModel.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNo: { type: String, required: true },
    address: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    roleId: {
        type: String,
        enum: ["developer", "owner", "agent"],
        required: true,
    },
}, { timestamps: true });
exports.User = mongoose_1.default.model("user", userSchema);
