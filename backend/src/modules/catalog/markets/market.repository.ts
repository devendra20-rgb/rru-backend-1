import { Market } from './market.model';
import { IMarketCreate, IMarketUpdate, IMarketQuery } from './market.types';
import { getPaginationOptions, getPaginationMeta } from '../../../utils/pagination';
import mongoose from 'mongoose';
import { IMarket } from './market.types';

class MarketRepository {
  async create(data: IMarketCreate) {
    return Market.create(data);
  }

  async findById(id: string) {
    return Market.findById(id);
  }

  async findByCode(code: string) {
    return Market.findOne({ code: code.toUpperCase() });
  }

  async findAll(query: IMarketQuery) {
    const filter: Record<string, any> = {};

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { code: { $regex: query.search, $options: 'i' } },
      ];
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.countryCode) {
      filter.countryCode = query.countryCode.toUpperCase();
    }

    const { page, skip, limit, sort } = getPaginationOptions(query as any);

    const [items, total] = await Promise.all([
      Market.find(filter).sort(sort).skip(skip).limit(limit),
      Market.countDocuments(filter),
    ]);

    return {
      data: items,
      meta: getPaginationMeta(total, page, limit),
    };
  }

  async update(id: string, data: IMarketUpdate) {
    return Market.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async softDelete(id: string) {
    return Market.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
  }
}

export const marketRepository = new MarketRepository();
