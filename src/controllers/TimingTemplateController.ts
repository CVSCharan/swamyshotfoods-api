import { Request, Response } from "express";
import { ITimingTemplateService } from "../interfaces/ITimingTemplateService";

export class TimingTemplateController {
  private templateService: ITimingTemplateService;

  constructor(templateService: ITimingTemplateService) {
    this.templateService = templateService;
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const template = await this.templateService.createTemplate(req.body);
      res.status(201).json(template);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const templates = await this.templateService.getAllTemplates();
      res.status(200).json(templates);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const template = await this.templateService.getTemplateById(
        req.params.id
      );
      if (!template) {
        res.status(404).json({ message: "Template not found" });
        return;
      }
      res.status(200).json(template);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const template = await this.templateService.updateTemplate(
        req.params.id,
        req.body
      );
      if (!template) {
        res.status(404).json({ message: "Template not found" });
        return;
      }
      res.status(200).json(template);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const success = await this.templateService.deleteTemplate(req.params.id);
      if (!success) {
        res.status(404).json({ message: "Template not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
