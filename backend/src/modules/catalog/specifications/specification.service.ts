import { specificationRepository } from './specification.repository';
import {
  ISpecificationCreate,
  ISpecificationUpdate,
  ISpecificationQuery,
} from './specification.types';
import { AppError } from '../../../middlewares/error.middleware';
import { variantRepository } from '../variants/variant.repository';

class SpecificationService {
  async create(data: ISpecificationCreate) {
    // Check if variant exists
    const variantExists = await variantRepository.findById(data.variantId);
    if (!variantExists) {
      throw new AppError('Variant not found', 404);
    }

    // Check for duplicate specification
    const isDuplicate = await specificationRepository.exists(data.variantId);
    if (isDuplicate) {
      throw new AppError('Specification for this variant already exists', 409);
    }

    return await specificationRepository.create(data);
  }

  async update(id: string, data: ISpecificationUpdate) {
    const specification = await specificationRepository.getById(id);
    if (!specification) {
      throw new AppError('Specification not found', 404);
    }

    return await specificationRepository.update(id, data);
  }

  async getById(id: string) {
    const specification = await specificationRepository.getById(id);
    if (!specification) {
      throw new AppError('Specification not found', 404);
    }
    return specification;
  }

  async getByVariantId(variantId: string) {
    const specification = await specificationRepository.getByVariantId(variantId);
    if (!specification) {
      throw new AppError('Specification not found for this variant', 404);
    }
    return specification;
  }

  async getAll(query: ISpecificationQuery) {
    return await specificationRepository.getAll(query);
  }

  async delete(id: string) {
    const specification = await specificationRepository.getById(id);
    if (!specification) {
      throw new AppError('Specification not found', 404);
    }

    return await specificationRepository.delete(id);
  }
}

export const specificationService = new SpecificationService();
