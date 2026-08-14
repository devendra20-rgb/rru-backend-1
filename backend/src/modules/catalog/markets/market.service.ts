import { marketRepository } from './market.repository';
import { IMarketCreate, IMarketUpdate, IMarketQuery } from './market.types';
import { AppError } from '../../../middlewares/error.middleware';

class MarketService {
  async createMarket(data: IMarketCreate) {
    // Normalization
    const normalizedData = {
      ...data,
      code: data.code.trim().toUpperCase(),
      name: data.name.trim(),
      countryCode: data.countryCode.trim().toUpperCase(),
      currencyCode: data.currencyCode.trim().toUpperCase(),
      currencySymbol: data.currencySymbol?.trim(),
    };

    // Duplicate check
    const existing = await marketRepository.findByCode(normalizedData.code);
    if (existing) {
      throw new AppError('Market code already exists', 409);
    }

    return marketRepository.create(normalizedData);
  }

  async getMarketById(id: string) {
    const market = await marketRepository.findById(id);
    if (!market) {
      throw new AppError('Market not found', 404);
    }
    return market;
  }

  async getMarketByCode(code: string) {
    const market = await marketRepository.findByCode(code);
    if (!market) {
      throw new AppError('Market not found', 404);
    }
    return market;
  }

  async getMarkets(query: IMarketQuery) {
    return marketRepository.findAll(query);
  }

  async updateMarket(id: string, data: IMarketUpdate) {
    const market = await this.getMarketById(id);

    const normalizedData = { ...data };

    if (normalizedData.code) {
      normalizedData.code = normalizedData.code.trim().toUpperCase();
      if (normalizedData.code !== market.code) {
        const existing = await marketRepository.findByCode(normalizedData.code);
        if (existing) {
          throw new AppError('Market code already exists', 409);
        }
      }
    }

    if (normalizedData.name) normalizedData.name = normalizedData.name.trim();
    if (normalizedData.countryCode)
      normalizedData.countryCode = normalizedData.countryCode.trim().toUpperCase();
    if (normalizedData.currencyCode)
      normalizedData.currencyCode = normalizedData.currencyCode.trim().toUpperCase();
    if (normalizedData.currencySymbol !== undefined)
      normalizedData.currencySymbol = normalizedData.currencySymbol?.trim();

    const updatedMarket = await marketRepository.update(id, normalizedData);
    if (!updatedMarket) {
      throw new AppError('Market not found', 404);
    }
    return updatedMarket;
  }

  async deleteMarket(id: string) {
    const market = await this.getMarketById(id);
    // Soft delete
    const deletedMarket = await marketRepository.softDelete(id);
    if (!deletedMarket) {
      throw new AppError('Market not found', 404);
    }
    return deletedMarket;
  }
}

export const marketService = new MarketService();
