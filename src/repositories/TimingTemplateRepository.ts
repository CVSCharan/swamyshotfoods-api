import TimingTemplate, { ITimingTemplate } from "../models/TimingTemplate";
import { ITimingTemplateRepository } from "../interfaces/ITimingTemplateRepository";

export class TimingTemplateRepository implements ITimingTemplateRepository {
  async create(data: Partial<ITimingTemplate>): Promise<ITimingTemplate> {
    const template = new TimingTemplate(data);
    return await template.save();
  }

  async findAll(): Promise<ITimingTemplate[]> {
    return await TimingTemplate.find({ isActive: true }).sort({ name: 1 });
  }

  async findById(id: string): Promise<ITimingTemplate | null> {
    return await TimingTemplate.findById(id);
  }

  async findByKey(key: string): Promise<ITimingTemplate | null> {
    return await TimingTemplate.findOne({ key, isActive: true });
  }

  async update(
    id: string,
    data: Partial<ITimingTemplate>
  ): Promise<ITimingTemplate | null> {
    return await TimingTemplate.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await TimingTemplate.findByIdAndUpdate(id, {
      isActive: false,
    });
    return result !== null;
  }
}
