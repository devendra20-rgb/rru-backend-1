import mongoose, { Types } from 'mongoose';
import { Generation } from './generation.model';
import { IGeneration } from './generation.types';

export const generationRepository = {
  async create(data: Partial<IGeneration>) {
    return Generation.create(data);
  },

  async findById(id: string | Types.ObjectId) {
    return Generation.findById(id).populate('modelId').lean();
  },

  async findBySlug(slug: string) {
    return Generation.findOne({ slug }).lean();
  },

  async findByGenerationCode(generationCode: string) {
    return Generation.findOne({ generationCode }).lean();
  },

  async existsByGenerationCode(generationCode: string, excludeId?: string | Types.ObjectId) {
    const query: Record<string, any> = { generationCode };
    if (excludeId) query._id = { $ne: excludeId };
    return !!(await Generation.exists(query));
  },

  async existsByNameAndModel(
    name: string,
    modelId: string | Types.ObjectId,
    excludeId?: string | Types.ObjectId,
  ) {
    const query: Record<string, any> = {
      modelId,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    };
    if (excludeId) query._id = { $ne: excludeId };
    return !!(await Generation.exists(query));
  },

  async existsBySlug(slug: string, excludeId?: string | Types.ObjectId) {
    const query: Record<string, any> = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    return !!(await Generation.exists(query));
  },

  async findMany(
    filter: Record<string, any>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ) {
    return Generation.find(filter)
      .populate('modelId')
      .sort(sort as any)
      .skip(skip)
      .limit(limit)
      .lean();
  },

  async count(filter: Record<string, any>) {
    return Generation.countDocuments(filter);
  },

  async update(id: string | Types.ObjectId, data: Partial<IGeneration>) {
    return Generation.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  },

  async updateStatus(id: string | Types.ObjectId, status: 'active' | 'inactive' | 'draft') {
    return Generation.findByIdAndUpdate(id, { status }, { new: true }).lean();
  },
};
