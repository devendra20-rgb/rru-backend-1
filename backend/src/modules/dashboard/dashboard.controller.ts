import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/response';
import { Brand } from '../catalog/brands/brand.model';
import { VehicleModel as Model } from '../catalog/models/model.model';
import { Generation } from '../catalog/generations/generation.model';
import { Variant } from '../catalog/variants/variant.model';
import { User } from '../users/user.model';

export class DashboardController {
  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [
        totalBrands,
        totalModels,
        totalGenerations,
        totalVariants,
        totalUsers,
        activeVariants,
        draftVariants,
      ] = await Promise.all([
        Brand.countDocuments(),
        Model.countDocuments(),
        Generation.countDocuments(),
        Variant.countDocuments(),
        User.countDocuments(),
        Variant.countDocuments({ status: 'active' }),
        Variant.countDocuments({ status: 'draft' }),
      ]);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentlyAddedVariants = await Variant.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
      });

      sendSuccess(res, 200, 'Dashboard stats retrieved', {
        totalBrands,
        totalModels,
        totalGenerations,
        totalVariants,
        totalUsers,
        activeVariants,
        draftVariants,
        recentlyAddedVariants,
      });
    } catch (error) {
      next(error);
    }
  };
}
