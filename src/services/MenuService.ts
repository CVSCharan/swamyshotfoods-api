import { IMenu } from "../models/Menu";
import { IMenuRepository } from "../interfaces/IMenuRepository";
import { IMenuService } from "../interfaces/IMenuService";

export class MenuService implements IMenuService {
  private menuRepository: IMenuRepository;

  constructor(menuRepository: IMenuRepository) {
    this.menuRepository = menuRepository;
  }

  async createMenu(menuData: Partial<IMenu>): Promise<IMenu> {
    return await this.menuRepository.create(menuData);
  }

  async getAllMenus(): Promise<IMenu[]> {
    return await this.menuRepository.findAll();
  }

  async getMenuById(id: string): Promise<IMenu | null> {
    return await this.menuRepository.findById(id);
  }

  async updateMenu(
    id: string,
    menuData: Partial<IMenu>
  ): Promise<IMenu | null> {
    return await this.menuRepository.update(id, menuData);
  }

  async deleteMenu(id: string): Promise<boolean> {
    return await this.menuRepository.delete(id);
  }
}
