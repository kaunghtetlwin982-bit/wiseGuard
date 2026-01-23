import logic from "./logic";
import * as Moleculer from "moleculer";
import mongoose from "mongoose";



// Moleculer service schema for VPN
const vpnService: Moleculer.ServiceSchema = {
  name: "vpn",
  actions: {
    // Create a new VPN key
    create: {
      params: {
        userId: "string",
        createdBy: "string",
        createdByRole: { type: "string", enum: ["developer", "owner", "agent"] },
        serverId: "string",
        outlineKeyId: "string",
        accessUrl: "string",
        duration: { type: "string", enum: ["oneMonth", "twoMonth", "threeMonth"] },
        dataLimitBytes: { type: "number", optional: true },
        expiresAt: { type: "string", optional: true },
        status: { type: "string", enum: ["active", "expired", "revoked"], optional: true },
      },
      async handler(ctx: Moleculer.Context) {
        console.log("Calling vpn.create");
        console.log("Params:", ctx.params);
        const params = ctx.params as {
          userId: string;
          createdBy: string;
          createdByRole: "owner" | "agent" | "developer";
          serverId: string;
          outlineKeyId: string;
          accessUrl: string;
          duration: "oneMonth" | "twoMonth" | "threeMonth";
          dataLimitBytes?: number;
          expiresAt?: string;
          status?: "active" | "expired" | "revoked";
        };
        
        // Convert string IDs to ObjectIds
        const convertedParams = {
          ...params,
          userId: new mongoose.Types.ObjectId(params.userId),
          createdBy: new mongoose.Types.ObjectId(params.createdBy),
          serverId: new mongoose.Types.ObjectId(params.serverId),
          expiresAt: params.expiresAt ? new Date(params.expiresAt) : undefined,
        };
        
        return await logic.createVpnKeyLogic(convertedParams);
      },
    },

    // Update an existing VPN key
    update: {
      params: {
        vpnKeyId: "string",
        currentUserId: "string",
        userId: { type: "string", optional: true },
        createdBy: { type: "string", optional: true },
        createdByRole: { type: "string", enum: ["developer", "owner", "agent"], optional: true },
        serverId: { type: "string", optional: true },
        outlineKeyId: { type: "string", optional: true },
        accessUrl: { type: "string", optional: true },
        duration: { type: "string", enum: ["oneMonth", "twoMonth", "threeMonth"], optional: true },
        dataLimitBytes: { type: "number", optional: true },
        expiresAt: { type: "string", optional: true },
        status: { type: "string", enum: ["active", "expired", "revoked"], optional: true },
      },
      async handler(ctx: Moleculer.Context) {
        console.log("Calling vpn.update");
        console.log("Params:", ctx.params);
        const params = ctx.params as {
          vpnKeyId: string;
          currentUserId: string;
          userId?: string;
          createdBy?: string;
          createdByRole?: "owner" | "agent" | "developer";
          serverId?: string;
          outlineKeyId?: string;
          accessUrl?: string;
          duration?: "oneMonth" | "twoMonth" | "threeMonth";
          dataLimitBytes?: number;
          expiresAt?: string;
          status?: "active" | "expired" | "revoked";
        };
        
        const { vpnKeyId, currentUserId, ...updateData } = params;
        
        // Convert string IDs to ObjectIds in update data
        const convertedUpdateData: any = { ...updateData };
        if (convertedUpdateData.userId) {
          convertedUpdateData.userId = new mongoose.Types.ObjectId(convertedUpdateData.userId);
        }
        if (convertedUpdateData.createdBy) {
          convertedUpdateData.createdBy = new mongoose.Types.ObjectId(convertedUpdateData.createdBy);
        }
        if (convertedUpdateData.serverId) {
          convertedUpdateData.serverId = new mongoose.Types.ObjectId(convertedUpdateData.serverId);
        }
        if (convertedUpdateData.expiresAt) {
          convertedUpdateData.expiresAt = new Date(convertedUpdateData.expiresAt);
        }
        
        return await logic.updateVpnKeyLogic(vpnKeyId, currentUserId, convertedUpdateData);
      },
    },

    // Delete a VPN key
    delete: {
      params: {
        vpnKeyId: "string",
        currentUserId: "string",
      },
      async handler(ctx: Moleculer.Context) {
        console.log("Calling vpn.delete");
        console.log("Params:", ctx.params);
        const params = ctx.params as { vpnKeyId: string; currentUserId: string };
        const { vpnKeyId, currentUserId } = params;
        console.log("120 Data : ",{vpnKeyId, currentUserId })
        return await logic.deleteVpnKeyLogic(vpnKeyId, currentUserId);
      },
    },

    // List VPN keys with pagination
    list: {
      params: {
        currentPage: "number",
        limit: "number",
        sort_by: { type: "string", optional: true },
        sort_order: { type: "string", optional: true, enum: ["asc", "desc"] },
        filters: { type: "object", optional: true },
      },
      async handler(ctx: Moleculer.Context) {
        console.log("Calling vpn.list");
        console.log("Params:", ctx.params);
        const params = ctx.params as {
          currentPage: number;
          limit: number;
          sort_by?: string;
          sort_order?: string;
          filters?: any;
        };
        const {
          currentPage,
          limit,
          sort_by = "createdAt",
          sort_order = "desc",
          filters = {},
        } = params;

        const sortOrder = sort_order === "desc" ? -1 : 1;
        const parsedFilters = logic.parseVpnFilters(filters);

        return await logic.getVpnKeysLogic(
          currentPage,
          limit,
          sort_by,
          sortOrder,
          parsedFilters
        );
      },
    },

    // Get VPN key by ID
    getById: {
      params: {
        vpnKeyId: "string",
      },
      async handler(ctx: Moleculer.Context) {
        console.log("Calling vpn.getById");
        console.log("Params:", ctx.params);
        const params = ctx.params as { vpnKeyId: string };
        const { vpnKeyId } = params;
        return await logic.getVpnKeyByIdLogic(vpnKeyId);
      },
    },

    // Get VPN keys by user ID
    getByUserId: {
      params: {
        userId: "string",
      },
      async handler(ctx: Moleculer.Context) {
        console.log("Calling vpn.getByUserId");
        console.log("Params:", ctx.params);
        const params = ctx.params as { userId: string };
        const { userId } = params;
        return await logic.getVpnKeysByUserIdLogic(userId);
      },
    },

    // Revoke VPN key
    // revoke: {
    //   params: {
    //     vpnKeyId: "string",
    //   },
    //   async handler(ctx: Moleculer.Context) {
    //     console.log("Calling vpn.revoke");
    //     console.log("Params:", ctx.params);
    //     const params = ctx.params as { vpnKeyId: string };
    //     const { vpnKeyId } = params;
    //     return await logic.revokeVpnKeyLogic(vpnKeyId);
    //   },
    // },
  },
};

export default vpnService;
