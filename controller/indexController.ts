import express from "express";
import userController from "./userController";
import authController from "./authController";
import vpnController from "./vpnConroller";

const router = express.Router();

// Mount auth routes
router.use("/auth", authController);

// Mount user routes
router.use("/users", userController);

// Mount VPN routes
router.use("/vpn", vpnController);

export default router;