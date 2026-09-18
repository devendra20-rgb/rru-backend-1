import { variantRepository } from './variant.repository';
import { IVariant } from './variant.types';
import { generationRepository } from '../generations/generation.repository';
import { modelRepository } from '../models/model.repository';
import { brandRepository } from '../brands/brand.repository';
import { Specification } from '../specifications/specification.model';
import { VariantFeature } from '../features/feature.model';
import { VariantColor } from '../colors/color.model';
import { VariantMarket } from '../variant-markets/variant-market.model';
import { Media } from '../../media/media.model';
import { AppError } from '../../../middlewares/error.middleware';
import { Types } from 'mongoose';
import { generateSlug } from '../../../utils/slug';
import {
  getPaginationOptions,
  getPaginationMeta,
  PaginationQuery,
} from '../../../utils/pagination';

const idOf = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'object' && value !== null && '_id' in value) {
    return String((value as { _id: unknown })._id);
  }
  const asString = String(value);
  return asString && asString !== '[object Object]' ? asString : null;
};

const resolveModelForVariant = async (variant: any, generation: any) => {
  // Prefer generation→model when present; otherwise use variant.modelId
  // (many vehicles are saved without a generation).
  const modelId = idOf(generation?.modelId) || idOf(variant?.modelId);
  return modelId ? modelRepository.findById(modelId) : null;
};

export const variantService = {
  async generateUniqueVariantCode(modelId: string, name: string, modelYear?: number) {
    let baseModelName = 'MDL';
    if (modelId) {
      const model = await modelRepository.findById(modelId);
      if (model) {
        baseModelName = model.name.split(' ')[0].toUpperCase();
      }
    }
    
    const trim = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 10);
    const yearPart = modelYear ? modelYear.toString().slice(-2) : new Date().getFullYear().toString().slice(-2);
    
    const baseCode = `${baseModelName}-${trim}-${yearPart}`;
    
    let isUnique = false;
    let suffix = 0;
    let finalCode = baseCode;
    
    while (!isUnique) {
      const exists = await variantRepository.existsByVariantCode(finalCode);
      if (!exists) {
        isUnique = true;
      } else {
        suffix++;
        finalCode = `${baseCode}-${suffix}`;
      }
    }
    
    return finalCode;
  },

  async createVariant(data: Partial<IVariant>) {
    let generationId = data.generationId?.toString() || null;
    let modelId = data.modelId?.toString();
    let variantCode = data.variantCode?.toUpperCase().trim();
    const name = data.name?.trim();
    const slug = data.slug ? generateSlug(data.slug) : generateSlug(name || '');

    if (!modelId && generationId) {
      const generationExists = await generationRepository.findById(generationId);
      if (!generationExists) {
        throw new AppError('Referenced Generation does not exist', 404);
      }
      modelId = generationExists.modelId.toString();
    } else if (generationId && modelId) {
      const generationExists = await generationRepository.findById(generationId);
      if (!generationExists) {
        throw new AppError('Referenced Generation does not exist', 404);
      }
    }

    if (!modelId || !name) {
      throw new AppError('modelId and name are required', 400);
    }

    if (!variantCode) {
      variantCode = await this.generateUniqueVariantCode(modelId, name, data.modelYear);
    } else {
      if (await variantRepository.existsByVariantCode(variantCode)) {
        throw new AppError(`Variant code '${variantCode}' already exists`, 409);
      }
    }

    if (await variantRepository.existsByNameAndModelOrGeneration(name, modelId, generationId)) {
      throw new AppError(`Variant name '${name}' already exists for this model/generation`, 409);
    }
    if (await variantRepository.existsBySlug(slug)) {
      throw new AppError(`Variant slug '${slug}' already exists`, 409);
    }

    return variantRepository.create({
      ...data,
      modelId: new Types.ObjectId(modelId) as any,
      generationId: generationId ? new Types.ObjectId(generationId) as any : null,
      variantCode,
      name,
      slug,
    });
  },

  async getVariants(
    query: PaginationQuery & {
      status?: string;
      generationId?: string;
      modelId?: string;
      brandId?: string;
      fuelType?: string;
      transmissionType?: string;
      drivetrain?: string;
      modelYear?: number;
    },
  ) {
    const { page, limit, skip, sort } = getPaginationOptions(query);

    const filter: Record<string, any> = {};

    if (query.search) {
      const searchRx = { $regex: query.search, $options: 'i' };

      // Resolve model IDs matching the search term (by model name)
      const matchingModels = await modelRepository.findMany({ name: searchRx }, 0, 10000, { _id: 1 });
      const matchingModelIds = matchingModels.map((m) => m._id);

      // Resolve generation IDs matching the search term (by generation name)
      const matchingGenerations = await generationRepository.findMany(
        { name: searchRx },
        0,
        10000,
        { _id: 1 },
      );
      const matchingGenerationIds = matchingGenerations.map((g) => g._id);

      // Resolve model IDs for brands whose name matches the search term
      const matchingBrands = await brandRepository.findMany({ name: searchRx }, 0, 10000, { _id: 1 });
      const matchingBrandIds = matchingBrands.map((b) => b._id);
      const modelsForBrands =
        matchingBrandIds.length > 0
          ? await modelRepository.findMany({ brandId: { $in: matchingBrandIds } }, 0, 10000, { _id: 1 })
          : [];

      // Combine all resolved model IDs (de-duplicated)
      const allModelIdStrings = [
        ...matchingModelIds.map(String),
        ...modelsForBrands.map((m) => String(m._id)),
      ];
      const uniqueModelIds = [...new Set(allModelIdStrings)];

      filter.$or = [
        { name: searchRx },
        { variantCode: searchRx },
        ...(uniqueModelIds.length > 0 ? [{ modelId: { $in: uniqueModelIds } }] : []),
        ...(matchingGenerationIds.length > 0 ? [{ generationId: { $in: matchingGenerationIds } }] : []),
      ];
    }
    if (query.status) filter.status = query.status;
    if (query.fuelType) filter.fuelType = query.fuelType;
    if (query.transmissionType) filter.transmissionType = query.transmissionType;
    if (query.drivetrain) filter.drivetrain = query.drivetrain;
    if (query.modelYear) filter.modelYear = query.modelYear;

    // Hierarchical filtering
    if (query.generationId) {
      filter.generationId = query.generationId;
    } else if (query.modelId) {
      filter.modelId = query.modelId;
    } else if (query.brandId) {
      const models = await modelRepository.findMany({ brandId: query.brandId }, 0, 10000, {
        _id: 1,
      });
      const modelIds = models.map((m) => m._id);
      filter.modelId = { $in: modelIds };
    }

    const [data, total] = await Promise.all([
      variantRepository.findMany(filter, skip, limit, sort),
      variantRepository.count(filter),
    ]);

    return {
      data,
      meta: getPaginationMeta(total, page, limit),
    };
  },

  async getVariantById(id: string) {
    const variant = await variantRepository.findById(id);
    if (!variant) throw new AppError('Variant not found', 404);

    // Fetch parent context
    // `variant.generationId` may be either an ObjectId string or a populated object.
    let generation = null;
    try {
      const generationId = idOf(variant.generationId);
      generation = generationId ? await generationRepository.findById(generationId) : null;
    } catch (err) {
      // If cast fails or unexpected shape, leave generation as null but do not crash
      generation = null;
    }

    const model = await resolveModelForVariant(variant, generation);

    return {
      ...variant,
      generation,
      model,
    };
  },

  async getVariantBySlug(slug: string) {
    const variant = await variantRepository.findBySlug(slug);
    if (!variant) throw new AppError('Variant not found', 404);

    let generation = null;
    try {
      const generationId = idOf(variant.generationId);
      generation = generationId ? await generationRepository.findById(generationId) : null;
    } catch (err) {
      generation = null;
    }

    const model = await resolveModelForVariant(variant, generation);

    return {
      ...variant,
      generation,
      model,
    };
  },

  async updateVariant(id: string, data: Partial<IVariant>) {
    const variant = await variantRepository.findById(id);
    if (!variant) throw new AppError('Variant not found', 404);

    const updateData: Partial<IVariant> = { ...data };

    if (data.generationId) {
      const generationExists = await generationRepository.findById(data.generationId.toString());
      if (!generationExists) {
        throw new AppError('Referenced Generation does not exist', 404);
      }
    }
    
    const currentGenerationId = data.generationId === null ? null : (data.generationId
      ? data.generationId.toString()
      : ((variant.generationId as any)?._id
        ? (variant.generationId as any)._id.toString()
        : (variant.generationId as any)?.toString() || null));
        
    const currentModelId = data.modelId 
      ? data.modelId.toString()
      : ((variant.modelId as any)?._id
        ? (variant.modelId as any)._id.toString()
        : (variant.modelId as any)?.toString());

    if (data.variantCode) {
      updateData.variantCode = data.variantCode.toUpperCase().trim();
      if (await variantRepository.existsByVariantCode(updateData.variantCode, id)) {
        throw new AppError(`Variant code '${updateData.variantCode}' already exists`, 409);
      }
    }

    if (data.name) {
      updateData.name = data.name.trim();
      if (
        await variantRepository.existsByNameAndModelOrGeneration(updateData.name, currentModelId, currentGenerationId, id)
      ) {
        throw new AppError(
          `Variant name '${updateData.name}' already exists for this model/generation`,
          409,
        );
      }
    }

    if (data.slug || updateData.name) {
      updateData.slug = data.slug
        ? generateSlug(data.slug)
        : generateSlug(updateData.name || variant.name);
      if (await variantRepository.existsBySlug(updateData.slug, id)) {
        throw new AppError(`Variant slug '${updateData.slug}' already exists`, 409);
      }
    }

    const updated = await variantRepository.update(id, updateData);
    return updated;
  },

  async deleteVariant(id: string) {
    const variant = await variantRepository.findById(id);
    if (!variant) throw new AppError('Variant not found', 404);

    // Cascade-delete all child records, then remove the variant itself.
    await Promise.all([
      Specification.deleteMany({ variantId: id }),
      VariantFeature.deleteMany({ variantId: id }),
      VariantColor.deleteMany({ variantId: id }),
      VariantMarket.deleteMany({ variantId: id }),
      // Media: soft-deactivate so uploaded files can be cleaned up separately
      Media.updateMany({ entityId: id }, { status: 'inactive' }),
    ]);

    return variantRepository.deleteById(id);
  },
};
