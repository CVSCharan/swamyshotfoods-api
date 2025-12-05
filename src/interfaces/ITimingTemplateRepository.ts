import { ITimingTemplate } from "../models/TimingTemplate";

export interface ITimingTemplateRepository {
  create(data: Partial<ITimingTemplate>): Promise<ITimingTemplate>;
  findAll(): Promise<ITimingTemplate[]>;
  findById(id: string): Promise<ITimingTemplate | null>;
  findByKey(key: string): Promise<ITimingTemplate | null>;
  update(
    id: string,
    data: Partial<ITimingTemplate>
  ): Promise<ITimingTemplate | null>;
  delete(id: string): Promise<boolean>;
}
