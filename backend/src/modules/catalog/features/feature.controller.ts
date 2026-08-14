import { Request, Response } from 'express';
import { featureService } from './feature.service';
import { sendSuccess } from '../../../utils/response';

export class FeatureController {
  // Feature handlers
  async createFeature(req: Request, res: Response) {
    const feature = await featureService.createFeature(req.body);
    return sendSuccess(res, 201, 'Feature created successfully', feature);
  }

  async getFeatures(req: Request, res: Response) {
    const { data, total } = await featureService.getFeatures(req.query as unknown as any);
    return sendSuccess(res, 200, 'Features retrieved successfully', {
      features: data,
      pagination: {
        total,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        pages: Math.ceil(total / (Number(req.query.limit) || 10)),
      },
    });
  }

  async getFeatureById(req: Request, res: Response) {
    const feature = await featureService.getFeatureById(req.params.id as string);
    return sendSuccess(res, 200, 'Feature retrieved successfully', feature);
  }

  async getFeatureBySlug(req: Request, res: Response) {
    const feature = await featureService.getFeatureBySlug(req.params.slug as string);
    return sendSuccess(res, 200, 'Feature retrieved successfully', feature);
  }

  async updateFeature(req: Request, res: Response) {
    const feature = await featureService.updateFeature(req.params.id as string, req.body);
    return sendSuccess(res, 200, 'Feature updated successfully', feature);
  }

  async deleteFeature(req: Request, res: Response) {
    const feature = await featureService.deleteFeature(req.params.id as string);
    return sendSuccess(res, 200, 'Feature deleted successfully', feature);
  }

  // VariantFeature handlers
  async createVariantFeature(req: Request, res: Response) {
    const variantFeature = await featureService.createVariantFeature(req.body);
    return sendSuccess(res, 201, 'Variant feature mapped successfully', variantFeature);
  }

  async getVariantFeatures(req: Request, res: Response) {
    const { data, total } = await featureService.getVariantFeatures(req.query as unknown as any);
    return sendSuccess(res, 200, 'Variant features retrieved successfully', {
      variantFeatures: data,
      pagination: {
        total,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        pages: Math.ceil(total / (Number(req.query.limit) || 10)),
      },
    });
  }

  async getVariantFeatureById(req: Request, res: Response) {
    const variantFeature = await featureService.getVariantFeatureById(req.params.id as string);
    return sendSuccess(res, 200, 'Variant feature retrieved successfully', variantFeature);
  }

  async getFeaturesByVariantId(req: Request, res: Response) {
    const variantFeatures = await featureService.getFeaturesByVariantId(
      req.params.variantId as string,
    );
    return sendSuccess(res, 200, 'Variant features retrieved successfully', variantFeatures);
  }

  async updateVariantFeature(req: Request, res: Response) {
    const variantFeature = await featureService.updateVariantFeature(
      req.params.id as string,
      req.body,
    );
    return sendSuccess(res, 200, 'Variant feature updated successfully', variantFeature);
  }

  async deleteVariantFeature(req: Request, res: Response) {
    const variantFeature = await featureService.deleteVariantFeature(req.params.id as string);
    return sendSuccess(res, 200, 'Variant feature deleted successfully', variantFeature);
  }
}

export const featureController = new FeatureController();
