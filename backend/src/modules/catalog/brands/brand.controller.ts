import { Request, Response, NextFunction } from 'express';
import { brandService } from './brand.service';
import { sendSuccess } from '../../../utils/response';

export const createBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brand = await brandService.createBrand(req.body);
    sendSuccess(res, 201, 'Brand created successfully', brand);
  } catch (error) {
    next(error);
  }
};

export const getBrands = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, meta } = await brandService.getBrands(req.query as any);
    sendSuccess(res, 200, 'Brands retrieved successfully', data, meta);
  } catch (error) {
    next(error);
  }
};

export const getBrandById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brand = await brandService.getBrandById(req.params.id as string);
    sendSuccess(res, 200, 'Brand retrieved successfully', brand);
  } catch (error) {
    next(error);
  }
};

export const getBrandBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brand = await brandService.getBrandBySlug(req.params.slug as string);
    sendSuccess(res, 200, 'Brand retrieved successfully', brand);
  } catch (error) {
    next(error);
  }
};

export const updateBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brand = await brandService.updateBrand(req.params.id as string, req.body);
    sendSuccess(res, 200, 'Brand updated successfully', brand);
  } catch (error) {
    next(error);
  }
};

export const deleteBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await brandService.deleteBrand(req.params.id as string);
    sendSuccess(res, 200, 'Brand deactivated successfully');
  } catch (error) {
    next(error);
  }
};
