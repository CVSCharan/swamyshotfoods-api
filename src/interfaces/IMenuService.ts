import { IMenu } from "../models/Menu";

export interface IMenuService {
  createMenu(menuData: Partial<IMenu>): Promise<IMenu>;
  getAllMenus(): Promise<IMenu[]>;
  getMenuById(id: string): Promise<IMenu | null>;
  updateMenu(id: string, menuData: Partial<IMenu>): Promise<IMenu | null>;
  deleteMenu(id: string): Promise<boolean>;

  // Template assignment methods
  assignTemplate(menuId: string, templateKey: string): Promise<IMenu | null>;
  bulkAssignTemplate(menuIds: string[], templateKey: string): Promise<number>;
  setCustomTimings(
    menuId: string,
    morningTimings?: { startTime: string; endTime: string },
    eveningTimings?: { startTime: string; endTime: string }
  ): Promise<IMenu | null>;

  // Availability query methods
  getAvailableMenus(currentTime?: Date): Promise<IMenu[]>;
  getMenusByTimeSlot(slot: "morning" | "evening"): Promise<IMenu[]>;

  // Ingredient filtering methods
  getMenusByDietaryLabel(label: string): Promise<IMenu[]>;
  getAllergenFreeMenus(): Promise<IMenu[]>;
  searchByIngredient(ingredientName: string): Promise<IMenu[]>;

  // Ingredient filtering methods
  getMenusByDietaryLabel(label: string): Promise<IMenu[]>;
  getAllergenFreeMenus(): Promise<IMenu[]>;
  searchByIngredient(ingredientName: string): Promise<IMenu[]>;
}
