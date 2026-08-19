import { AppError } from '../../../middlewares/error.middleware';
import { CostToOwnRepository } from './cost-to-own.repository';
import {
  CreateCostToOwnInput,
  UpdateCostToOwnInput,
  CostToOwnQuery,
  ICostToOwn,
} from './cost-to-own.types';
import { Variant } from '../variants/variant.model';
import { Market } from '../markets/market.model';

export class CostToOwnService {
  private repository: CostToOwnRepository;

  constructor() {
    this.repository = new CostToOwnRepository();
  }

  async createCostToOwn(data: CreateCostToOwnInput): Promise<ICostToOwn> {
    const [variantExists, marketExists] = await Promise.all([
      Variant.findById(data.variantId),
      Market.findById(data.marketId),
    ]);

    if (!variantExists) {
      throw new AppError('Variant not found', 404);
    }
    if (!marketExists) {
      throw new AppError('Market not found', 404);
    }

    const existingCost = await this.repository.findByVariantAndMarket(
      data.variantId.toString(),
      data.marketId.toString(),
    );
    if (existingCost) {
      throw new AppError('CostToOwn data already exists for this variant and market', 409);
    }

    const createdCost = await this.repository.create(data);
    return createdCost.toObject();
  }

  async getCostToOwnById(id: string): Promise<ICostToOwn> {
    const costToOwn = await this.repository.findById(id);
    if (!costToOwn) {
      throw new AppError('CostToOwn data not found', 404);
    }
    return costToOwn.toObject();
  }

  async updateCostToOwn(id: string, data: UpdateCostToOwnInput): Promise<ICostToOwn> {
    const costToOwn = await this.repository.findById(id);
    if (!costToOwn) {
      throw new AppError('CostToOwn data not found', 404);
    }

    if (data.variantId && data.marketId) {
      if (
        data.variantId.toString() !== costToOwn.variantId.toString() ||
        data.marketId.toString() !== costToOwn.marketId.toString()
      ) {
        const existingCost = await this.repository.findByVariantAndMarket(
          data.variantId.toString(),
          data.marketId.toString(),
        );
        if (existingCost && existingCost._id.toString() !== id) {
          throw new AppError('CostToOwn data already exists for this variant and market', 409);
        }
      }
    }

    if (data.variantId && data.variantId.toString() !== costToOwn.variantId.toString()) {
      const variantExists = await Variant.findById(data.variantId);
      if (!variantExists) throw new AppError('Variant not found', 404);
    }

    if (data.marketId && data.marketId.toString() !== costToOwn.marketId.toString()) {
      const marketExists = await Market.findById(data.marketId);
      if (!marketExists) throw new AppError('Market not found', 404);
    }

    const updatedCostToOwn = await this.repository.update(id, data);
    return updatedCostToOwn!.toObject();
  }

  async deleteCostToOwn(id: string): Promise<void> {
    const costToOwn = await this.repository.findById(id);
    if (!costToOwn) {
      throw new AppError('CostToOwn data not found', 404);
    }
    await this.repository.softDelete(id);
  }

  async getCostsToOwn(query: CostToOwnQuery) {
    return this.repository.findMany(query);
  }

  calculateCostToOwn(input: any) {
    const annualKm = Number(input.annualKm || input.annualMileageKm) || 20000;
    const ownershipYears = Number(input.ownershipYears) || 5;
    const price = Number(input.vehiclePrice || input.price) || 150000;
    const isFinanced = Boolean(input.isFinanced);
    const fuelPrice = Number(input.fuelPrice) || 3.12;

    const monthlyFuel = Math.round(((annualKm / 12) / 100) * 8.5 * fuelPrice);
    const monthlyInsurance = Math.round((price * 0.03) / 12);
    const monthlyDepreciation = Math.round((price * 0.15) / 12);
    const monthlyServicing = 350;
    const monthlyTyres = 150;
    const monthlyRegistration = 75;
    const monthlyTolls = 120;

    const monthlyTotal =
      monthlyFuel +
      monthlyInsurance +
      monthlyDepreciation +
      monthlyServicing +
      monthlyTyres +
      monthlyRegistration +
      monthlyTolls;
    const totalOverPeriod = monthlyTotal * (ownershipYears * 12);

    return {
      vehicleName: input.vehicleName || 'Vehicle',
      market: input.market || 'UAE',
      annualKm,
      ownershipYears,
      isFinanced,
      monthly: {
        financeDepreciation: monthlyDepreciation,
        insurance: monthlyInsurance,
        fuel: monthlyFuel,
        servicing: monthlyServicing,
        tyres: monthlyTyres,
        registration: monthlyRegistration,
        tolls: monthlyTolls,
        total: monthlyTotal,
      },
      totalOverPeriod,
      hiddenCosts: {
        registrationTransfer: 420,
        insuranceYear1: monthlyInsurance * 12,
        numberPlate: 350,
        bankProcessing: isFinanced ? 1050 : 0,
        inspection: 170,
        total: 420 + monthlyInsurance * 12 + 350 + (isFinanced ? 1050 : 0) + 170,
      },
      assumptions: {
        fuelPrice,
        fuelPriceDate: 'Latest Market Rate',
        insuranceNote: 'Estimated 3% of vehicle value annually',
        depreciationNote: 'Estimated 15% annual straight-line depreciation',
      },
    };
  }

  getSegmentComparison(segment: string) {
    return [
      { vehicleName: 'Selected Vehicle', totalCost3Year: 42000, costPerMonth: 1166, isCurrentVehicle: true },
      { vehicleName: `${segment || 'Segment'} Average`, totalCost3Year: 48500, costPerMonth: 1347 },
      { vehicleName: `${segment || 'Segment'} Best in Class`, totalCost3Year: 36200, costPerMonth: 1005 },
    ];
  }
}
