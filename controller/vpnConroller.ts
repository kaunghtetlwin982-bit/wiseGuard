import express from "express";
import {
  createVpnKey,
  updateVpnKey,
  deleteVpnKey,
  getVpnKeys,
  getVpnKeyById,
  getVpnKeysByUserId,
  revokeVpnKey
} from "../service/vpnService/service";
import { authenticateToken, requireAdmin } from "../middleware";

const router = express.Router();

// Create a new VPN key
router.post("/create", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await createVpnKey(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error creating VPN key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a VPN key
router.put("/:vpnKeyId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { vpnKeyId } = req.params;
    const result = await updateVpnKey(vpnKeyId, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating VPN key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a VPN key
router.delete("/:vpnKeyId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { vpnKeyId } = req.params;
    const result = await deleteVpnKey(vpnKeyId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting VPN key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// List VPN keys with pagination
router.get("/", authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort_by = "createdAt",
      sort_order = "desc",
      userId,
      serverId,
      status,
      createdByRole,
    } = req.query;

    const filters: any = {};
    if (userId) filters.userId = userId;
    if (serverId) filters.serverId = serverId;
    if (status) filters.status = status;
    if (createdByRole) filters.createdByRole = createdByRole;

    const result = await getVpnKeys(
      Number(page),
      Number(limit),
      sort_by as string,
      sort_order as string,
      filters
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching VPN keys:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get VPN key by ID
router.get("/:vpnKeyId", authenticateToken, async (req, res) => {
  try {
    const { vpnKeyId } = req.params;
    const result = await getVpnKeyById(vpnKeyId);
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
    const result = await getVpnKeysByUserId(userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching user VPN keys:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Revoke VPN key
router.put("/:vpnKeyId/revoke", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { vpnKeyId } = req.params;
    const result = await revokeVpnKey(vpnKeyId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error revoking VPN key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;