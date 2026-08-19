import { Request, Response } from 'express';
import { CostToOwnService } from './cost-to-own.service';
import { sendSuccess } from '../../../utils/response';
import { getPaginationOptions, getPaginationMeta } from '../../../utils/pagination';

export class CostToOwnController {
  private service: CostToOwnService;

  constructor() {
    this.service = new CostToOwnService();
  }

  createCostToOwn = async (req: Request, res: Response) => {
    const costToOwn = await this.service.createCostToOwn(req.body);
    return sendSuccess(res, 201, 'CostToOwn created successfully', costToOwn);
  };

  getCostToOwnById = async (req: Request, res: Response) => {
    const costToOwn = await this.service.getCostToOwnById(req.params.id as string);
    return sendSuccess(res, 200, 'CostToOwn retrieved successfully', costToOwn);
  };

  getCostsToOwn = async (req: Request, res: Response) => {
    const { page, limit } = getPaginationOptions(req.query as any);
    const result = await this.service.getCostsToOwn(req.query as any);

    return sendSuccess(
      res,
      200,
      'CostsToOwn retrieved successfully',
      result.data,
      getPaginationMeta(result.total, page, limit),
    );
  };

  updateCostToOwn = async (req: Request, res: Response) => {
    const costToOwn = await this.service.updateCostToOwn(req.params.id as string, req.body);
    return sendSuccess(res, 200, 'CostToOwn updated successfully', costToOwn);
  };

  deleteCostToOwn = async (req: Request, res: Response) => {
    await this.service.deleteCostToOwn(req.params.id as string);
    return sendSuccess(res, 200, 'CostToOwn deleted successfully');
  };

  calculateCostToOwn = async (req: Request, res: Response) => {
    const result = this.service.calculateCostToOwn(req.body);
    return sendSuccess(res, 200, 'Cost breakdown calculated successfully', result);
  };

  getSegmentComparison = async (req: Request, res: Response) => {
    const result = this.service.getSegmentComparison(req.params.segment as string);
    return sendSuccess(res, 200, 'Segment comparison retrieved successfully', result);
  };
}
