import { Types } from 'mongoose';
import { generateSlug } from '../../../utils/slug';
import { Feature, VariantFeature } from './feature.model';
import { Variant } from '../variants/variant.model';
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
    const trimmed = name.trim();
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return Feature.findOne({ name: { $regex: new RegExp(`^${escaped}$`, 'i') } });
  }

  async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    const baseSlug = generateSlug(name) || 'feature';
    let candidate = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await Feature.findOne({ slug: candidate });
      if (!existing || (excludeId && existing._id.toString() === excludeId)) {
        return candidate;
      }
      candidate = `${baseSlug}-${counter}`;
      counter++;
    }
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
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Treat spaces and hyphens as interchangeable so "Power Adjustable"
      // still finds "Power-Adjustable Front Seats (14-Way)"
      const flexible = escaped.replace(/[\s-]+/g, '[\\s-]+');
      const slugNeedle = generateSlug(search);
      filter.$or = [
        { name: { $regex: flexible, $options: 'i' } },
        { description: { $regex: flexible, $options: 'i' } },
        ...(slugNeedle ? [{ slug: { $regex: slugNeedle, $options: 'i' } }] : []),
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
    const variantIdObj = new Types.ObjectId(data.variantId);
    const featureIdObj = new Types.ObjectId(data.featureId);

    if (data.availability === 'standard') {
      await Variant.findByIdAndUpdate(variantIdObj, {
        $addToSet: { 'features.standard': featureIdObj },
        $pull: { 'features.optional': featureIdObj },
      });
    } else if (data.availability === 'optional') {
      await Variant.findByIdAndUpdate(variantIdObj, {
        $addToSet: { 'features.optional': featureIdObj },
        $pull: { 'features.standard': featureIdObj },
      });
    } else if (data.availability === 'unavailable') {
      await Variant.findByIdAndUpdate(variantIdObj, {
        $pull: {
          'features.standard': featureIdObj,
          'features.optional': featureIdObj,
        },
      });
    }

    const featureDoc = await Feature.findById(data.featureId).lean();

    return {
      _id: featureDoc?._id || featureIdObj,
      variantId: variantIdObj,
      featureId: featureDoc || (featureIdObj as any),
      availability: data.availability,
      status: 'active',
    } as any;
  }

  async findById(id: string): Promise<IVariantFeature | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const featureDoc = await Feature.findById(id).lean();
    if (!featureDoc) return null;
    return {
      _id: featureDoc._id,
      variantId: new Types.ObjectId(),
      featureId: featureDoc,
      availability: 'standard',
      status: 'active',
    } as any;
  }

  async findByVariantAndFeature(
    variantId: string,
    featureId: string,
  ): Promise<IVariantFeature | null> {
    if (!Types.ObjectId.isValid(variantId) || !Types.ObjectId.isValid(featureId)) return null;
    const variant = await Variant.findById(variantId).lean();
    if (!variant) return null;

    const stdSet = new Set((variant.features?.standard || []).map((id: any) => id.toString()));
    const optSet = new Set((variant.features?.optional || []).map((id: any) => id.toString()));
    const fIdStr = featureId.toString();

    let availability: 'standard' | 'optional' | 'unavailable' = 'unavailable';
    if (stdSet.has(fIdStr)) availability = 'standard';
    else if (optSet.has(fIdStr)) availability = 'optional';

    const featureDoc = await Feature.findById(featureId).lean();
    if (!featureDoc) return null;

    return {
      _id: featureDoc._id,
      variantId: new Types.ObjectId(variantId),
      featureId: featureDoc,
      availability,
      status: 'active',
    } as any;
  }

  async count(filter: Record<string, any>): Promise<number> {
    return Feature.countDocuments(filter);
  }

  async findAll(query: VariantFeatureQuery): Promise<{ data: IVariantFeature[]; total: number }> {
    const { page = 1, limit = 10, variantId, availability } = query;
    if (variantId) {
      const allVariantFeatures = await this.findByVariantId(variantId);
      const filtered = availability
        ? allVariantFeatures.filter((f) => f.availability === availability)
        : allVariantFeatures;
      const skip = (page - 1) * limit;
      return {
        data: filtered.slice(skip, skip + limit),
        total: filtered.length,
      };
    }

    const skip = (page - 1) * limit;
    const variants = await Variant.find({
      $or: [
        { 'features.standard.0': { $exists: true } },
        { 'features.optional.0': { $exists: true } },
      ],
    }).lean();

    let all: IVariantFeature[] = [];
    for (const v of variants) {
      const vfList = await this.findByVariantId(v._id.toString());
      all.push(...vfList);
    }

    if (query.availability) {
      all = all.filter((f) => f.availability === query.availability);
    }

    return {
      data: all.slice(skip, skip + limit),
      total: all.length,
    };
  }

  async findByVariantId(variantId: string): Promise<IVariantFeature[]> {
    if (!Types.ObjectId.isValid(variantId)) return [];

    const [variant, masterFeatures] = await Promise.all([
      Variant.findById(variantId).lean(),
      Feature.find({ status: 'active' }).lean(),
    ]);

    if (!variant) return [];

    const stdSet = new Set((variant.features?.standard || []).map((id: any) => id.toString()));
    const optSet = new Set((variant.features?.optional || []).map((id: any) => id.toString()));

    const result: IVariantFeature[] = masterFeatures.map((fDoc: any) => {
      const fIdStr = fDoc._id.toString();
      let availability: 'standard' | 'optional' | 'unavailable' = 'unavailable';

      if (stdSet.has(fIdStr)) {
        availability = 'standard';
      } else if (optSet.has(fIdStr)) {
        availability = 'optional';
      }

      return {
        _id: fDoc._id,
        variantId: new Types.ObjectId(variantId),
        featureId: fDoc,
        availability,
        status: 'active',
      } as any;
    });

    return result;
  }

  async update(id: string, data: UpdateVariantFeatureDTO): Promise<IVariantFeature | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const featureDoc = await Feature.findById(id).lean();
    if (!featureDoc) return null;
    return {
      _id: featureDoc._id,
      variantId: new Types.ObjectId(),
      featureId: featureDoc,
      availability: data.availability || 'standard',
      status: 'active',
    } as any;
  }

  async delete(id: string): Promise<IVariantFeature | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const featureIdObj = new Types.ObjectId(id);
    await Variant.updateMany(
      {},
      {
        $pull: {
          'features.standard': featureIdObj,
          'features.optional': featureIdObj,
        },
      },
    );
    const featureDoc = await Feature.findById(id).lean();
    if (!featureDoc) return null;
    return {
      _id: featureDoc._id,
      variantId: new Types.ObjectId(),
      featureId: featureDoc,
      availability: 'unavailable',
      status: 'inactive',
    } as any;
  }

  async bulkUpsert(
    variantId: string,
    items: Array<{
      featureId: string;
      availability: 'standard' | 'optional' | 'unavailable';
      value?: string;
      status?: 'active' | 'inactive';
    }>,
  ): Promise<{ upserted: number; modified: number }> {
    if (items.length === 0) return { upserted: 0, modified: 0 };

    const variant = await Variant.findById(variantId).lean();
    if (!variant) return { upserted: 0, modified: 0 };

    const stdSet = new Set((variant.features?.standard || []).map((id: any) => id.toString()));
    const optSet = new Set((variant.features?.optional || []).map((id: any) => id.toString()));

    for (const item of items) {
      const fStr = item.featureId.toString();
      if (item.availability === 'standard') {
        stdSet.add(fStr);
        optSet.delete(fStr);
      } else if (item.availability === 'optional') {
        optSet.add(fStr);
        stdSet.delete(fStr);
      } else if (item.availability === 'unavailable') {
        stdSet.delete(fStr);
        optSet.delete(fStr);
      }
    }

    await Variant.findByIdAndUpdate(variantId, {
      'features.standard': Array.from(stdSet).map((id) => new Types.ObjectId(id)),
      'features.optional': Array.from(optSet).map((id) => new Types.ObjectId(id)),
    });

    return {
      upserted: items.length,
      modified: items.length,
    };
  }
}

export const featureRepository = new FeatureRepository();
export const variantFeatureRepository = new VariantFeatureRepository();
