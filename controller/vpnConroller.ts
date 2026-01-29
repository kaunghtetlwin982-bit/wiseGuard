import express from "express";
import { getServerById } from "../service/serverService/service";
import { authenticateToken, requireAdmin, requireOwnerAndDeveloper } from "../middleware";
import logic from "../service/vpnService/logic";
import { createVpnKey, deleteVpnKey, listVpnKeys, updateVpnKeyName } from "../helper/outline_helper";

const router = express.Router();

// Create a new VPN key
router.post("/create", authenticateToken, requireOwnerAndDeveloper, async (req, res) => {
  try {
    const {
      serverId,
      duration,
      dataLimitBytes,
      expiresAt,
      status
    } = req.body;

    // Construct payload with user data from req.user
   
    // Get server data
    const serverData: any = await getServerById(serverId);
    if (serverData.code !== "200") {
      return res.status(400).json(serverData);
    }

    const OUTLINE_API = serverData.data.serverUrl;
    const serverObjectId = serverData.data._id || serverId;

    // Create access key on the Outline server before saving to DB
    let createdKey: any;
    try {
      createdKey = await createVpnKey(String(req.user.id) || "", OUTLINE_API);
    } catch (err) {
      console.error("Failed to create outline access key:", err);
      return res.status(500).json({ error: "Failed to create access key on server" });
    }

    const payload = {
      userId: String(req.user.id),
      createdBy: String(req.user.id),
      createdByRole: String(req.user.roleId),
      serverId: String(serverObjectId),
      outlineKeyId: createdKey.id || createdKey.key || "",
      accessUrl: OUTLINE_API,
      duration,
      dataLimitBytes,
      expiresAt,
      status,
    };

    // Save to DB via logic; if DB save fails, delete the created access key
    const result = await logic.createVpnKeyLogic(payload as any);
    if (!result || result.code !== "200") {
      try {
        if (payload.outlineKeyId) {
          await deleteVpnKey(payload.outlineKeyId, OUTLINE_API);
        }
      } catch (delErr) {
        console.error("Failed to delete outline key after DB failure:", delErr);
      }
    }

    return res.status(result && result.code === "200" ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error creating VPN key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a VPN key
router.put("/:vpnKeyId", authenticateToken, requireOwnerAndDeveloper, async (req, res) => {
  try {
    const { vpnKeyId } = req.params;
    const userId = req.user.id;
    const { useName } = req.body;

    if (!useName) {
      return res.status(400).json({ error: "useName is required" });
    }

    // Ensure user is authorized and get vpn key info
    const vpnKeyResp: any = await logic.getVpnKeyByIdLogic(vpnKeyId);
    if (vpnKeyResp.code !== "200") return res.status(404).json(vpnKeyResp);

    const vpnKey = vpnKeyResp.data;
    const createdBy = vpnKey.createdBy;
    const createdById = createdBy._id ? String(createdBy._id) : String(createdBy);
    if (createdById !== String(userId)) {
      return res.status(403).json({ error: "You can only update VPN keys you created" });
    }

    const outlineKeyId = vpnKey.outlineKeyId;
    const OUTLINE_API = vpnKey.accessUrl;

    try {
      const updated = await updateVpnKeyName(outlineKeyId, useName, OUTLINE_API);
      return res.status(200).json({ code: "200", status: "OK", data: updated });
    } catch (err) {
      console.error("Failed to update outline key name:", err);
      return res.status(500).json({ error: "Failed to update access key name on server" });
    }
  } catch (error) {
    console.error("Error updating VPN key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a VPN key
router.delete("/:vpnKeyId", authenticateToken, requireOwnerAndDeveloper, async (req, res) => {
  try {
    const { vpnKeyId } = req.params;
    const userId = req.user.id;

    const result = await logic.deleteVpnKeyLogic(vpnKeyId, String(userId));
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting VPN key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// List VPN keys with pagination
router.post("/", authenticateToken, requireOwnerAndDeveloper, async (req, res) => {
  try {
    console.log("req.body :", req.body)
    const {
      page = 1,
      limit = 10,
      sort_by = "createdAt",
      sort_order = "desc",
      serverId,
      status = "active",
      // createdByRole,  
    } = req.body;

    const userRole = req.user.roleId;
    const currentUserId = req.user.id;

    const filters: any = {};
    if (serverId) filters.serverId = serverId;
    if (status) filters.status = status;
    // if (createdByRole) filters.createdByRole = createdByRole;

    // Role-based filtering
    if (userRole === "owner") {
      // Owner can only see VPN keys they created
      filters.createdBy = currentUserId;
    }
    // Developer can see all VPN keys (no additional filter needed)

    console.log("User role:", userRole);
    console.log("Current user ID:", currentUserId);
    console.log("Applied filters:", filters);

    // If serverId provided, fetch real server keys and merge with DB keys
    if (serverId) {
      const serverData: any = await getServerById(serverId);
      console.log("Server Data :",serverData)
      if (serverData.code !== "200") {
        return res.status(400).json(serverData);
      }

      const OUTLINE_API = serverData.data.serverUrl;
      let serverKeys: any[] = [];
      try {
        serverKeys = await listVpnKeys(OUTLINE_API);
      } catch (err) {
        console.error("Failed to list outline keys:", err);
        // continue with DB result but include an error note
      }

      const dbResult: any = await logic.getVpnKeysLogic(Number(page), Number(limit), sort_by as string, sort_order as string, filters);
      const dbVpnKeys = dbResult.data?.vpnKeys || dbResult?.vpnKeys || [];

      // Create a map for quick lookup
      const dbMap = new Map(dbVpnKeys.map((k: any) => [String(k.outlineKeyId), k]));
      const serverMap = new Map(serverKeys.map((k: any) => [String(k.id || k.key), k]));

      // Merge: collect all unique outline key IDs from both sources
      const allOutlineIds = new Set([...dbMap.keys(), ...serverMap.keys()]);
      
      const mergedVpnKeys = Array.from(allOutlineIds).map((outlineId) => ({
        db: dbMap.get(outlineId as string) || null,
        server: serverMap.get(outlineId as string) || null,
      }));

      // Return with merged structure
      return res.status(200).json({
        code: "200",
        status: "OK",
        message: "No Error",
        data: {
          // vpnKeys: mergedVpnKeys,
          vpnKeys: serverKeys,
          pagination: dbResult.data?.pagination || dbResult?.pagination || {
            currentPage: page,
            limit,
            rowsPerPage: 0,
            total: 0,
          },
        },
      });
    }

    // const result = await logic.getVpnKeysLogic(Number(page), Number(limit), sort_by as string, sort_order as string, filters);
    // return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching VPN keys:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get VPN key by ID
router.get("/:vpnKeyId", authenticateToken, async (req, res) => {
  try {
    console.log("Call vpnKeyId")
    const { vpnKeyId } = req.params;
    const userId = req.user.id;

    const vpnKeyData: any = await logic.getVpnKeyByIdLogic(vpnKeyId);
    if (vpnKeyData.code !== "200") {
      return res.status(404).json(vpnKeyData);
    }

    if (!vpnKeyData.data || !vpnKeyData.data.createdBy) {
      return res.status(404).json({ error: "VPN key data or creator information not found" });
    }

    const createdBy = vpnKeyData.data.createdBy;
    const createdById = createdBy._id ? String(createdBy._id) : String(createdBy);
    if (createdById !== String(userId)) {
      return res.status(403).json({ error: "You can only view VPN keys you created" });
    }

    return res.status(200).json(vpnKeyData);
  } catch (error) {
    console.error("Error fetching VPN key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get VPN keys by user ID
router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Only allow users to see VPN keys they created for any user
    const filters = { createdBy: currentUserId, userId };
    const result = await logic.getVpnKeysLogic(1, 1000, "createdAt", "desc", filters);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching user VPN keys:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Revoke VPN key
// router.put("/:vpnKeyId/revoke", authenticateToken, requireAdmin, async (req, res) => {
//   try {
//     const { vpnKeyId } = req.params;

//     // Get VPN key data to get server info
//     const vpnKeyData: any = await theBroker.call("vpn.getById", { vpnKeyId });
//     if (vpnKeyData.code !== "200") {
//       return res.status(404).json(vpnKeyData);
//     }

//     // Check if VPN key data and serverId exist
//     if (!vpnKeyData.data || !vpnKeyData.data.serverId) {
//       return res.status(400).json({ error: "VPN key data or server information not found" });
//     }

//     // Get server data to determine the correct service call
//     const serverData = await getServerById(vpnKeyData.data.serverId);
//     if (serverData.code !== "200") {
//       return res.status(400).json(serverData);
//     }

//     const servicecall = serverData.data.servicecall;

//     const result = await theBroker.call(`${servicecall}.revoke`, { vpnKeyId });
//     res.status(200).json(result);
//   } catch (error) {
//     console.error("Error revoking VPN key:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

export default router;