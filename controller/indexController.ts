import express from "express";
import qr from  "./generateQr"

const router = express.Router();
router.use("/", qr)

export default router;