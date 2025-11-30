import { IMenu } from "../models/Menu";

export interface IMenuService {
  createMenu(menuData: Partial<IMenu>): Promise<IMenu>;
  getAllMenus(): Promise<IMenu[]>;
  getMenuById(id: string): Promise<IMenu | null>;
  updateMenu(id: string, menuData: Partial<IMenu>): Promise<IMenu | null>;
  deleteMenu(id: string): Promise<boolean>;
}
