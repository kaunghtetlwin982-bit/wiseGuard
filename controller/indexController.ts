import express from "express";
import user from  "./generateQr"

const router = express.Router();
router.use("/", user)

export default router;