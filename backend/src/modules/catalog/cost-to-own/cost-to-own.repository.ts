import { Types } from 'mongoose';
import { CostToOwn, ICostToOwnDocument } from './cost-to-own.model';
import { CreateCostToOwnInput, UpdateCostToOwnInput, CostToOwnQuery } from './cost-to-own.types';

export class CostToOwnRepository {
  async create(data: CreateCostToOwnInput): Promise<ICostToOwnDocument> {
    const costToOwn = new CostToOwn(data);
    return costToOwn.save();
  }

  async findById(id: string): Promise<ICostToOwnDocument | null> {
    return CostToOwn.findById(id).exec();
  }

  async findByVariantAndMarket(
    variantId: string,
    marketId: string,
  ): Promise<ICostToOwnDocument | null> {
    return CostToOwn.findOne({ variantId, marketId }).exec();
  }

  async update(id: string, data: UpdateCostToOwnInput): Promise<ICostToOwnDocument | null> {
    return CostToOwn.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async softDelete(id: string): Promise<ICostToOwnDocument | null> {
    return CostToOwn.findByIdAndUpdate(id, { status: 'inactive' }, { new: true }).exec();
  }

  async findMany(query: CostToOwnQuery): Promise<{ data: ICostToOwnDocument[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      variantId,
      marketId,
      status,
    } = query;

    const filter: Record<string, any> = {};
    if (variantId) filter.variantId = new Types.ObjectId(variantId);
    if (marketId) filter.marketId = new Types.ObjectId(marketId);
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      CostToOwn.find(filter)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      CostToOwn.countDocuments(filter),
    ]);

    return { data, total };
  }
}
