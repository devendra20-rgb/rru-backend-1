import { Types } from 'mongoose';

export interface IGeneration {
  _id: Types.ObjectId;
  modelId: Types.ObjectId;
  generationCode: string;
  name: string;
  slug: string;
  generationNumber?: number;
  startYear?: number;
  endYear?: number;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}
