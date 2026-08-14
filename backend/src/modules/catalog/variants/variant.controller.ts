import { Request, Response, NextFunction } from 'express';
import { variantService } from './variant.service';
import { sendSuccess } from '../../../utils/response';

export const createVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variant = await variantService.createVariant(req.body);
    sendSuccess(res, 201, 'Variant created successfully', variant);
  } catch (error) {
    next(error);
  }
};

export const getVariants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, meta } = await variantService.getVariants(req.query as any);
    sendSuccess(res, 200, 'Variants retrieved successfully', data, meta);
  } catch (error) {
    next(error);
  }
};

export const getVariantsByGeneration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = { ...req.query, generationId: req.params.generationId };
    const { data, meta } = await variantService.getVariants(query as any);
    sendSuccess(res, 200, 'Variants retrieved successfully', data, meta);
  } catch (error) {
    next(error);
  }
};

export const getVariantById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variant = await variantService.getVariantById(req.params.id as string);
    sendSuccess(res, 200, 'Variant retrieved successfully', variant);
  } catch (error) {
    next(error);
  }
};

export const getVariantBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variant = await variantService.getVariantBySlug(req.params.slug as string);
    sendSuccess(res, 200, 'Variant retrieved successfully', variant);
  } catch (error) {
    next(error);
  }
};

export const updateVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variant = await variantService.updateVariant(req.params.id as string, req.body);
    sendSuccess(res, 200, 'Variant updated successfully', variant);
  } catch (error) {
    next(error);
  }
};

export const deleteVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await variantService.deleteVariant(req.params.id as string);
    sendSuccess(res, 200, 'Variant deactivated successfully');
  } catch (error) {
    next(error);
  }
};
