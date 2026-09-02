import { AppError } from '../../../middlewares/error.middleware';
import { customAttributeRepository } from './custom-attribute.repository';
import { ICustomAttributeCreate, ICustomAttributeUpdate, ICustomAttributeQuery } from './custom-attribute.types';

export class CustomAttributeService {
  async createCustomAttribute(data: ICustomAttributeCreate) {
    try {
      const existing = await customAttributeRepository.findByKey(data.key);
      if (existing) {
        throw new AppError('Custom attribute with this key already exists', 409);
      }
      return await customAttributeRepository.create(data);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('Custom attribute with this key already exists', 409);
      }
      throw error;
    }
  }

  async getCustomAttributes(query: ICustomAttributeQuery) {
    return customAttributeRepository.findAll(query);
  }

  async getCustomAttributeById(id: string) {
    const attribute = await customAttributeRepository.findById(id);
    if (!attribute) {
      throw new AppError('Custom attribute not found', 404);
    }
    return attribute;
  }

  async updateCustomAttribute(id: string, data: ICustomAttributeUpdate) {
    try {
      if (data.key) {
        const existing = await customAttributeRepository.findByKey(data.key);
        if (existing && existing._id.toString() !== id) {
          throw new AppError('Custom attribute with this key already exists', 409);
        }
      }
      const updated = await customAttributeRepository.update(id, data);
      if (!updated) {
        throw new AppError('Custom attribute not found', 404);
      }
      return updated;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('Custom attribute with this key already exists', 409);
      }
      throw error;
    }
  }

  async deleteCustomAttribute(id: string) {
    const deleted = await customAttributeRepository.delete(id);
    if (!deleted) {
      throw new AppError('Custom attribute not found', 404);
    }
    return deleted;
  }
}

export const customAttributeService = new CustomAttributeService();
