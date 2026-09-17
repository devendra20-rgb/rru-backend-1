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

function createColorSlug(name: string, finishType?: string): string {
  const baseSlug = generateSlug(name);
  if (!finishType || !finishType.trim()) return baseSlug;
  const finishSlug = generateSlug(finishType.trim());
  return finishSlug && !baseSlug.endsWith(finishSlug)
    ? `${baseSlug}-${finishSlug}`
    : baseSlug;
}

export class ColorService {
  async createColor(data: CreateColorDTO) {
    const slug = createColorSlug(data.name, data.finishType);

    const existingColor = await colorRepository.findBySlug(slug);
    if (existingColor) {
      throw new AppError('A color with this name and finish type already exists', 409);
    }

    const payload: CreateColorDTO & { slug: string } = {
      ...data,
      slug,
    };

    if (data.colorCode && data.colorCode.trim()) {
      payload.colorCode = data.colorCode.trim().toUpperCase();
      const existingCode = await colorRepository.findByColorCode(payload.colorCode);
      if (existingCode) {
        throw new AppError(`Color code '${payload.colorCode}' already exists`, 409);
      }
    } else {
      delete payload.colorCode;
    }

    return colorRepository.create(payload);
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

    const newName = data.name !== undefined ? data.name : color.name;
    const newFinish = data.finishType !== undefined ? data.finishType : color.finishType;

    let slug = color.slug;
    if (data.name !== undefined || data.finishType !== undefined) {
      slug = createColorSlug(newName, newFinish);
      const existingSlug = await colorRepository.findBySlug(slug);
      if (existingSlug && existingSlug._id.toString() !== id) {
        throw new AppError('A color with this name and finish type already exists', 409);
      }
    }

    const updatePayload: UpdateColorDTO & { slug?: string } = { ...data, slug };

    if (data.colorCode !== undefined) {
      if (data.colorCode && data.colorCode.trim()) {
        updatePayload.colorCode = data.colorCode.trim().toUpperCase();
        const existingCode = await colorRepository.findByColorCode(updatePayload.colorCode);
        if (existingCode && existingCode._id.toString() !== id) {
          throw new AppError(`Color code '${updatePayload.colorCode}' already exists`, 409);
        }
      } else {
        updatePayload.colorCode = undefined;
      }
    }

    const updatedColor = await colorRepository.update(id, updatePayload);
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

  async bulkUpsertVariantColors(
    variantId: string,
    items: Array<{
      colorId: string;
      availability: 'standard' | 'optional' | 'unavailable';
      status?: 'active' | 'inactive';
    }>,
  ) {
    // Validate variant exists once — not N times
    const variant = await variantRepository.findById(variantId);
    if (!variant) {
      throw new AppError('Variant not found', 404);
    }

    if (!items || items.length === 0) {
      return { upserted: 0, modified: 0 };
    }

    return variantColorRepository.bulkUpsert(variantId, items);
  }
}

export const colorService = new ColorService();
