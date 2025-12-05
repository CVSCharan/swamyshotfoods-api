import { Router } from "express";
import authRoutes from "./auth.routes";
import menuRoutes from "./menu.routes";
import storeConfigRoutes from "./storeConfig.routes";
import timingTemplateRoutes from "./timingTemplate.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/menu", menuRoutes);
router.use("/store-config", storeConfigRoutes);
router.use("/admin/timing-templates", timingTemplateRoutes);

export default router;
