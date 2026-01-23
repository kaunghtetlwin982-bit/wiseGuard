import express from "express";
import {
  createServer,
  updateServer,
  deleteServer,
  getServers,
  getServerById,
  getServersByUserId
} from "../service/serverService/service";
import { authenticateToken, requireAdmin } from "../middleware";

const router = express.Router();

// Create a new server
router.post("/create", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.user.id // Assuming req.user is set by authenticateToken middleware
    };
    const result = await createServer(payload);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error creating server:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a server
router.put("/:serverId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { serverId } = req.params;
    const result = await updateServer(serverId, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating server:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a server
router.delete("/:serverId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { serverId } = req.params;
    const result = await deleteServer(serverId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting server:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get server by ID
router.get("/:serverId", authenticateToken, async (req, res) => {
  try {
    const { serverId } = req.params;
    const result = await getServerById(serverId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching server:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// List servers with pagination and filters
router.get("/", authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort_by = "createdAt",
      sort_order = "desc",
      name,
      ip,
      servicecall,
      location,
      provider,
      status,
      createdBy,
      startDate,
      endDate
    } = req.query;

    const filters: any = {};
    if (name) filters.name = name;
    if (ip) filters.ip = ip;
    if (servicecall) filters.servicecall = servicecall;
    if (location) filters.location = location;
    if (provider) filters.provider = provider;
    if (status) filters.status = status;
    if (createdBy) filters.createdBy = createdBy;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const result = await getServers(
      parseInt(page as string),
      parseInt(limit as string),
      sort_by as string,
      sort_order as string,
      filters
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching servers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get servers by user ID
router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await getServersByUserId(userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching servers by user ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;