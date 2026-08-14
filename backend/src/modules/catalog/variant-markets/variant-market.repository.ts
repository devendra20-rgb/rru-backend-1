import { VariantMarket } from './variant-market.model';
import {
  IVariantMarketCreate,
  IVariantMarketUpdate,
  IVariantMarketQuery,
} from './variant-market.types';
import { getPaginationOptions, getPaginationMeta } from '../../../utils/pagination';

class VariantMarketRepository {
  async create(data: IVariantMarketCreate) {
    return VariantMarket.create(data);
  }

  async findById(id: string) {
    return VariantMarket.findById(id).populate('variantId').populate('marketId');
  }

  async exists(variantId: string, marketId: string, excludeId?: string) {
    const query: Record<string, any> = { variantId, marketId };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return !!(await VariantMarket.exists(query));
  }

  async findAll(query: IVariantMarketQuery) {
    const filter: Record<string, any> = {};

    if (query.variantId) {
      filter.variantId = query.variantId;
    }

    if (query.marketId) {
      filter.marketId = query.marketId;
    }

    if (query.availabilityStatus) {
      filter.availabilityStatus = query.availabilityStatus;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.priceType) {
      filter['pricing.priceType'] = query.priceType;
    }

    const { page, skip, limit, sort } = getPaginationOptions(query as any);

    const [items, total] = await Promise.all([
      VariantMarket.find(filter)
        .populate('variantId')
        .populate('marketId')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      VariantMarket.countDocuments(filter),
    ]);

    return {
      data: items,
      meta: getPaginationMeta(total, page, limit),
    };
  }

  async update(id: string, data: IVariantMarketUpdate) {
    return VariantMarket.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('variantId')
      .populate('marketId');
  }

  async softDelete(id: string) {
    return VariantMarket.findByIdAndUpdate(id, { status: 'inactive' }, { new: true })
      .populate('variantId')
      .populate('marketId');
  }
}

export const variantMarketRepository = new VariantMarketRepository();
