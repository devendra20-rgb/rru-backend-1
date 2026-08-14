import mongoose, { Types } from 'mongoose';
import { Variant } from './variant.model';
import { IVariant } from './variant.types';

export const variantRepository = {
  async create(data: Partial<IVariant>) {
    return Variant.create(data);
  },

  async findById(id: string | Types.ObjectId) {
    return Variant.findById(id).lean();
  },

  async findBySlug(slug: string) {
    return Variant.findOne({ slug }).lean();
  },

  async findByVariantCode(variantCode: string) {
    return Variant.findOne({ variantCode }).lean();
  },

  async existsByVariantCode(variantCode: string, excludeId?: string | Types.ObjectId) {
    const query: Record<string, any> = { variantCode };
    if (excludeId) query._id = { $ne: excludeId };
    return !!(await Variant.exists(query));
  },

  async existsByNameAndGeneration(
    name: string,
    generationId: string | Types.ObjectId,
    excludeId?: string | Types.ObjectId,
  ) {
    const query: Record<string, any> = {
      generationId,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    };
    if (excludeId) query._id = { $ne: excludeId };
    return !!(await Variant.exists(query));
  },

  async existsBySlug(slug: string, excludeId?: string | Types.ObjectId) {
    const query: Record<string, any> = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    return !!(await Variant.exists(query));
  },

  async findMany(
    filter: Record<string, any>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ) {
    return Variant.find(filter)
      .sort(sort as any)
      .skip(skip)
      .limit(limit)
      .lean();
  },

  async count(filter: Record<string, any>) {
    return Variant.countDocuments(filter);
  },

  async update(id: string | Types.ObjectId, data: Partial<IVariant>) {
    return Variant.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  },

  async updateStatus(id: string | Types.ObjectId, status: 'active' | 'inactive' | 'draft') {
    return Variant.findByIdAndUpdate(id, { status }, { new: true }).lean();
  },
};
