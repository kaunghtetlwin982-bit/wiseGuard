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
const axios_1 = __importDefault(require("axios"));
const BASE_URL = "http://localhost:8004/api";
function testAuthEndpoints() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        try {
            console.log("Testing auth endpoints...");
            // Test login with non-existent user
            console.log("\n1. Testing login with non-existent user:");
            try {
                const loginResponse = yield axios_1.default.post(`${BASE_URL}/auth/login`, {
                    email: "test@example.com",
                    password: "password"
                });
                console.log("Login response:", loginResponse.data);
            }
            catch (error) {
                console.log("Login error (expected):", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            }
            // Test register endpoint
            console.log("\n2. Testing user registration:");
            try {
                const registerResponse = yield axios_1.default.post(`${BASE_URL}/auth/register`, {
                    name: "Test User",
                    email: "test@example.com",
                    password: "password123",
                    phoneNo: "1234567890",
                    address: "Test Address"
                });
                console.log("Register response:", registerResponse.data);
                // Extract token for further tests
                const token = (_b = registerResponse.data.data) === null || _b === void 0 ? void 0 : _b.token;
                if (token) {
                    console.log("\n3. Testing login with registered user:");
                    try {
                        const loginResponse = yield axios_1.default.post(`${BASE_URL}/auth/login`, {
                            email: "test@example.com",
                            password: "password123"
                        });
                        console.log("Login response:", loginResponse.data);
                    }
                    catch (error) {
                        console.log("Login error:", ((_c = error.response) === null || _c === void 0 ? void 0 : _c.data) || error.message);
                    }
                    console.log("\n4. Testing /me endpoint:");
                    try {
                        const meResponse = yield axios_1.default.get(`${BASE_URL}/auth/me`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        console.log("Me response:", meResponse.data);
                    }
                    catch (error) {
                        console.log("Me error:", ((_d = error.response) === null || _d === void 0 ? void 0 : _d.data) || error.message);
                    }
                    console.log("\n5. Testing logout:");
                    try {
                        const logoutResponse = yield axios_1.default.post(`${BASE_URL}/auth/logout`, {}, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        console.log("Logout response:", logoutResponse.data);
                    }
                    catch (error) {
                        console.log("Logout error:", ((_e = error.response) === null || _e === void 0 ? void 0 : _e.data) || error.message);
                    }
                }
            }
            catch (error) {
                console.log("Register error:", ((_f = error.response) === null || _f === void 0 ? void 0 : _f.data) || error.message);
            }
        }
        catch (error) {
            console.error("Test error:", error);
        }
    });
}
testAuthEndpoints();
