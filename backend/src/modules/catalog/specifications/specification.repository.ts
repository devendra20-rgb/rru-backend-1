import { Specification } from './specification.model';
import {
  ISpecificationCreate,
  ISpecificationUpdate,
  ISpecificationQuery,
} from './specification.types';

class SpecificationRepository {
  async create(data: ISpecificationCreate) {
    const specification = new Specification(data);
    return await specification.save();
  }

  async update(id: string, data: ISpecificationUpdate) {
    return await Specification.findByIdAndUpdate(id, data, { new: true });
  }

  async getById(id: string) {
    return await Specification.findById(id);
  }

  async getByVariantId(variantId: string) {
    return await Specification.findOne({ variantId, status: 'active' });
  }

  async getAll(query: ISpecificationQuery) {
    const filter: any = { status: 'active' };

    if (query.variantId) {
      filter.variantId = query.variantId;
    }

    if (query.status) {
      filter.status = query.status;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const sort: any = {};
    if (query.sortBy) {
      sort[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const [data, total] = await Promise.all([
      Specification.find(filter).sort(sort).skip(skip).limit(limit),
      Specification.countDocuments(filter),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async delete(id: string) {
    return await Specification.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
  }

  async exists(variantId: string) {
    const count = await Specification.countDocuments({ variantId });
    return count > 0;
  }
}

export const specificationRepository = new SpecificationRepository();
