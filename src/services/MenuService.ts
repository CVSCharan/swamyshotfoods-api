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

  async assignTemplate(
    menuId: string,
    templateKey: string
  ): Promise<IMenu | null> {
    return await this.menuRepository.update(menuId, {
      timingTemplate: templateKey,
      morningTimings: undefined,
      eveningTimings: undefined,
    });
  }

  async bulkAssignTemplate(
    menuIds: string[],
    templateKey: string
  ): Promise<number> {
    return await this.menuRepository.bulkUpdate(menuIds, {
      timingTemplate: templateKey,
      morningTimings: undefined,
      eveningTimings: undefined,
    });
  }

  async setCustomTimings(
    menuId: string,
    morningTimings?: { startTime: string; endTime: string },
    eveningTimings?: { startTime: string; endTime: string }
  ): Promise<IMenu | null> {
    return await this.menuRepository.update(menuId, {
      timingTemplate: undefined,
      morningTimings,
      eveningTimings,
    });
  }

  async getAvailableMenus(currentTime?: Date): Promise<IMenu[]> {
    const allMenus = await this.menuRepository.findAll();
    const now = currentTime || new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return allMenus.filter((menu) => {
      if (!menu.morningTimings && !menu.eveningTimings) return false;

      const isAvailable = (slot: { startTime: string; endTime: string }) => {
        const start = this.parseTime(slot.startTime);
        const end = this.parseTime(slot.endTime);
        const current = currentHour * 60 + currentMinute;

        return current >= start && current <= end;
      };

      if (menu.morningTimings && isAvailable(menu.morningTimings)) return true;
      if (menu.eveningTimings && isAvailable(menu.eveningTimings)) return true;

      return false;
    });
  }

  async getMenusByTimeSlot(slot: "morning" | "evening"): Promise<IMenu[]> {
    const allMenus = await this.menuRepository.findAll();

    return allMenus.filter((menu) => {
      if (slot === "morning") return !!menu.morningTimings;
      return !!menu.eveningTimings;
    });
  }

  private parseTime(timeStr: string): number {
    // Parse time strings like "5:30am", "10:00am", "4:30pm", "8:30pm"
    const match = timeStr.match(/(\d+):?(\d+)?\s*(am|pm)/i);
    if (!match) return 0;

    let hours = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const period = match[3].toLowerCase();

    if (period === "pm" && hours !== 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  async getMenusByDietaryLabel(label: string): Promise<IMenu[]> {
    const allMenus = await this.menuRepository.findAll();
    return allMenus.filter((menu) =>
      menu.dietaryLabels.some((l) => l.toLowerCase() === label.toLowerCase())
    );
  }

  async getAllergenFreeMenus(): Promise<IMenu[]> {
    const allMenus = await this.menuRepository.findAll();
    return allMenus.filter(
      (menu) => !menu.allergens || menu.allergens.length === 0
    );
  }

  async searchByIngredient(ingredientName: string): Promise<IMenu[]> {
    const allMenus = await this.menuRepository.findAll();
    const searchTerm = ingredientName.toLowerCase();
    return allMenus.filter((menu) =>
      menu.ingredients.some((ing) => ing.toLowerCase().includes(searchTerm))
    );
  }
}
