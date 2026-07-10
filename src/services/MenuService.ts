import { IMenu } from "../models/Menu";
import { IMenuRepository } from "../interfaces/IMenuRepository";
import { ITimingTemplateRepository } from "../interfaces/ITimingTemplateRepository";
import { IMenuService } from "../interfaces/IMenuService";

export class MenuService implements IMenuService {
  private menuRepository: IMenuRepository;
  private timingTemplateRepository: ITimingTemplateRepository;

  constructor(
    menuRepository: IMenuRepository,
    timingTemplateRepository: ITimingTemplateRepository
  ) {
    this.menuRepository = menuRepository;
    this.timingTemplateRepository = timingTemplateRepository;
  }

  private async resolveMenuTimings(menu: IMenu): Promise<IMenu> {
    const resolvedMenu = (menu as any).toObject ? (menu as any).toObject() : { ...menu };

    if (resolvedMenu.timingTemplate) {
      const template = await this.timingTemplateRepository.findByKey(
        resolvedMenu.timingTemplate
      );
      if (template && template.isActive) {
        resolvedMenu.morningTimings = template.morningTimings;
        resolvedMenu.eveningTimings = template.eveningTimings;
      }
    }
    return resolvedMenu as IMenu;
  }

  private async resolveMenusTimings(menus: IMenu[]): Promise<IMenu[]> {
    return await Promise.all(menus.map((m) => this.resolveMenuTimings(m)));
  }

  private sanitizeMenuTimings(menuData: Partial<IMenu>): void {
    if (menuData.timingTemplate === "") {
      menuData.timingTemplate = null as any;
    }

    if (menuData.morningTimings) {
      const { startTime, endTime } = menuData.morningTimings;
      if (!startTime?.trim() || !endTime?.trim()) {
        menuData.morningTimings = null as any;
      }
    }

    if (menuData.eveningTimings) {
      const { startTime, endTime } = menuData.eveningTimings;
      if (!startTime?.trim() || !endTime?.trim()) {
        menuData.eveningTimings = null as any;
      }
    }

    if (menuData.timingTemplate && menuData.timingTemplate !== null) {
      menuData.morningTimings = null as any;
      menuData.eveningTimings = null as any;
    }
  }

  async createMenu(menuData: Partial<IMenu>): Promise<IMenu> {
    this.sanitizeMenuTimings(menuData);
    return await this.menuRepository.create(menuData);
  }

  async getAllMenus(): Promise<IMenu[]> {
    const menus = await this.menuRepository.findAll();
    return await this.resolveMenusTimings(menus);
  }

  async getMenuById(id: string): Promise<IMenu | null> {
    const menu = await this.menuRepository.findById(id);
    if (!menu) return null;
    return await this.resolveMenuTimings(menu);
  }

  async updateMenu(
    id: string,
    menuData: Partial<IMenu>
  ): Promise<IMenu | null> {
    this.sanitizeMenuTimings(menuData);
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
    const resolvedMenus = await this.resolveMenusTimings(allMenus);
    
    const now = currentTime || new Date();
    // Convert to IST to match Shop Config logic
    const istTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istTime = new Date(istTimeStr);
    const currentHour = istTime.getHours();
    const currentMinute = istTime.getMinutes();

    return resolvedMenus.filter((menu) => {
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
    const resolvedMenus = await this.resolveMenusTimings(allMenus);

    return resolvedMenus.filter((menu) => {
      if (slot === "morning") return !!menu.morningTimings;
      return !!menu.eveningTimings;
    });
  }

  private parseTime(timeStr: string): number {
    // Support both "08:30" (24-hour) and "8:30 am" (12-hour)
    const match = timeStr.match(/(\d+):?(\d+)?\s*(am|pm)?/i);
    if (!match) return 0;

    let hours = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const period = match[3] ? match[3].toLowerCase() : null;

    if (period === "pm" && hours !== 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  async getMenusByDietaryLabel(label: string): Promise<IMenu[]> {
    const allMenus = await this.menuRepository.findAll();
    const resolvedMenus = await this.resolveMenusTimings(allMenus);
    
    return resolvedMenus.filter((menu) =>
      menu.dietaryLabels.some((l) => l.toLowerCase() === label.toLowerCase())
    );
  }

  async getAllergenFreeMenus(): Promise<IMenu[]> {
    const allMenus = await this.menuRepository.findAll();
    const resolvedMenus = await this.resolveMenusTimings(allMenus);
    
    return resolvedMenus.filter(
      (menu) => !menu.allergens || menu.allergens.length === 0
    );
  }

  async searchByIngredient(ingredientName: string): Promise<IMenu[]> {
    const allMenus = await this.menuRepository.findAll();
    const resolvedMenus = await this.resolveMenusTimings(allMenus);
    
    const searchTerm = ingredientName.toLowerCase();
    return resolvedMenus.filter((menu) =>
      menu.ingredients.toLowerCase().includes(searchTerm)
    );
  }
}
