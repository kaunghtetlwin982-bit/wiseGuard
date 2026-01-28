import express from "express";
import { getServerById } from "../service/serverService/service";
import { authenticateToken, requireAdmin, requireOwnerAndDeveloper } from "../middleware";
import theBroker from "../broker/broker";

const router = express.Router();

// Create a new VPN key
router.post("/create", authenticateToken, requireOwnerAndDeveloper, async (req, res) => {
  try {
    const {
      serverId,
      // outlineKeyId,
      // accessUrl,
      duration,
      dataLimitBytes,
      expiresAt,
      status
    } = req.body;

    // Construct payload with user data from req.user
   
    // Get server data
    const serverData : any= await getServerById(serverId);
    if(serverData.code !== "200"){
      return  res.json(serverData);
    }

    
    const {serverUrl, _id} = serverData;

     const payload = {
      userId: String(req.user.id),           // User who will use the VPN key
      createdBy: String(req.user.id),        // User who is creating the VPN key
      createdByRole: String(req.user.roleId), // Role of the user creating the key
      serverId,
      outlineKeyId : "",
      accessUrl : serverUrl,
      duration,
      dataLimitBytes,
      expiresAt,
    };

    console.log("payload :" , payload)
    res.json(serverData)
    
    console.log("serverData : ", serverData)
    // if (serverData.code !== "200") {
    //   return res.status(400).json(serverData);
    // };

    // const servicecall = serverData.data.servicecall;

    // const result: any = await theBroker.call(`${servicecall}.create`, payload)

    // res.status(200).json(result);
  } catch (error) {
    console.error("Error creating VPN key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a VPN key
router.put("/:vpnKeyId", authenticateToken, requireOwnerAndDeveloper, async (req, res) => {
  try {
    const { vpnKeyId } = req.params;
    const { serverId } = req.body
    const userId = req.user.id;

    // Get server data to determine the correct service call
    const serverData = await getServerById(serverId);
    if (serverData.code !== "200") {
      return res.status(400).json(serverData);
    }

    const servicecall = serverData.data.servicecall;

    const result = await theBroker.call(`${servicecall}.update`, { vpnKeyId, currentUserId: userId, ...req.body });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating VPN key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a VPN key
router.delete("/:vpnKeyId", authenticateToken, requireOwnerAndDeveloper, async (req, res) => {
  try {
    const { vpnKeyId } = req.params;
    const { serverId } = req.body
    const userId = req.user.id;

    // Get server data to determine the correct service call
    const serverData = await getServerById(serverId);
    if (serverData.code !== "200") {
      return res.status(400).json(serverData);
    }

    const servicecall = serverData.data.servicecall;
    console.log("Parmas : ",{ vpnKeyId, currentUserId: userId })

    const result = await theBroker.call(`${servicecall}.delete`, { vpnKeyId, currentUserId: String(userId) });
    res.status(200).json(result);
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

    console.log("Calling vpn.list with params:", {
      currentPage: Number(page),
      limit: Number(limit),
      sort_by: sort_by as string,
      sort_order: sort_order as string,
      filters
    });

    const result = await theBroker.call("vpn.list", {
      currentPage: Number(page),
      limit: Number(limit),
      sort_by: sort_by as string,
      sort_order: sort_order as string,
      filters
    });

    console.log("Broker call result:", result);
    console.log("Result type:", typeof result);
    console.log("Result keys:", result ? Object.keys(result) : "undefined");

    res.status(200).json(result);
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

    // First get VPN key data for authorization
    const vpnKeyData: any = await theBroker.call("vpn.getById", { vpnKeyId });

    // Check if the user is the creator of this VPN key
    if (vpnKeyData.code !== "200") {
      return res.status(404).json(vpnKeyData);
    }

    // Check if VPN key data and createdBy exist
    if (!vpnKeyData.data || !vpnKeyData.data.createdBy) {
      return res.status(404).json({ error: "VPN key data or creator information not found" });
    }

    console.log("vpnKeyData.data.createdBy : ", vpnKeyData.data.createdBy._id)
    console.log("UserID : ", userId)

    if (!vpnKeyData.data.createdBy.equals(userId)) {
      return res.status(403).json({ error: "You can only view VPN keys you created" });
    }


    // Get server data to determine the correct service call
    if (!vpnKeyData.data.serverId) {
      return res.status(400).json({ error: "VPN key server information not found" });
    }

    const serverData = await getServerById(vpnKeyData.data.serverId);
    console.log("serverData : ", serverData)
    if (serverData.code !== "200") {
      return res.status(400).json(serverData);
    }

    const servicecall = serverData.data.servicecall;

    const result = await theBroker.call(`${servicecall}.getById`, { vpnKeyId });
    console.log("result : ", result)
    res.status(200).json(result);
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
    const result = await theBroker.call("vpn.list", {
      currentPage: 1,
      limit: 1000,
      filters: { createdBy: currentUserId, userId }
    });
    res.status(200).json(result);
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