import express from "express";
import verificationRoutes from "./verification.routes";

const route = express.Router();

route.use("/verify", verificationRoutes);

export default route;
