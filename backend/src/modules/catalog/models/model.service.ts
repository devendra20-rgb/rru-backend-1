import { modelRepository } from './model.repository';
import { IModel } from './model.types';
import { brandRepository } from '../brands/brand.repository';
import { AppError } from '../../../middlewares/error.middleware';
import { generateSlug } from '../../../utils/slug';
import {
  getPaginationOptions,
  getPaginationMeta,
  PaginationQuery,
} from '../../../utils/pagination';

export const modelService = {
  async createModel(data: Partial<IModel>) {
    const brandId = data.brandId?.toString();
    const modelCode = data.modelCode?.toUpperCase().trim();
    const name = data.name?.trim();
    const slug = data.slug ? generateSlug(data.slug) : generateSlug(name || '');

    if (!brandId || !modelCode || !name) {
      throw new AppError('brandId, modelCode, and name are required', 400);
    }

    const brandExists = await brandRepository.findById(brandId);
    if (!brandExists) {
      throw new AppError('Referenced Brand does not exist', 404);
    }

    if (await modelRepository.existsByModelCode(modelCode)) {
      throw new AppError(`Model code '${modelCode}' already exists`, 409);
    }
    if (await modelRepository.existsByNameAndBrand(name, brandId)) {
      throw new AppError(`Model name '${name}' already exists for this brand`, 409);
    }
    if (await modelRepository.existsBySlug(slug)) {
      throw new AppError(`Model slug '${slug}' already exists`, 409);
    }

    return modelRepository.create({
      ...data,
      modelCode,
      name,
      slug,
    });
  },

  async getModels(
    query: PaginationQuery & {
      status?: string;
      brandId?: string;
      bodyType?: string;
      segment?: string;
    },
  ) {
    const { page, limit, skip, sort } = getPaginationOptions(query);

    const filter: Record<string, any> = {};
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { modelCode: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.status) filter.status = query.status;
    if (query.brandId) filter.brandId = query.brandId;
    if (query.bodyType) filter.bodyType = query.bodyType;
    if (query.segment) filter.segment = query.segment;

    const [data, total] = await Promise.all([
      modelRepository.findMany(filter, skip, limit, sort),
      modelRepository.count(filter),
    ]);

    return {
      data,
      meta: getPaginationMeta(total, page, limit),
    };
  },

  async getModelById(id: string) {
    const model = await modelRepository.findById(id);
    if (!model) throw new AppError('Model not found', 404);
    return model;
  },

  async getModelBySlug(slug: string) {
    const model = await modelRepository.findBySlug(slug);
    if (!model) throw new AppError('Model not found', 404);
    return model;
  },

  async updateModel(id: string, data: Partial<IModel>) {
    const model = await modelRepository.findById(id);
    if (!model) throw new AppError('Model not found', 404);

    const updateData: Partial<IModel> = { ...data };

    if (data.brandId) {
      const brandExists = await brandRepository.findById(data.brandId.toString());
      if (!brandExists) {
        throw new AppError('Referenced Brand does not exist', 404);
      }
    }

    const currentBrandId = data.brandId
      ? data.brandId.toString()
      : ((model.brandId as any)?._id
        ? (model.brandId as any)._id.toString()
        : (model.brandId as any)?.toString());

    if (data.modelCode) {
      updateData.modelCode = data.modelCode.toUpperCase().trim();
      if (await modelRepository.existsByModelCode(updateData.modelCode, id)) {
        throw new AppError(`Model code '${updateData.modelCode}' already exists`, 409);
      }
    }

    if (data.name) {
      updateData.name = data.name.trim();
      if (await modelRepository.existsByNameAndBrand(updateData.name, currentBrandId, id)) {
        throw new AppError(`Model name '${updateData.name}' already exists for this brand`, 409);
      }
    }

    if (data.slug || updateData.name) {
      updateData.slug = data.slug
        ? generateSlug(data.slug)
        : generateSlug(updateData.name || model.name);
      if (await modelRepository.existsBySlug(updateData.slug, id)) {
        throw new AppError(`Model slug '${updateData.slug}' already exists`, 409);
      }
    }

    const updated = await modelRepository.update(id, updateData);
    return updated;
  },

  async deleteModel(id: string) {
    const model = await modelRepository.findById(id);
    if (!model) throw new AppError('Model not found', 404);

    // Dependency check for Generations will go here once Generations are added.
    // We'll perform a soft delete or set to draft.
    return modelRepository.updateStatus(id, 'inactive');
  },
};
