import { AppError } from '../../../middlewares/error.middleware';
import { generateSlug } from '../../../utils/slug';
import { variantRepository } from '../variants/variant.repository';
import { featureRepository, variantFeatureRepository } from './feature.repository';
import {
  CreateFeatureDTO,
  UpdateFeatureDTO,
  CreateVariantFeatureDTO,
  UpdateVariantFeatureDTO,
  FeatureQuery,
  VariantFeatureQuery,
} from './feature.types';

export class FeatureService {
  async createFeature(data: CreateFeatureDTO) {
    const slug = generateSlug(data.name);

    const existingFeature = await featureRepository.findBySlug(slug);
    if (existingFeature) {
      throw new AppError('Feature with this name already exists', 409);
    }

    return featureRepository.create({ ...data, slug });
  }

  async getFeatures(query: FeatureQuery) {
    return featureRepository.findAll(query);
  }

  async getFeatureById(id: string) {
    const feature = await featureRepository.findById(id);
    if (!feature) {
      throw new AppError('Feature not found', 404);
    }
    return feature;
  }

  async getFeatureBySlug(slug: string) {
    const feature = await featureRepository.findBySlug(slug);
    if (!feature) {
      throw new AppError('Feature not found', 404);
    }
    return feature;
  }

  async updateFeature(id: string, data: UpdateFeatureDTO) {
    const feature = await this.getFeatureById(id);

    let slug = feature.slug;
    if (data.name && data.name !== feature.name) {
      slug = generateSlug(data.name);
      const existingSlug = await featureRepository.findBySlug(slug);
      if (existingSlug && existingSlug._id.toString() !== id) {
        throw new AppError('Feature with this name already exists', 409);
      }
    }

    const updatedFeature = await featureRepository.update(id, { ...data, slug });
    if (!updatedFeature) {
      throw new AppError('Feature not found', 404);
    }
    return updatedFeature;
  }

  async deleteFeature(id: string) {
    const feature = await featureRepository.delete(id);
    if (!feature) {
      throw new AppError('Feature not found', 404);
    }
    return feature;
  }

  // VariantFeature methods
  async createVariantFeature(data: CreateVariantFeatureDTO) {
    // Validate variant exists
    const variant = await variantRepository.findById(data.variantId);
    if (!variant) {
      throw new AppError('Variant not found', 404);
    }

    // Validate feature exists
    const feature = await featureRepository.findById(data.featureId);
    if (!feature) {
      throw new AppError('Feature not found', 404);
    }

    // Check duplicate mapping
    const existingMapping = await variantFeatureRepository.findByVariantAndFeature(
      data.variantId,
      data.featureId,
    );

    if (existingMapping) {
      throw new AppError('Feature is already mapped to this variant', 409);
    }

    return variantFeatureRepository.create(data);
  }

  async getVariantFeatures(query: VariantFeatureQuery) {
    return variantFeatureRepository.findAll(query);
  }

  async getVariantFeatureById(id: string) {
    const variantFeature = await variantFeatureRepository.findById(id);
    if (!variantFeature) {
      throw new AppError('Variant feature mapping not found', 404);
    }
    return variantFeature;
  }

  async getFeaturesByVariantId(variantId: string) {
    const variant = await variantRepository.findById(variantId);
    if (!variant) {
      throw new AppError('Variant not found', 404);
    }

    return variantFeatureRepository.findByVariantId(variantId);
  }

  async updateVariantFeature(id: string, data: UpdateVariantFeatureDTO) {
    const variantFeature = await variantFeatureRepository.update(id, data);
    if (!variantFeature) {
      throw new AppError('Variant feature mapping not found', 404);
    }
    return variantFeature;
  }

  async deleteVariantFeature(id: string) {
    const variantFeature = await variantFeatureRepository.delete(id);
    if (!variantFeature) {
      throw new AppError('Variant feature mapping not found', 404);
    }
    return variantFeature;
  }
}

export const featureService = new FeatureService();
