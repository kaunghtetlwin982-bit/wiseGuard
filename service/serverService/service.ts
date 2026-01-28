import logic from "./logic";
import broker from "../../broker/broker";

export const createServer = async (payload: any) => {
  return logic.createServerLogic(payload);
};

export const updateServer = async (serverId: string, payload: any) => {
  return logic.updateServerLogic(serverId, payload);
};

export const deleteServer = async (serverId: string) => {
  return logic.deleteServerLogic(serverId);
};

export const getServers = async (
  currentPage: number,
  limit: number,
  sort_by?: string,
  sort_order?: string | 1 | -1,
  filters?: any
) => {
  return logic.getServersLogic(currentPage, limit, sort_by, sort_order, filters);
};

export const getServerById = async (serverId: string) => {
  
  return logic.getServerByIdLogic(serverId);
};

export const getServersByUserId = async (userId: string) => {
  return logic.getServersByUserIdLogic(userId);
};

// Service call functionality
export const callServerService = async (serverId: string, action: string, payload: any) => {
  try {
    // Get server data first
    const serverData = await getServerById(serverId);
    if (serverData.code !== "200") {
      return serverData;
    }

    const servicecall = serverData.data.servicecall;

    // Make service call using broker
    const serviceResult = await broker.call(`${servicecall}.${action}`, payload);
    return {
      code: "200",
      status: "OK",
      message: `Service call ${servicecall}.${action} successful`,
      data: serviceResult
    };
  } catch (error) {
    console.error(`Error calling service for server ${serverId}, action ${action}:`, error);
    return {
      code: "500",
      status: "INTERNAL_SERVER_ERROR",
      message: `Failed to call service for server ${serverId}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const createVpnKeyOnServer = async (serverId: string, payload: any) => {
  return callServerService(serverId, "createVpnKey", payload);
};

export const deleteVpnKeyOnServer = async (serverId: string, payload: any) => {
  return callServerService(serverId, "deleteVpnKey", payload);
};

export const updateVpnKeyOnServer = async (serverId: string, payload: any) => {
  return callServerService(serverId, "updateVpnKey", payload);
};