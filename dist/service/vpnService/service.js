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
exports.revokeVpnKey = exports.getVpnKeysByUserId = exports.getVpnKeyById = exports.getVpnKeys = exports.deleteVpnKey = exports.updateVpnKey = exports.createVpnKey = void 0;
const logic_1 = __importDefault(require("./logic"));
const createVpnKey = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return logic_1.default.createVpnKeyLogic(payload);
});
exports.createVpnKey = createVpnKey;
const updateVpnKey = (vpnKeyId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return logic_1.default.updateVpnKeyLogic(vpnKeyId, payload);
});
exports.updateVpnKey = updateVpnKey;
const deleteVpnKey = (vpnKeyId) => __awaiter(void 0, void 0, void 0, function* () {
    return logic_1.default.deleteVpnKeyLogic(vpnKeyId);
});
exports.deleteVpnKey = deleteVpnKey;
const getVpnKeys = (currentPage, limit, sort_by, sort_order, filters) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedFilters = logic_1.default.parseVpnFilters(filters);
    return logic_1.default.getVpnKeysLogic(currentPage, limit, sort_by, sort_order, parsedFilters);
});
exports.getVpnKeys = getVpnKeys;
const getVpnKeyById = (vpnKeyId) => __awaiter(void 0, void 0, void 0, function* () {
    return logic_1.default.getVpnKeyByIdLogic(vpnKeyId);
});
exports.getVpnKeyById = getVpnKeyById;
const getVpnKeysByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return logic_1.default.getVpnKeysByUserIdLogic(userId);
});
exports.getVpnKeysByUserId = getVpnKeysByUserId;
const revokeVpnKey = (vpnKeyId) => __awaiter(void 0, void 0, void 0, function* () {
    return logic_1.default.revokeVpnKeyLogic(vpnKeyId);
});
exports.revokeVpnKey = revokeVpnKey;
//     //     studentId: "string",
//     //   },
//     //   async handler(ctx: Moleculer.Context<createType>) {
//     //     console.log("Cal rating.create");
//     //     console.log("Params :", ctx.params);
//     //     const { batchId, rating, feedback, studentId } = ctx.params;
//     //     return await logic.createRating(batchId, rating, feedback, studentId);
//     //   },
//     // },
//   },
// };
// export default ratingService;
