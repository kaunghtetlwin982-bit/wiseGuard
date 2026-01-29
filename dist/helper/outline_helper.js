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
exports.createVpnKey = createVpnKey;
exports.listVpnKeys = listVpnKeys;
exports.deleteVpnKey = deleteVpnKey;
exports.updateVpnKeyName = updateVpnKeyName;
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const agent = new https_1.default.Agent({
    rejectUnauthorized: false, // trust self-signed cert
});
// const OUTLINE_API="https://150.95.82.134:60248/Jk2U7DyIeIYR-dN6jTYolA"
function createVpnKey(name, OUTLINE_API) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield axios_1.default.post(`${OUTLINE_API}/access-keys`, {}, { httpsAgent: agent });
        console.log("Data : ", data);
        // if (name) {
        //   await axios.put(
        //     `${OUTLINE_API}/access-keys/${data.id}/name`,
        //     { name },
        //     { httpsAgent: agent }
        //   );
        // }
        return data;
    });
}
function listVpnKeys(OUTLINE_API) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield axios_1.default.get(`${OUTLINE_API}/access-keys`, { httpsAgent: agent });
        return data.accessKeys;
    });
}
function deleteVpnKey(keyId, OUTLINE_API) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield axios_1.default.delete(`${OUTLINE_API}/access-keys/${keyId}`, { httpsAgent: agent });
        return data;
    });
}
function updateVpnKeyName(keyId, name, OUTLINE_API) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield axios_1.default.put(`${OUTLINE_API}/access-keys/${keyId}/name`, { name }, { httpsAgent: agent });
        return data;
    });
}
