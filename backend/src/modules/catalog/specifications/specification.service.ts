import { specificationRepository } from './specification.repository';
import {
  ISpecificationCreate,
  ISpecificationUpdate,
  ISpecificationQuery,
} from './specification.types';
import { AppError } from '../../../middlewares/error.middleware';
import { variantRepository } from '../variants/variant.repository';
import { CustomAttribute } from '../custom-attributes/custom-attribute.model';

class SpecificationService {
  private async validateCustomAttributes(customAttributes?: { attributeId: string; value: any }[]) {
    if (!customAttributes || customAttributes.length === 0) return;

    const attributeIds = customAttributes.map(attr => attr.attributeId);
    const definitions = await CustomAttribute.find({ _id: { $in: attributeIds } });
    const definitionsMap = new Map(definitions.map(d => [d._id.toString(), d]));

    for (const attr of customAttributes) {
      const def = definitionsMap.get(attr.attributeId.toString());
      if (!def) {
        throw new AppError(`Custom attribute with ID ${attr.attributeId} not found`, 400);
      }
      
      // Validate type
      if (def.type === 'text') {
        if (typeof attr.value !== 'string') throw new AppError(`Attribute ${def.name} must be text`, 400);
      } else if (def.type === 'number') {
        if (typeof attr.value !== 'number') throw new AppError(`Attribute ${def.name} must be a number`, 400);
      } else if (def.type === 'boolean') {
        if (typeof attr.value !== 'boolean') throw new AppError(`Attribute ${def.name} must be a boolean`, 400);
      } else if (def.type === 'select') {
        if (!def.options || !def.options.includes(attr.value)) {
          throw new AppError(`Attribute ${def.name} must be one of: ${def.options?.join(', ')}`, 400);
        }
      }
    }
    
    // Check required attributes
    const requiredDefinitions = await CustomAttribute.find({ isRequired: true, isActive: true, appliesTo: 'Car' });
    for (const reqDef of requiredDefinitions) {
      const found = customAttributes.find(a => a.attributeId.toString() === reqDef._id.toString());
      if (!found || found.value === undefined || found.value === null || found.value === '') {
        throw new AppError(`Custom attribute ${reqDef.name} is required`, 400);
      }
    }
  }
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

    if (data.customAttributes) {
      await this.validateCustomAttributes(data.customAttributes);
    }

    return await specificationRepository.create(data);
  }

  async update(id: string, data: ISpecificationUpdate) {
    const specification = await specificationRepository.getById(id);
    if (!specification) {
      throw new AppError('Specification not found', 404);
    }

    if (data.customAttributes) {
      await this.validateCustomAttributes(data.customAttributes);
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
