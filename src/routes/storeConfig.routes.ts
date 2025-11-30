import { Router } from "express";
import { StoreConfigController } from "../controllers/StoreConfigController";
import { StoreConfigService } from "../services/StoreConfigService";
import { StoreConfigRepository } from "../repositories/StoreConfigRepository";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import { storeConfigValidation } from "../utils/validators";
import { validate } from "../middleware/validate.middleware";

const router = Router();

// Manual Dependency Injection
const repository = new StoreConfigRepository();
const service = new StoreConfigService(repository);
const controller = new StoreConfigController(service);

/**
 * @swagger
 * tags:
 *   name: StoreConfig
 *   description: Store configuration and real-time updates
 */

/**
 * @swagger
 * /store-config:
 *   get:
 *     summary: Get current store configuration
 *     tags: [StoreConfig]
 *     responses:
 *       200:
 *         description: Current configuration
 */
router.get("/", controller.getConfig);

/**
 * @swagger
 * /store-config:
 *   put:
 *     summary: Update store configuration
 *     tags: [StoreConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isShopOpen: { type: boolean }
 *               isCooking: { type: boolean }
 *               isHoliday: { type: boolean }
 *               holidayMessage: { type: string }
 *               isNoticeActive: { type: boolean }
 *               noticeMessage: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Updated configuration
 */
router.put(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  storeConfigValidation,
  validate,
  controller.updateConfig
);

/**
 * @swagger
 * /store-config/sse:
 *   get:
 *     summary: Connect to Server-Sent Events stream
 *     tags: [StoreConfig]
 *     description: Connect to this endpoint to receive real-time updates.
 *     responses:
 *       200:
 *         description: Stream connection established
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 */
router.get("/sse", controller.sse);

export default router;
