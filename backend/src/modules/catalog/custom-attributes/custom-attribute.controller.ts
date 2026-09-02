import { Request, Response, NextFunction } from 'express';
import { customAttributeService } from './custom-attribute.service';

export const createCustomAttribute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attribute = await customAttributeService.createCustomAttribute(req.body);
    res.status(201).json({
      success: true,
      message: 'Custom attribute created successfully',
      data: attribute,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomAttributes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await customAttributeService.getCustomAttributes(req.query);
    res.status(200).json({
      success: true,
      data: result.customAttributes,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomAttributeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attribute = await customAttributeService.getCustomAttributeById(req.params.id as string);
    res.status(200).json({
      success: true,
      data: attribute,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomAttribute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attribute = await customAttributeService.updateCustomAttribute(req.params.id as string, req.body);
    res.status(200).json({
      success: true,
      message: 'Custom attribute updated successfully',
      data: attribute,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomAttribute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await customAttributeService.deleteCustomAttribute(req.params.id as string);
    res.status(200).json({
      success: true,
      message: 'Custom attribute deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
