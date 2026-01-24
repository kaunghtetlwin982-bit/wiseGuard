import express from "express";
import userController from "./userController";
import authController from "./authController";
import vpnController from "./vpnConroller";
import serverController from "./serverController";
import { createVpnKey } from "../helper/outline_helper";

const router = express.Router();

// Mount auth routes
router.use("/auth", authController);

// Mount user routes
router.use("/users", userController);

// Mount VPN routes
router.use("/vpn", vpnController);

// Mount server routes
router.use("/servers", serverController);

router.post("/create", async(req, res)=>{
    try {
        const {name}= req.body;
        const result = await createVpnKey(name);
        res.json(result)
        
    } catch (error: any) {
        res.json(error)
    }
})

export default router;