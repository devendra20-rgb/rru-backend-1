import { Types } from 'mongoose';

export interface IModel {
  _id: Types.ObjectId;
  brandId: Types.ObjectId;
  modelCode: string;
  name: string;
  slug: string;
  bodyType?: string;
  segment?: string;
  launchYear?: number;
  description?: string;
  shortDescription?: string;
  seo?: {
    title?: string;
    description?: string;
  };
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}
