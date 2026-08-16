import { AppError } from '../../../middlewares/error.middleware';
import { CostToOwnRepository } from './cost-to-own.repository';
import {
  CreateCostToOwnInput,
  UpdateCostToOwnInput,
  CostToOwnQuery,
  ICostToOwn,
} from './cost-to-own.types';
import { Variant } from '../variants/variant.model';
import { Market } from '../markets/market.model';

export class CostToOwnService {
  private repository: CostToOwnRepository;

  constructor() {
    this.repository = new CostToOwnRepository();
  }

  async createCostToOwn(data: CreateCostToOwnInput): Promise<ICostToOwn> {
    const [variantExists, marketExists] = await Promise.all([
      Variant.findById(data.variantId),
      Market.findById(data.marketId),
    ]);

    if (!variantExists) {
      throw new AppError('Variant not found', 404);
    }
    if (!marketExists) {
      throw new AppError('Market not found', 404);
    }

    const existingCost = await this.repository.findByVariantAndMarket(
      data.variantId.toString(),
      data.marketId.toString(),
    );
    if (existingCost) {
      throw new AppError('CostToOwn data already exists for this variant and market', 409);
    }

    const createdCost = await this.repository.create(data);
    return createdCost.toObject();
  }

  async getCostToOwnById(id: string): Promise<ICostToOwn> {
    const costToOwn = await this.repository.findById(id);
    if (!costToOwn) {
      throw new AppError('CostToOwn data not found', 404);
    }
    return costToOwn.toObject();
  }

  async updateCostToOwn(id: string, data: UpdateCostToOwnInput): Promise<ICostToOwn> {
    const costToOwn = await this.repository.findById(id);
    if (!costToOwn) {
      throw new AppError('CostToOwn data not found', 404);
    }

    if (data.variantId && data.marketId) {
      if (
        data.variantId.toString() !== costToOwn.variantId.toString() ||
        data.marketId.toString() !== costToOwn.marketId.toString()
      ) {
        const existingCost = await this.repository.findByVariantAndMarket(
          data.variantId.toString(),
          data.marketId.toString(),
        );
        if (existingCost && existingCost._id.toString() !== id) {
          throw new AppError('CostToOwn data already exists for this variant and market', 409);
        }
      }
    }

    if (data.variantId && data.variantId.toString() !== costToOwn.variantId.toString()) {
      const variantExists = await Variant.findById(data.variantId);
      if (!variantExists) throw new AppError('Variant not found', 404);
    }

    if (data.marketId && data.marketId.toString() !== costToOwn.marketId.toString()) {
      const marketExists = await Market.findById(data.marketId);
      if (!marketExists) throw new AppError('Market not found', 404);
    }

    const updatedCostToOwn = await this.repository.update(id, data);
    return updatedCostToOwn!.toObject();
  }

  async deleteCostToOwn(id: string): Promise<void> {
    const costToOwn = await this.repository.findById(id);
    if (!costToOwn) {
      throw new AppError('CostToOwn data not found', 404);
    }
    await this.repository.softDelete(id);
  }

  async getCostsToOwn(query: CostToOwnQuery) {
    return this.repository.findMany(query);
  }
}
