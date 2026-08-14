import { variantRepository } from './variant.repository';
import { IVariant } from './variant.types';
import { generationRepository } from '../generations/generation.repository';
import { modelRepository } from '../models/model.repository';
import { AppError } from '../../../middlewares/error.middleware';
import { generateSlug } from '../../../utils/slug';
import {
  getPaginationOptions,
  getPaginationMeta,
  PaginationQuery,
} from '../../../utils/pagination';

export const variantService = {
  async createVariant(data: Partial<IVariant>) {
    const generationId = data.generationId?.toString();
    const variantCode = data.variantCode?.toUpperCase().trim();
    const name = data.name?.trim();
    const slug = data.slug ? generateSlug(data.slug) : generateSlug(name || '');

    if (!generationId || !variantCode || !name) {
      throw new AppError('generationId, variantCode, and name are required', 400);
    }

    const generationExists = await generationRepository.findById(generationId);
    if (!generationExists) {
      throw new AppError('Referenced Generation does not exist', 404);
    }

    if (await variantRepository.existsByVariantCode(variantCode)) {
      throw new AppError(`Variant code '${variantCode}' already exists`, 409);
    }
    if (await variantRepository.existsByNameAndGeneration(name, generationId)) {
      throw new AppError(`Variant name '${name}' already exists for this generation`, 409);
    }
    if (await variantRepository.existsBySlug(slug)) {
      throw new AppError(`Variant slug '${slug}' already exists`, 409);
    }

    return variantRepository.create({
      ...data,
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
    const generation = await generationRepository.findById(variant.generationId.toString());
    const model = generation ? await modelRepository.findById(generation.modelId.toString()) : null;

    return {
      ...variant,
      generation,
      model,
    };
  },

  async getVariantBySlug(slug: string) {
    const variant = await variantRepository.findBySlug(slug);
    if (!variant) throw new AppError('Variant not found', 404);

    const generation = await generationRepository.findById(variant.generationId.toString());
    const model = generation ? await modelRepository.findById(generation.modelId.toString()) : null;

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

    const currentGenerationId = data.generationId
      ? data.generationId.toString()
      : variant.generationId.toString();

    if (data.variantCode) {
      updateData.variantCode = data.variantCode.toUpperCase().trim();
      if (await variantRepository.existsByVariantCode(updateData.variantCode, id)) {
        throw new AppError(`Variant code '${updateData.variantCode}' already exists`, 409);
      }
    }

    if (data.name) {
      updateData.name = data.name.trim();
      if (
        await variantRepository.existsByNameAndGeneration(updateData.name, currentGenerationId, id)
      ) {
        throw new AppError(
          `Variant name '${updateData.name}' already exists for this generation`,
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
