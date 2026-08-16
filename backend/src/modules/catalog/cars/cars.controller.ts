import { Request, Response, NextFunction } from 'express';
import { CarsService } from './cars.service';
import { sendSuccess } from '../../../utils/response';

export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  getCarsListing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, total } = await this.carsService.getCarsListing(req.query as any);
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const totalPages = Math.ceil(total / limit);

      sendSuccess(res, 200, 'Cars retrieved successfully', data, {
        page,
        limit,
        total,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  };

  getFeaturedCars = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, total } = await this.carsService.getFeaturedCars(req.query as any);
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const totalPages = Math.ceil(total / limit);

      sendSuccess(res, 200, 'Featured cars retrieved successfully', data, {
        page,
        limit,
        total,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  };

  getCarDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const carDetail = await this.carsService.getCarDetail(req.params.slug as string);
      sendSuccess(res, 200, 'Car detail retrieved successfully', carDetail);
    } catch (error) {
      next(error);
    }
  };
}
