import logic from "./logic";

export const createVpnKey = async (payload: any) => {
  return logic.createVpnKeyLogic(payload);
};

export const updateVpnKey = async (vpnKeyId: string, payload: any) => {
  return logic.updateVpnKeyLogic(vpnKeyId, payload);
};

export const deleteVpnKey = async (vpnKeyId: string) => {
  return logic.deleteVpnKeyLogic(vpnKeyId);
};

export const getVpnKeys = async (
  currentPage: number,
  limit: number,
  sort_by?: string,
  sort_order?: string | 1 | -1,
  filters?: any
) => {
  const parsedFilters = logic.parseVpnFilters(filters);
  return logic.getVpnKeysLogic(currentPage, limit, sort_by, sort_order, parsedFilters);
};

export const getVpnKeyById = async (vpnKeyId: string) => {
  return logic.getVpnKeyByIdLogic(vpnKeyId);
};

export const getVpnKeysByUserId = async (userId: string) => {
  return logic.getVpnKeysByUserIdLogic(userId);
};

export const revokeVpnKey = async (vpnKeyId: string) => {
  return logic.revokeVpnKeyLogic(vpnKeyId);
};
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
