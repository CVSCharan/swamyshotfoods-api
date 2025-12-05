import { ITimingTemplate } from "../models/TimingTemplate";
import { ITimingTemplateRepository } from "../interfaces/ITimingTemplateRepository";
import { ITimingTemplateService } from "../interfaces/ITimingTemplateService";

export class TimingTemplateService implements ITimingTemplateService {
  private templateRepository: ITimingTemplateRepository;

  constructor(templateRepository: ITimingTemplateRepository) {
    this.templateRepository = templateRepository;
  }

  async createTemplate(
    data: Partial<ITimingTemplate>
  ): Promise<ITimingTemplate> {
    return await this.templateRepository.create(data);
  }

  async getAllTemplates(): Promise<ITimingTemplate[]> {
    return await this.templateRepository.findAll();
  }

  async getTemplateById(id: string): Promise<ITimingTemplate | null> {
    return await this.templateRepository.findById(id);
  }

  async getTemplateByKey(key: string): Promise<ITimingTemplate | null> {
    return await this.templateRepository.findByKey(key);
  }

  async updateTemplate(
    id: string,
    data: Partial<ITimingTemplate>
  ): Promise<ITimingTemplate | null> {
    return await this.templateRepository.update(id, data);
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return await this.templateRepository.delete(id);
  }
}
