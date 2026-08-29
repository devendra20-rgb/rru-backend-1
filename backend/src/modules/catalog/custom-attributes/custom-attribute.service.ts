import { SortOrder } from 'mongoose';
import { CustomAttribute } from './custom-attribute.model';
import { GetCustomAttributesQuery, ICustomAttribute } from './custom-attribute.types';
import { AppError } from '../../../middlewares/error.middleware';
import { Specification } from '../specifications/specification.model';

export class CustomAttributeService {
  static async getCustomAttributes(query: GetCustomAttributesQuery) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      appliesTo, 
      isActive,
      type,
      sortBy = 'sortOrder',
      sortOrder = 'asc' 
    } = query;
    
    const skip = (page - 1) * limit;
    
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { key: { $regex: search, $options: 'i' } }
      ];
    }
    if (appliesTo) {
      filter.appliesTo = appliesTo;
    }
    if (isActive !== undefined) {
      filter.isActive = String(isActive) === 'true';
    }
    if (type) {
      filter.type = type;
    }

    const sort: { [key: string]: SortOrder } = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [attributes, total] = await Promise.all([
      CustomAttribute.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      CustomAttribute.countDocuments(filter)
    ]);

    return {
      data: attributes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getCustomAttributeById(id: string) {
    const attribute = await CustomAttribute.findById(id).lean();
    if (!attribute) {
      throw new AppError('Custom attribute not found', 404);
    }
    return attribute;
  }

  static async createCustomAttribute(data: any) {
    // Check if key already exists
    const existing = await CustomAttribute.findOne({ key: data.key });
    if (existing) {
      throw new AppError('Attribute key already exists', 409);
    }
    
    const attribute = new CustomAttribute(data);
    await attribute.save();
    return attribute;
  }

  static async updateCustomAttribute(id: string, data: any) {
    if (data.key) {
      const existing = await CustomAttribute.findOne({ key: data.key, _id: { $ne: id } });
      if (existing) {
        throw new AppError('Attribute key already exists', 409);
      }
    }
    
    const attribute = await CustomAttribute.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!attribute) {
      throw new AppError('Custom attribute not found', 404);
    }
    return attribute;
  }

  static async deleteCustomAttribute(id: string) {
    // Check if attribute is in use by any specification
    const count = await Specification.countDocuments({ 'customAttributes.attributeId': id });
    if (count > 0) {
      throw new AppError(`Cannot delete attribute. It is currently used in ${count} specifications. Please deactivate it instead.`, 409);
    }
    
    const attribute = await CustomAttribute.findByIdAndDelete(id);
    if (!attribute) {
      throw new AppError('Custom attribute not found', 404);
    }
    return attribute;
  }
}
