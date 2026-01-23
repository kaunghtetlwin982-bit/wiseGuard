import express from "express";
import userController from "./userController";
import authController from "./authController";
import vpnController from "./vpnConroller";
import serverController from "./serverController";

const router = express.Router();

// Mount auth routes
router.use("/auth", authController);

// Mount user routes
router.use("/users", userController);

// Mount VPN routes
router.use("/vpn", vpnController);

// Mount server routes
router.use("/servers", serverController);

export default router;