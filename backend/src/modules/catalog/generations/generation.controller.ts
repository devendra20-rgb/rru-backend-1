import { Request, Response, NextFunction } from 'express';
import { generationService } from './generation.service';
import { sendSuccess } from '../../../utils/response';

export const createGeneration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const generation = await generationService.createGeneration(req.body);
    sendSuccess(res, 201, 'Generation created successfully', generation);
  } catch (error) {
    next(error);
  }
};

export const getGenerations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, meta } = await generationService.getGenerations(req.query as any);
    sendSuccess(res, 200, 'Generations retrieved successfully', data, meta);
  } catch (error) {
    next(error);
  }
};

export const getGenerationsByModel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = { ...req.query, modelId: req.params.modelId as string };
    const { data, meta } = await generationService.getGenerations(query as any);
    sendSuccess(res, 200, 'Generations retrieved successfully', data, meta);
  } catch (error) {
    next(error);
  }
};

export const getGenerationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const generation = await generationService.getGenerationById(req.params.id as string);
    sendSuccess(res, 200, 'Generation retrieved successfully', generation);
  } catch (error) {
    next(error);
  }
};

export const getGenerationBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const generation = await generationService.getGenerationBySlug(req.params.slug as string);
    sendSuccess(res, 200, 'Generation retrieved successfully', generation);
  } catch (error) {
    next(error);
  }
};

export const updateGeneration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const generation = await generationService.updateGeneration(req.params.id as string, req.body);
    sendSuccess(res, 200, 'Generation updated successfully', generation);
  } catch (error) {
    next(error);
  }
};

export const deleteGeneration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await generationService.deleteGeneration(req.params.id as string);
    sendSuccess(res, 200, 'Generation deactivated successfully');
  } catch (error) {
    next(error);
  }
};
