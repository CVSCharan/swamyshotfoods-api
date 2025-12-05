import { ITimingTemplate } from "../models/TimingTemplate";

export interface ITimingTemplateService {
  createTemplate(data: Partial<ITimingTemplate>): Promise<ITimingTemplate>;
  getAllTemplates(): Promise<ITimingTemplate[]>;
  getTemplateById(id: string): Promise<ITimingTemplate | null>;
  getTemplateByKey(key: string): Promise<ITimingTemplate | null>;
  updateTemplate(
    id: string,
    data: Partial<ITimingTemplate>
  ): Promise<ITimingTemplate | null>;
  deleteTemplate(id: string): Promise<boolean>;
}
