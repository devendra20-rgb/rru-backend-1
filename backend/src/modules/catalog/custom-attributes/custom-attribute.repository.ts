import { SortOrder } from 'mongoose';
import { CustomAttribute } from './custom-attribute.model';
import { ICustomAttribute, ICustomAttributeCreate, ICustomAttributeUpdate, ICustomAttributeQuery } from './custom-attribute.types';

export class CustomAttributeRepository {
  async create(data: ICustomAttributeCreate): Promise<ICustomAttribute> {
    const customAttribute = new CustomAttribute(data);
    return customAttribute.save();
  }

  async findById(id: string): Promise<ICustomAttribute | null> {
    return CustomAttribute.findById(id);
  }

  async findByKey(key: string): Promise<ICustomAttribute | null> {
    return CustomAttribute.findOne({ key });
  }

  async update(id: string, data: ICustomAttributeUpdate): Promise<ICustomAttribute | null> {
    return CustomAttribute.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<ICustomAttribute | null> {
    return CustomAttribute.findByIdAndDelete(id);
  }

  async findAll(query: ICustomAttributeQuery): Promise<{ customAttributes: ICustomAttribute[]; total: number; page: number; limit: number }> {
    const { search, status, appliesTo, page = 1, limit = 10, sortBy = 'sortOrder', sortOrder = 'asc' } = query;
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { key: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (appliesTo) {
      if (appliesTo === 'variant') {
        filter.appliesTo = { $in: ['variant', 'all'] };
      } else if (appliesTo === 'vehicle') {
        filter.appliesTo = { $in: ['vehicle', 'all'] };
      } else {
        filter.appliesTo = appliesTo;
      }
    }

    const sortOptions: { [key: string]: SortOrder } = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (page - 1) * limit;

    const [customAttributes, total] = await Promise.all([
      CustomAttribute.find(filter).sort(sortOptions).skip(skip).limit(limit),
      CustomAttribute.countDocuments(filter),
    ]);

    return {
      customAttributes,
      total,
      page,
      limit,
    };
  }
}

export const customAttributeRepository = new CustomAttributeRepository();
