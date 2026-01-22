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
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config/config"));
const uri = config_1.default.mongoUri; // your MongoDB Atlas URI
const connectToDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("Mongo URI:", uri);
    if (!uri) {
        throw new Error("MONGO_URI is not defined in environment variables!");
    }
    try {
        const connection = yield mongoose_1.default.connect(uri, {
            dbName: config_1.default.mongoDBName,
        });
        // console.log("Connected to MongoDB via Mongoose",connection);
    }
    catch (error) {
        console.error(" MongoDB connection error:", error);
        throw error;
    }
});
exports.default = connectToDatabase;
