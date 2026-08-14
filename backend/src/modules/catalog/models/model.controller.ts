import { Request, Response, NextFunction } from 'express';
import { modelService } from './model.service';
import { sendSuccess } from '../../../utils/response';

export const createModel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const model = await modelService.createModel(req.body);
    sendSuccess(res, 201, 'Model created successfully', model);
  } catch (error) {
    next(error);
  }
};

export const getModels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, meta } = await modelService.getModels(req.query as any);
    sendSuccess(res, 200, 'Models retrieved successfully', data, meta);
  } catch (error) {
    next(error);
  }
};

export const getModelsByBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = { ...req.query, brandId: req.params.brandId as string };
    const { data, meta } = await modelService.getModels(query as any);
    sendSuccess(res, 200, 'Models retrieved successfully', data, meta);
  } catch (error) {
    next(error);
  }
};

export const getModelById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const model = await modelService.getModelById(req.params.id as string);
    sendSuccess(res, 200, 'Model retrieved successfully', model);
  } catch (error) {
    next(error);
  }
};

export const getModelBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const model = await modelService.getModelBySlug(req.params.slug as string);
    sendSuccess(res, 200, 'Model retrieved successfully', model);
  } catch (error) {
    next(error);
  }
};

export const updateModel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const model = await modelService.updateModel(req.params.id as string, req.body);
    sendSuccess(res, 200, 'Model updated successfully', model);
  } catch (error) {
    next(error);
  }
};

export const deleteModel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await modelService.deleteModel(req.params.id as string);
    sendSuccess(res, 200, 'Model deactivated successfully');
  } catch (error) {
    next(error);
  }
};
