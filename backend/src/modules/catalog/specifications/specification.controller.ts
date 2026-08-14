import { Request, Response, NextFunction } from 'express';
import { specificationService } from './specification.service';
import { sendSuccess } from '../../../utils/response';

export const createSpecification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = {
      ...req.body,
    };

    // Support nested route /variants/:variantId/specifications
    if (req.params.variantId) {
      data.variantId = req.params.variantId as string;
    }

    const specification = await specificationService.create(data);
    sendSuccess(res, 201, 'Specification created successfully', specification);
  } catch (error) {
    next(error);
  }
};

export const getSpecifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = {
      variantId: req.query.variantId as string,
      status: req.query.status as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    if (req.params.variantId) {
      query.variantId = req.params.variantId as string;
    }

    const result = await specificationService.getAll(query);
    sendSuccess(res, 200, 'Specifications retrieved successfully', result.data, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getSpecificationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const specification = await specificationService.getById(req.params.id as string);
    sendSuccess(res, 200, 'Specification retrieved successfully', specification);
  } catch (error) {
    next(error);
  }
};

export const getSpecificationByVariantId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const specification = await specificationService.getByVariantId(req.params.variantId as string);
    sendSuccess(res, 200, 'Specification retrieved successfully', specification);
  } catch (error) {
    next(error);
  }
};

export const updateSpecification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const specification = await specificationService.update(req.params.id as string, req.body);
    sendSuccess(res, 200, 'Specification updated successfully', specification);
  } catch (error) {
    next(error);
  }
};

export const deleteSpecification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await specificationService.delete(req.params.id as string);
    sendSuccess(res, 200, 'Specification deleted successfully', null);
  } catch (error) {
    next(error);
  }
};
