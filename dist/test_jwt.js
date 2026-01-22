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
function testJWT() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            console.log("🔄 Testing JWT authentication...");
            // Step 1: Register a user
            console.log("\n1️⃣ Registering user...");
            const registerResponse = yield axios_1.default.post(`${BASE_URL}/auth/register`, {
                name: "Test User",
                email: "test@example.com",
                password: "password123",
                phoneNo: "1234567890",
                address: "Test Address"
            });
            console.log("✅ Registration successful");
            const token = registerResponse.data.data.token;
            console.log("🔑 Token received:", token.substring(0, 50) + "...");
            // Step 2: Test login with the same credentials
            console.log("\n2️⃣ Testing login...");
            const loginResponse = yield axios_1.default.post(`${BASE_URL}/auth/login`, {
                email: "test@example.com",
                password: "password123"
            });
            console.log("✅ Login successful");
            const loginToken = loginResponse.data.data.token;
            console.log("🔑 Login token:", loginToken.substring(0, 50) + "...");
            // Step 3: Test protected endpoint with token
            console.log("\n3️⃣ Testing protected endpoint (/me)...");
            const meResponse = yield axios_1.default.get(`${BASE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${loginToken}` }
            });
            console.log("✅ Protected endpoint successful:", meResponse.data);
            // Step 4: Test with invalid token
            console.log("\n4️⃣ Testing with invalid token...");
            try {
                yield axios_1.default.get(`${BASE_URL}/auth/me`, {
                    headers: { Authorization: `Bearer invalidtoken` }
                });
            }
            catch (error) {
                console.log("✅ Invalid token correctly rejected:", ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || error.message);
            }
        }
        catch (error) {
            console.error("❌ Test failed:");
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Data:", error.response.data);
            }
            else if (error.request) {
                console.error("No response received:", error.request);
            }
            else {
                console.error("Error:", error.message);
            }
        }
    });
}
testJWT();
