import { Request, Response, NextFunction } from 'express';
import { variantMarketService } from './variant-market.service';
import { sendSuccess } from '../../../utils/response';

export const createVariantMarket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = {
      ...req.body,
    };

    // If it's a nested route creation, variantId or marketId might be in params
    if (req.params.variantId) {
      data.variantId = req.params.variantId as string;
    }
    if (req.params.marketId) {
      data.marketId = req.params.marketId as string;
    }

    const variantMarket = await variantMarketService.create(data);
    sendSuccess(res, 201, 'Variant Market relationship created successfully', variantMarket);
  } catch (error) {
    next(error);
  }
};

export const getVariantMarkets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = {
      variantId: req.query.variantId as string,
      marketId: req.query.marketId as string,
      availabilityStatus: req.query.availabilityStatus as string,
      status: req.query.status as string,
      priceType: req.query.priceType as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    if (req.params.variantId) {
      query.variantId = req.params.variantId as string;
    }

    if (req.params.marketId) {
      query.marketId = req.params.marketId as string;
    }

    const result = await variantMarketService.getAll(query);
    sendSuccess(res, 200, 'Variant Markets retrieved successfully', result.data, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getVariantMarketById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variantMarket = await variantMarketService.getById(req.params.id as string);
    sendSuccess(res, 200, 'Variant Market retrieved successfully', variantMarket);
  } catch (error) {
    next(error);
  }
};

export const updateVariantMarket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variantMarket = await variantMarketService.update(req.params.id as string, req.body);
    sendSuccess(res, 200, 'Variant Market updated successfully', variantMarket);
  } catch (error) {
    next(error);
  }
};

export const deleteVariantMarket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await variantMarketService.delete(req.params.id as string);
    sendSuccess(res, 200, 'Variant Market deleted successfully', null);
  } catch (error) {
    next(error);
  }
};
