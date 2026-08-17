import mongoose, { Types } from 'mongoose';
import { Brand } from './brand.model';
import { IBrand } from './brand.types';

export const brandRepository = {
  async create(data: Partial<IBrand>) {
    return Brand.create(data);
  },

  async findById(id: string | Types.ObjectId) {
    return Brand.findById(id).populate('logoMediaId').lean();
  },

  async findBySlug(slug: string) {
    return Brand.findOne({ slug }).populate('logoMediaId').lean();
  },

  async findByBrandCode(brandCode: string) {
    return Brand.findOne({ brandCode }).lean();
  },

  async existsByBrandCode(brandCode: string, excludeId?: string | Types.ObjectId) {
    const query: Record<string, any> = { brandCode };
    if (excludeId) query._id = { $ne: excludeId };
    return !!(await Brand.exists(query));
  },

  async existsByName(name: string, excludeId?: string | Types.ObjectId) {
    const query: Record<string, any> = { name: { $regex: new RegExp(`^${name}$`, 'i') } };
    if (excludeId) query._id = { $ne: excludeId };
    return !!(await Brand.exists(query));
  },

  async existsBySlug(slug: string, excludeId?: string | Types.ObjectId) {
    const query: Record<string, any> = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    return !!(await Brand.exists(query));
  },

  async findMany(
    filter: Record<string, any>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ) {
    return Brand.find(filter)
      .populate('logoMediaId')
      .sort(sort as any)
      .skip(skip)
      .limit(limit)
      .lean();
  },

  async count(filter: Record<string, any>) {
    return Brand.countDocuments(filter);
  },

  async update(id: string | Types.ObjectId, data: Partial<IBrand>) {
    return Brand.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  },

  async updateStatus(id: string | Types.ObjectId, status: 'active' | 'inactive') {
    return Brand.findByIdAndUpdate(id, { status }, { new: true }).lean();
  },
};
