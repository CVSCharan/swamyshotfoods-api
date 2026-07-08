import { Router } from "express";
import { TimingTemplateController } from "../controllers/TimingTemplateController";
import { TimingTemplateService } from "../services/TimingTemplateService";
import { TimingTemplateRepository } from "../repositories/TimingTemplateRepository";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import { timingTemplateValidation } from "../utils/validators";
import { validate } from "../middleware/validate.middleware";

const router = Router();

// Initialize dependencies
const templateRepository = new TimingTemplateRepository();
const templateService = new TimingTemplateService(templateRepository);
const templateController = new TimingTemplateController(templateService);

// All routes require admin authentication
router.use(authMiddleware, roleMiddleware(["admin"]));

// Template CRUD routes
router.post("/", timingTemplateValidation, validate, templateController.create);
router.get("/", templateController.getAll);
router.get("/:id", templateController.getById);
router.put("/:id", timingTemplateValidation, validate, templateController.update);
router.delete("/:id", templateController.delete);

export default router;
