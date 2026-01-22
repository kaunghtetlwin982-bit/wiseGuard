import express from "express";
// import ServiceBroker from "../broker/broker";
import logic from "../service/userSevice/logic";
import { authenticateToken, requireAdmin } from "../middleware";

const router = express.Router();

// Create a new user
router.post("/create", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await logic.createUserLogic(req.body);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update a user
router.put("/:userId", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await logic.updateUserLogic(userId, req.body);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Delete a user
router.delete("/:userId", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await logic.deleteUserLogic(userId);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// List users with pagination
router.get("/", authenticateToken, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort_by = "createdAt",
            sort_order = "desc",
            ...filters
        } = req.query;

        const sortOrder = sort_order === "desc" ? -1 : 1;

        const result = await logic.getUsersLogic(
            parseInt(page as string),
            parseInt(limit as string),
            sort_by as string,
            sortOrder,
            filters
        );
        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get a single user by ID
router.get("/:userId", authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await logic.getUsersLogic(1, 1, "createdAt", -1, { _id: userId });

        if (result.data && result.data.users && result.data.users.length > 0) {
            res.status(200).json(result.data.users[0]);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;