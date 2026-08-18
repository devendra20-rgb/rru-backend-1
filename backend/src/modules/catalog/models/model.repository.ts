import mongoose, { Types } from 'mongoose';
import { VehicleModel } from './model.model';
import { IModel } from './model.types';

export const modelRepository = {
  async create(data: Partial<IModel>) {
    return VehicleModel.create(data);
  },

  async findById(id: string | Types.ObjectId) {
    return VehicleModel.findById(id).populate('brandId').lean();
  },

  async findBySlug(slug: string) {
    return VehicleModel.findOne({ slug }).lean();
  },

  async findByModelCode(modelCode: string) {
    return VehicleModel.findOne({ modelCode }).lean();
  },

  async existsByModelCode(modelCode: string, excludeId?: string | Types.ObjectId) {
    const query: Record<string, any> = { modelCode };
    if (excludeId) query._id = { $ne: excludeId };
    return !!(await VehicleModel.exists(query));
  },

  async existsByNameAndBrand(
    name: string,
    brandId: string | Types.ObjectId,
    excludeId?: string | Types.ObjectId,
  ) {
    const query: Record<string, any> = {
      brandId,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    };
    if (excludeId) query._id = { $ne: excludeId };
    return !!(await VehicleModel.exists(query));
  },

  async existsBySlug(slug: string, excludeId?: string | Types.ObjectId) {
    const query: Record<string, any> = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    return !!(await VehicleModel.exists(query));
  },

  async findMany(
    filter: Record<string, any>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ) {
    return VehicleModel.find(filter)
      .populate('brandId')
      .sort(sort as any)
      .skip(skip)
      .limit(limit)
      .lean();
  },

  async count(filter: Record<string, any>) {
    return VehicleModel.countDocuments(filter);
  },

  async update(id: string | Types.ObjectId, data: Partial<IModel>) {
    return VehicleModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  },

  async updateStatus(id: string | Types.ObjectId, status: 'active' | 'inactive' | 'draft') {
    return VehicleModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
  },
};
