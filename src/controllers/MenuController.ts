import { Request, Response } from "express";
import { IMenuService } from "../interfaces/IMenuService";

export class MenuController {
  private menuService: IMenuService;

  constructor(menuService: IMenuService) {
    this.menuService = menuService;
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const menu = await this.menuService.createMenu(req.body);
      res.status(201).json(menu);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const menus = await this.menuService.getAllMenus();
      res.status(200).json(menus);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const menu = await this.menuService.getMenuById(req.params.id);
      if (!menu) {
        res.status(404).json({ message: "Menu not found" });
        return;
      }
      res.status(200).json(menu);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const menu = await this.menuService.updateMenu(req.params.id, req.body);
      if (!menu) {
        res.status(404).json({ message: "Menu not found" });
        return;
      }
      res.status(200).json(menu);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const success = await this.menuService.deleteMenu(req.params.id);
      if (!success) {
        res.status(404).json({ message: "Menu not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  assignTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { templateKey } = req.body;
      const menu = await this.menuService.assignTemplate(
        req.params.id,
        templateKey
      );
      if (!menu) {
        res.status(404).json({ message: "Menu not found" });
        return;
      }
      res.status(200).json(menu);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  bulkAssignTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { menuIds, templateKey } = req.body;
      const count = await this.menuService.bulkAssignTemplate(
        menuIds,
        templateKey
      );
      res.status(200).json({ message: `Updated ${count} items`, count });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  setCustomTimings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { morningTimings, eveningTimings } = req.body;
      const menu = await this.menuService.setCustomTimings(
        req.params.id,
        morningTimings,
        eveningTimings
      );
      if (!menu) {
        res.status(404).json({ message: "Menu not found" });
        return;
      }
      res.status(200).json(menu);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getAvailable = async (req: Request, res: Response): Promise<void> => {
    try {
      const menus = await this.menuService.getAvailableMenus();
      res.status(200).json(menus);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getByTimeSlot = async (req: Request, res: Response): Promise<void> => {
    try {
      const slot = req.params.slot as "morning" | "evening";
      if (slot !== "morning" && slot !== "evening") {
        res
          .status(400)
          .json({ message: "Invalid slot. Use 'morning' or 'evening'" });
        return;
      }
      const menus = await this.menuService.getMenusByTimeSlot(slot);
      res.status(200).json(menus);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
