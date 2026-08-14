import { Types } from 'mongoose';
import { Feature, VariantFeature } from './feature.model';
import {
  IFeature,
  IVariantFeature,
  CreateFeatureDTO,
  UpdateFeatureDTO,
  CreateVariantFeatureDTO,
  UpdateVariantFeatureDTO,
  FeatureQuery,
  VariantFeatureQuery,
} from './feature.types';

class FeatureRepository {
  async create(data: CreateFeatureDTO & { slug: string }): Promise<IFeature> {
    const feature = new Feature(data);
    return feature.save();
  }

  async findById(id: string): Promise<IFeature | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Feature.findById(id);
  }

  async findBySlug(slug: string): Promise<IFeature | null> {
    return Feature.findOne({ slug });
  }

  async findByName(name: string): Promise<IFeature | null> {
    return Feature.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  }

  async count(filter: Record<string, any>): Promise<number> {
    return Feature.countDocuments(filter);
  }

  async findAll(query: FeatureQuery): Promise<{ data: IFeature[]; total: number }> {
    const { page = 1, limit = 10, category, status, search } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      Feature.find(filter).skip(skip).limit(limit).sort({ category: 1, name: 1 }),
      this.count(filter),
    ]);

    return { data, total };
  }

  async update(id: string, data: UpdateFeatureDTO & { slug?: string }): Promise<IFeature | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Feature.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<IFeature | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Feature.findByIdAndUpdate(
      id,
      { status: 'inactive' },
      { new: true, runValidators: true },
    );
  }
}

class VariantFeatureRepository {
  async create(data: CreateVariantFeatureDTO): Promise<IVariantFeature> {
    const variantFeature = new VariantFeature(data);
    return variantFeature.save();
  }

  async findById(id: string): Promise<IVariantFeature | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return VariantFeature.findById(id).populate('featureId');
  }

  async findByVariantAndFeature(
    variantId: string,
    featureId: string,
  ): Promise<IVariantFeature | null> {
    if (!Types.ObjectId.isValid(variantId) || !Types.ObjectId.isValid(featureId)) return null;
    return VariantFeature.findOne({ variantId, featureId }).populate('featureId');
  }

  async count(filter: Record<string, any>): Promise<number> {
    return VariantFeature.countDocuments(filter);
  }

  async findAll(query: VariantFeatureQuery): Promise<{ data: IVariantFeature[]; total: number }> {
    const { page = 1, limit = 10, variantId, featureId, availability, status } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (variantId) filter.variantId = variantId;
    if (featureId) filter.featureId = featureId;
    if (availability) filter.availability = availability;
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      VariantFeature.find(filter)
        .populate('featureId')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.count(filter),
    ]);

    return { data, total };
  }

  async findByVariantId(variantId: string): Promise<IVariantFeature[]> {
    if (!Types.ObjectId.isValid(variantId)) return [];
    return VariantFeature.find({ variantId, status: 'active' })
      .populate('featureId')
      .sort({ createdAt: -1 });
  }

  async update(id: string, data: UpdateVariantFeatureDTO): Promise<IVariantFeature | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return VariantFeature.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate(
      'featureId',
    );
  }

  async delete(id: string): Promise<IVariantFeature | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return VariantFeature.findByIdAndUpdate(
      id,
      { status: 'inactive' },
      { new: true, runValidators: true },
    ).populate('featureId');
  }
}

export const featureRepository = new FeatureRepository();
export const variantFeatureRepository = new VariantFeatureRepository();
