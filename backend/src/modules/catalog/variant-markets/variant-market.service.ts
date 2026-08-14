import { variantMarketRepository } from './variant-market.repository';
import {
  IVariantMarketCreate,
  IVariantMarketUpdate,
  IVariantMarketQuery,
} from './variant-market.types';
import { AppError } from '../../../middlewares/error.middleware';
import { variantRepository } from '../variants/variant.repository';
import { marketRepository } from '../markets/market.repository';

class VariantMarketService {
  async create(data: IVariantMarketCreate) {
    // Validate Variant exists
    const variantExists = await variantRepository.findById(data.variantId as string);
    if (!variantExists) {
      throw new AppError('Variant not found', 404);
    }

    // Validate Market exists
    const marketExists = await marketRepository.findById(data.marketId as string);
    if (!marketExists) {
      throw new AppError('Market not found', 404);
    }

    // Check for duplicate relationship
    const isDuplicate = await variantMarketRepository.exists(
      data.variantId as string,
      data.marketId as string,
    );
    if (isDuplicate) {
      throw new AppError('This variant is already mapped to this market', 409);
    }

    return variantMarketRepository.create(data);
  }

  async getById(id: string) {
    const variantMarket = await variantMarketRepository.findById(id);
    if (!variantMarket) {
      throw new AppError('Variant Market relationship not found', 404);
    }
    return variantMarket;
  }

  async getAll(query: IVariantMarketQuery) {
    return variantMarketRepository.findAll(query);
  }

  async update(id: string, data: IVariantMarketUpdate) {
    const variantMarket = await variantMarketRepository.findById(id);
    if (!variantMarket) {
      throw new AppError('Variant Market relationship not found', 404);
    }

    return variantMarketRepository.update(id, data);
  }

  async delete(id: string) {
    const variantMarket = await variantMarketRepository.findById(id);
    if (!variantMarket) {
      throw new AppError('Variant Market relationship not found', 404);
    }

    return variantMarketRepository.softDelete(id);
  }
}

export const variantMarketService = new VariantMarketService();
