import { Types } from 'mongoose';

export interface IBrand {
  _id: Types.ObjectId;
  brandCode: string;
  name: string;
  slug: string;
  originCountryCode?: string;
  websiteUrl?: string;
  logoMediaId?: Types.ObjectId;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}
