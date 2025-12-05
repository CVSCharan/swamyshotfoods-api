import Menu, { IMenu } from "../models/Menu";
import { IMenuRepository } from "../interfaces/IMenuRepository";

export class MenuRepository implements IMenuRepository {
  async create(menu: Partial<IMenu>): Promise<IMenu> {
    return await Menu.create(menu);
  }

  async findAll(): Promise<IMenu[]> {
    return await Menu.find().sort({ priority: 1 });
  }

  async findById(id: string): Promise<IMenu | null> {
    return await Menu.findById(id);
  }

  async update(id: string, menu: Partial<IMenu>): Promise<IMenu | null> {
    return await Menu.findByIdAndUpdate(id, menu, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await Menu.findByIdAndDelete(id);
    return !!result;
  }

  async bulkUpdate(ids: string[], data: Partial<IMenu>): Promise<number> {
    const result = await Menu.updateMany({ _id: { $in: ids } }, data);
    return result.modifiedCount;
  }

  async findByTimingTemplate(templateKey: string): Promise<IMenu[]> {
    return await Menu.find({ timingTemplate: templateKey }).sort({
      priority: 1,
    });
  }
}
