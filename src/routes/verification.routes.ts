import express from "express";
import multer from "multer";
import { verifyLicences } from "../controllers/verification.controller";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Simple route — accepts .txt file
router.post("/", upload.single("file"), verifyLicences);

export default router;
