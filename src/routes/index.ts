import { Router } from "express";
import authRoutes from "./auth.routes";
import menuRoutes from "./menu.routes";
import storeConfigRoutes from "./storeConfig.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/menu", menuRoutes);
router.use("/store-config", storeConfigRoutes);

export default router;
