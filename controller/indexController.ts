import express from "express";
import userController from "./userController";

const router = express.Router();

// Mount user routes
router.use("/users", userController);

export default router;