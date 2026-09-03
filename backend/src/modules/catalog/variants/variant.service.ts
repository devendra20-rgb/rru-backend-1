import { variantRepository } from './variant.repository';
import { IVariant } from './variant.types';
import { generationRepository } from '../generations/generation.repository';
import { modelRepository } from '../models/model.repository';
import { AppError } from '../../../middlewares/error.middleware';
import { Types } from 'mongoose';
import { generateSlug } from '../../../utils/slug';
import {
  getPaginationOptions,
  getPaginationMeta,
  PaginationQuery,
} from '../../../utils/pagination';

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
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { variantCode: { $regex: query.search, $options: 'i' } },
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
      const generations = await generationRepository.findMany(
        { modelId: query.modelId },
        0,
        10000,
        { _id: 1 },
      );
      const generationIds = generations.map((g) => g._id);
      filter.generationId = { $in: generationIds };
    } else if (query.brandId) {
      const models = await modelRepository.findMany({ brandId: query.brandId }, 0, 10000, {
        _id: 1,
      });
      const modelIds = models.map((m) => m._id);
      const generations = await generationRepository.findMany(
        { modelId: { $in: modelIds } },
        0,
        10000,
        { _id: 1 },
      );
      const generationIds = generations.map((g) => g._id);
      filter.generationId = { $in: generationIds };
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
      const generationId = (variant.generationId as any)?._id
        ? (variant.generationId as any)._id.toString()
        : (variant.generationId as any)?.toString();

      generation = generationId ? await generationRepository.findById(generationId) : null;
    } catch (err) {
      // If cast fails or unexpected shape, leave generation as null but do not crash
      generation = null;
    }

    const modelId = generation
      ? ((generation.modelId as any)?._id
        ? (generation.modelId as any)._id.toString()
        : (generation.modelId as any)?.toString())
      : null;
    const model = modelId ? await modelRepository.findById(modelId) : null;

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
      const generationId = (variant.generationId as any)?._id
        ? (variant.generationId as any)._id.toString()
        : (variant.generationId as any)?.toString();

      generation = generationId ? await generationRepository.findById(generationId) : null;
    } catch (err) {
      generation = null;
    }

    const modelId = generation
      ? ((generation.modelId as any)?._id
        ? (generation.modelId as any)._id.toString()
        : (generation.modelId as any)?.toString())
      : null;
    const model = modelId ? await modelRepository.findById(modelId) : null;

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

    // Dependency check for future modules will go here.
    return variantRepository.updateStatus(id, 'inactive');
  },
};
