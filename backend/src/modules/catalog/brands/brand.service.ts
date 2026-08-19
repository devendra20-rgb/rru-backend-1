import { brandRepository } from './brand.repository';
import { IBrand } from './brand.types';
import { AppError } from '../../../middlewares/error.middleware';
import { generateSlug } from '../../../utils/slug';
import {
  getPaginationOptions,
  getPaginationMeta,
  PaginationQuery,
} from '../../../utils/pagination';
import { mediaService } from '../../media/media.service';

const enrichBrandMedia = (brand: any) => {
  if (brand?.logoMediaId && typeof brand.logoMediaId === 'object') {
    brand.logoMediaId = mediaService.enrichMediaWithUrl(brand.logoMediaId);
  }
  return brand;
};

export const brandService = {
  async createBrand(data: Partial<IBrand>) {
    const brandCode = data.brandCode?.toUpperCase().trim();
    const name = data.name?.trim();
    const slug = data.slug ? generateSlug(data.slug) : generateSlug(name || '');

    if (!brandCode || !name) {
      throw new AppError('Brand code and name are required', 400);
    }

    if (await brandRepository.existsByBrandCode(brandCode)) {
      throw new AppError(`Brand code '${brandCode}' already exists`, 409);
    }
    if (await brandRepository.existsByName(name)) {
      throw new AppError(`Brand name '${name}' already exists`, 409);
    }
    if (await brandRepository.existsBySlug(slug)) {
      throw new AppError(`Brand slug '${slug}' already exists`, 409);
    }

    return brandRepository.create({
      ...data,
      brandCode,
      name,
      slug,
      originCountryCode: data.originCountryCode?.toUpperCase(),
    });
  },

  async getBrands(query: PaginationQuery & { status?: string }) {
    const { page, limit, skip, sort } = getPaginationOptions(query);

    const filter: Record<string, any> = {};
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { brandCode: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.status) {
      filter.status = query.status;
    }

    const [data, total] = await Promise.all([
      brandRepository.findMany(filter, skip, limit, sort),
      brandRepository.count(filter),
    ]);

    return {
      data: data.map(enrichBrandMedia),
      meta: getPaginationMeta(total, page, limit),
    };
  },

  async getBrandById(id: string) {
    const brand = await brandRepository.findById(id);
    if (!brand) throw new AppError('Brand not found', 404);
    return enrichBrandMedia(brand);
  },

  async getBrandBySlug(slug: string) {
    const brand = await brandRepository.findBySlug(slug);
    if (!brand) throw new AppError('Brand not found', 404);
    return enrichBrandMedia(brand);
  },

  async updateBrand(id: string, data: Partial<IBrand>) {
    const brand = await brandRepository.findById(id);
    if (!brand) throw new AppError('Brand not found', 404);

    const updateData: Partial<IBrand> = { ...data };

    if (data.brandCode) {
      updateData.brandCode = data.brandCode.toUpperCase().trim();
      if (await brandRepository.existsByBrandCode(updateData.brandCode, id)) {
        throw new AppError(`Brand code '${updateData.brandCode}' already exists`, 409);
      }
    }

    if (data.name) {
      updateData.name = data.name.trim();
      if (await brandRepository.existsByName(updateData.name, id)) {
        throw new AppError(`Brand name '${updateData.name}' already exists`, 409);
      }
    }

    if (data.slug || updateData.name) {
      updateData.slug = data.slug
        ? generateSlug(data.slug)
        : generateSlug(updateData.name || brand.name);
      if (await brandRepository.existsBySlug(updateData.slug, id)) {
        throw new AppError(`Brand slug '${updateData.slug}' already exists`, 409);
      }
    }

    if (data.originCountryCode) {
      updateData.originCountryCode = data.originCountryCode.toUpperCase();
    }

    const updated = await brandRepository.update(id, updateData);
    return updated;
  },

  async deleteBrand(id: string) {
    const brand = await brandRepository.findById(id);
    if (!brand) throw new AppError('Brand not found', 404);

    // Dependency check for Models will go here once Models are added.
    // For now, we perform a soft delete.
    return brandRepository.updateStatus(id, 'inactive');
  },
};
