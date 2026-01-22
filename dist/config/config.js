"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
console.log("Loading configuration from environment variables...", {
    redis: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
        password: process.env.REDIS_PASSWORD,
    },
});
// Validate and parse environment variables
const config = {
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
    mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/blog",
    mongoDBName: process.env.mongoDBName || "vpn",
    redis: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
        password: process.env.REDIS_PASSWORD,
    },
};
exports.default = config;
