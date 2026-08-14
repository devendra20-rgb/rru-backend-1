import { Request, Response, NextFunction } from 'express';
import { marketService } from './market.service';
import { sendSuccess } from '../../../utils/response';

export const createMarket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const market = await marketService.createMarket(req.body);
    sendSuccess(res, 201, 'Market created successfully', market);
  } catch (error) {
    next(error);
  }
};

export const getMarkets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = {
      search: req.query.search as string,
      status: req.query.status as string,
      countryCode: req.query.countryCode as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };
    const result = await marketService.getMarkets(query);
    sendSuccess(res, 200, 'Markets retrieved successfully', result.data, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getMarketById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const market = await marketService.getMarketById(req.params.id as string);
    sendSuccess(res, 200, 'Market retrieved successfully', market);
  } catch (error) {
    next(error);
  }
};

export const getMarketByCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const market = await marketService.getMarketByCode(req.params.code as string);
    sendSuccess(res, 200, 'Market retrieved successfully', market);
  } catch (error) {
    next(error);
  }
};

export const updateMarket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const market = await marketService.updateMarket(req.params.id as string, req.body);
    sendSuccess(res, 200, 'Market updated successfully', market);
  } catch (error) {
    next(error);
  }
};

export const deleteMarket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await marketService.deleteMarket(req.params.id as string);
    sendSuccess(res, 200, 'Market deactivated successfully');
  } catch (error) {
    next(error);
  }
};
