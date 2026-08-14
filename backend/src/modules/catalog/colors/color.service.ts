import { AppError } from '../../../middlewares/error.middleware';
import { generateSlug } from '../../../utils/slug';
import { variantRepository } from '../variants/variant.repository';
import { colorRepository, variantColorRepository } from './color.repository';
import {
  CreateColorDTO,
  UpdateColorDTO,
  CreateVariantColorDTO,
  UpdateVariantColorDTO,
  ColorQuery,
  VariantColorQuery,
} from './color.types';

export class ColorService {
  async createColor(data: CreateColorDTO) {
    const slug = generateSlug(data.name);

    const existingColor = await colorRepository.findBySlug(slug);
    if (existingColor) {
      throw new AppError('Color with this name already exists', 409);
    }

    return colorRepository.create({ ...data, slug });
  }

  async getColors(query: ColorQuery) {
    return colorRepository.findAll(query);
  }

  async getColorById(id: string) {
    const color = await colorRepository.findById(id);
    if (!color) {
      throw new AppError('Color not found', 404);
    }
    return color;
  }

  async getColorBySlug(slug: string) {
    const color = await colorRepository.findBySlug(slug);
    if (!color) {
      throw new AppError('Color not found', 404);
    }
    return color;
  }

  async updateColor(id: string, data: UpdateColorDTO) {
    const color = await this.getColorById(id);

    let slug = color.slug;
    if (data.name && data.name !== color.name) {
      slug = generateSlug(data.name);
      const existingSlug = await colorRepository.findBySlug(slug);
      if (existingSlug && existingSlug._id.toString() !== id) {
        throw new AppError('Color with this name already exists', 409);
      }
    }

    const updatedColor = await colorRepository.update(id, { ...data, slug });
    if (!updatedColor) {
      throw new AppError('Color not found', 404);
    }
    return updatedColor;
  }

  async deleteColor(id: string) {
    const color = await colorRepository.delete(id);
    if (!color) {
      throw new AppError('Color not found', 404);
    }
    return color;
  }

  // VariantColor methods
  async createVariantColor(data: CreateVariantColorDTO) {
    // Validate variant exists
    const variant = await variantRepository.findById(data.variantId);
    if (!variant) {
      throw new AppError('Variant not found', 404);
    }

    // Validate color exists
    const color = await colorRepository.findById(data.colorId);
    if (!color) {
      throw new AppError('Color not found', 404);
    }

    // Check duplicate mapping
    const existingMapping = await variantColorRepository.findByVariantAndColor(
      data.variantId,
      data.colorId,
    );

    if (existingMapping) {
      throw new AppError('Color is already mapped to this variant', 409);
    }

    return variantColorRepository.create(data);
  }

  async getVariantColors(query: VariantColorQuery) {
    return variantColorRepository.findAll(query);
  }

  async getVariantColorById(id: string) {
    const variantColor = await variantColorRepository.findById(id);
    if (!variantColor) {
      throw new AppError('Variant color mapping not found', 404);
    }
    return variantColor;
  }

  async getColorsByVariantId(variantId: string) {
    const variant = await variantRepository.findById(variantId);
    if (!variant) {
      throw new AppError('Variant not found', 404);
    }

    return variantColorRepository.findByVariantId(variantId);
  }

  async updateVariantColor(id: string, data: UpdateVariantColorDTO) {
    const variantColor = await variantColorRepository.update(id, data);
    if (!variantColor) {
      throw new AppError('Variant color mapping not found', 404);
    }
    return variantColor;
  }

  async deleteVariantColor(id: string) {
    const variantColor = await variantColorRepository.delete(id);
    if (!variantColor) {
      throw new AppError('Variant color mapping not found', 404);
    }
    return variantColor;
  }
}

export const colorService = new ColorService();
