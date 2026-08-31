import { generationRepository } from './generation.repository';
import { IGeneration } from './generation.types';
import { modelRepository } from '../models/model.repository';
import { AppError } from '../../../middlewares/error.middleware';
import { generateSlug } from '../../../utils/slug';
import {
  getPaginationOptions,
  getPaginationMeta,
  PaginationQuery,
} from '../../../utils/pagination';
import { variantRepository } from '../variants/variant.repository';

export const generationService = {
  async createGeneration(data: Partial<IGeneration>) {
    const modelId = data.modelId?.toString();
    const generationCode = data.generationCode?.toUpperCase().trim();
    const name = data.name?.trim();
    const slug = data.slug ? generateSlug(data.slug) : generateSlug(name || '');

    if (!modelId || !generationCode || !name) {
      throw new AppError('modelId, generationCode, and name are required', 400);
    }

    const modelExists = await modelRepository.findById(modelId);
    if (!modelExists) {
      throw new AppError('Referenced Model does not exist', 404);
    }

    if (await generationRepository.existsByGenerationCode(generationCode)) {
      throw new AppError(`Generation code '${generationCode}' already exists`, 409);
    }
    if (await generationRepository.existsByNameAndModel(name, modelId)) {
      throw new AppError(`Generation name '${name}' already exists for this model`, 409);
    }
    if (await generationRepository.existsBySlug(slug)) {
      throw new AppError(`Generation slug '${slug}' already exists`, 409);
    }

    return generationRepository.create({
      ...data,
      generationCode,
      name,
      slug,
    });
  },

  async getGenerations(query: PaginationQuery & { status?: string; modelId?: string; brandId?: string }) {
    const { page, limit, skip, sort } = getPaginationOptions(query);

    const filter: Record<string, any> = {};
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { generationCode: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.status) filter.status = query.status;

    // Hierarchical filtering: modelId > brandId
    if (query.modelId) {
      filter.modelId = query.modelId;
    } else if (query.brandId) {
      const models = await modelRepository.findMany({ brandId: query.brandId }, 0, 10000, { _id: 1 });
      const modelIds = models.map((m) => m._id);
      filter.modelId = { $in: modelIds };
    }

    const [data, total] = await Promise.all([
      generationRepository.findMany(filter, skip, limit, sort),
      generationRepository.count(filter),
    ]);

    return {
      data,
      meta: getPaginationMeta(total, page, limit),
    };
  },

  async getGenerationById(id: string) {
    const generation = await generationRepository.findById(id);
    if (!generation) throw new AppError('Generation not found', 404);
    return generation;
  },

  async getGenerationBySlug(slug: string) {
    const generation = await generationRepository.findBySlug(slug);
    if (!generation) throw new AppError('Generation not found', 404);
    return generation;
  },

  async updateGeneration(id: string, data: Partial<IGeneration>) {
    const generation = await generationRepository.findById(id);
    if (!generation) throw new AppError('Generation not found', 404);

    const updateData: Partial<IGeneration> = { ...data };

    if (data.modelId) {
      const modelExists = await modelRepository.findById(data.modelId.toString());
      if (!modelExists) {
        throw new AppError('Referenced Model does not exist', 404);
      }
    }

    const currentModelId = data.modelId
      ? data.modelId.toString()
      : ((generation.modelId as any)?._id
        ? (generation.modelId as any)._id.toString()
        : (generation.modelId as any)?.toString());

    if (data.generationCode) {
      updateData.generationCode = data.generationCode.toUpperCase().trim();
      if (await generationRepository.existsByGenerationCode(updateData.generationCode, id)) {
        throw new AppError(`Generation code '${updateData.generationCode}' already exists`, 409);
      }
    }

    if (data.name) {
      updateData.name = data.name.trim();
      if (await generationRepository.existsByNameAndModel(updateData.name, currentModelId, id)) {
        throw new AppError(
          `Generation name '${updateData.name}' already exists for this model`,
          409,
        );
      }
    }

    if (data.slug || updateData.name) {
      updateData.slug = data.slug
        ? generateSlug(data.slug)
        : generateSlug(updateData.name || generation.name);
      if (await generationRepository.existsBySlug(updateData.slug, id)) {
        throw new AppError(`Generation slug '${updateData.slug}' already exists`, 409);
      }
    }

    const updated = await generationRepository.update(id, updateData);
    return updated;
  },

  async deleteGeneration(id: string) {
    const generation = await generationRepository.findById(id);
    if (!generation) throw new AppError('Generation not found', 404);

    // Dependency check for Variants
    const hasVariants = await variantRepository.count({ generationId: id });
    if (hasVariants > 0) {
      throw new AppError('Cannot delete generation because it has associated variants', 409);
    }

    return generationRepository.updateStatus(id, 'inactive');
  },
};
