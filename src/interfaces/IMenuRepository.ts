import { IMenu } from "../models/Menu";

export interface IMenuRepository {
  create(menu: Partial<IMenu>): Promise<IMenu>;
  findAll(): Promise<IMenu[]>;
  findById(id: string): Promise<IMenu | null>;
  update(id: string, menu: Partial<IMenu>): Promise<IMenu | null>;
  delete(id: string): Promise<boolean>;

  // Bulk operations
  bulkUpdate(ids: string[], data: Partial<IMenu>): Promise<number>;

  // Availability queries
  findByTimingTemplate(templateKey: string): Promise<IMenu[]>;
}
