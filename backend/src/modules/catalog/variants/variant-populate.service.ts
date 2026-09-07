import { Types } from 'mongoose';
import { AppError } from '../../../middlewares/error.middleware';
import { variantRepository } from './variant.repository';
import { specificationRepository } from '../specifications/specification.repository';
import { variantFeatureRepository } from '../features/feature.repository';
import { variantColorRepository } from '../colors/color.repository';
import { variantMarketRepository } from '../variant-markets/variant-market.repository';
import { mediaService } from '../../media/media.service';
import { mediaRepository } from '../../media/media.repository';
import { Specification } from '../specifications/specification.model';
import { VariantFeature } from '../features/feature.model';
import { VariantColor } from '../colors/color.model';
import { VariantMarket } from '../variant-markets/variant-market.model';

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const idOf = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value._id) return value._id.toString();
  return value.toString();
};

const countFilled = (value: unknown): number => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value !== 'object') return 1;
  if (Array.isArray(value)) {
    return value.reduce<number>((sum, item) => sum + countFilled(item), 0);
  }
  return Object.values(value as Record<string, unknown>).reduce<number>(
    (sum, item) => sum + countFilled(item),
    0,
  );
};

const scoreVariantCompleteness = async (variantId: string, variant: any): Promise<number> => {
  const [spec, features, colors, markets, media] = await Promise.all([
    Specification.findOne({ variantId }).lean(),
    VariantFeature.find({ variantId, status: 'active' }).lean(),
    VariantColor.find({ variantId, status: 'active' }).lean(),
    VariantMarket.find({ variantId, status: { $ne: 'inactive' } }).lean(),
    mediaRepository.findByEntity('variant', variantId),
  ]);

  let score = 0;

  score += countFilled({
    description: variant.description,
    shortDescription: variant.shortDescription,
    modelYear: variant.modelYear,
    fuelType: variant.fuelType,
    transmissionType: variant.transmissionType,
    drivetrain: variant.drivetrain,
    engine: variant.engine,
    seatingCapacity: variant.seatingCapacity,
    doors: variant.doors,
  });

  if (spec) {
    score += 20 + countFilled({
      performance: (spec as any).performance,
      dimensions: (spec as any).dimensions,
      capacity: (spec as any).capacity,
      weight: (spec as any).weight,
      fuel: (spec as any).fuel,
      safety: (spec as any).safety,
      customAttributes: (spec as any).customAttributes,
    });
  }

  score += features.filter((f: any) => f.availability !== 'unavailable').length * 2;
  score += colors.filter((c: any) => c.availability !== 'unavailable').length * 2;
  score += markets.filter((m: any) => m.pricing?.amount != null).length * 3;
  score += media.length * 5;
  if (variant.status === 'active') score += 10;

  return score;
};

export const variantPopulateService = {
  /**
   * Find the most complete existing variant for Brand/Model/Generation.
   * Generation is optional: when omitted, only variants without a generation are considered.
   */
  async findTemplate(params: {
    modelId: string;
    generationId?: string | null;
    excludeVariantId?: string;
  }) {
    const { modelId, generationId, excludeVariantId } = params;

    if (!modelId || !Types.ObjectId.isValid(modelId)) {
      throw new AppError('Valid modelId is required', 400);
    }

    const filter: Record<string, any> = {
      modelId,
      status: { $in: ['draft', 'active'] },
    };

    if (generationId) {
      if (!Types.ObjectId.isValid(generationId)) {
        throw new AppError('Valid generationId is required', 400);
      }
      filter.generationId = generationId;
    } else {
      filter.$or = [{ generationId: null }, { generationId: { $exists: false } }];
    }

    if (excludeVariantId && Types.ObjectId.isValid(excludeVariantId)) {
      filter._id = { $ne: excludeVariantId };
    }

    const candidates = await variantRepository.findMany(filter, 0, 100, { updatedAt: -1 });

    if (!candidates.length) {
      return {
        found: false,
        message: 'No existing vehicle found for the selected Brand, Model, and Generation. You can continue entering data manually.',
        sourceVariant: null,
        sourceVariantId: null,
      };
    }

    let best: any = null;
    let bestScore = -1;

    for (const candidate of candidates) {
      const score = await scoreVariantCompleteness(candidate._id.toString(), candidate);
      if (
        score > bestScore ||
        (score === bestScore &&
          best &&
          new Date(candidate.updatedAt).getTime() > new Date(best.updatedAt).getTime())
      ) {
        best = candidate;
        bestScore = score;
      }
    }

    const source = deepClone(best);
    const generationIdValue = idOf(source.generationId) || null;

    return {
      found: true,
      message: `Found existing vehicle "${source.name}" to use as a template.`,
      sourceVariantId: source._id.toString(),
      sourceVariant: {
        modelId: idOf(source.modelId),
        generationId: generationIdValue,
        modelYear: source.modelYear,
        fuelType: source.fuelType,
        transmissionType: source.transmissionType,
        drivetrain: source.drivetrain,
        engine: source.engine ? deepClone(source.engine) : undefined,
        seatingCapacity: source.seatingCapacity,
        doors: source.doors,
        description: source.description,
        shortDescription: source.shortDescription,
        // Intentionally omit name / variantCode / slug / status — unique or user-controlled
        _sourceName: source.name,
        _completenessScore: bestScore,
      },
    };
  },

  /**
   * Copy related catalog data from a source variant onto a newly created target variant.
   * Media files are reused (same url / underlying storage), not re-uploaded.
   */
  async populateFromSource(targetVariantId: string, sourceVariantId: string) {
    if (!Types.ObjectId.isValid(targetVariantId) || !Types.ObjectId.isValid(sourceVariantId)) {
      throw new AppError('Valid target and source variant IDs are required', 400);
    }
    if (targetVariantId === sourceVariantId) {
      throw new AppError('Cannot populate a variant from itself', 400);
    }

    const [target, source] = await Promise.all([
      variantRepository.findById(targetVariantId),
      variantRepository.findById(sourceVariantId),
    ]);

    if (!target) throw new AppError('Target variant not found', 404);
    if (!source) throw new AppError('Source variant not found', 404);

    const summary = {
      specification: false,
      features: 0,
      colors: 0,
      markets: 0,
      media: 0,
    };

    // Specifications (1:1) — deep clone nested objects
    const sourceSpec = await Specification.findOne({ variantId: sourceVariantId }).lean();
    if (sourceSpec) {
      const specPayload = {
        performance: deepClone((sourceSpec as any).performance || {}),
        dimensions: deepClone((sourceSpec as any).dimensions || {}),
        capacity: deepClone((sourceSpec as any).capacity || {}),
        weight: deepClone((sourceSpec as any).weight || {}),
        fuel: deepClone((sourceSpec as any).fuel || {}),
        safety: deepClone((sourceSpec as any).safety || {}),
        customAttributes: deepClone((sourceSpec as any).customAttributes || {}),
        status: (sourceSpec as any).status || 'active',
      };

      const existingSpec = await Specification.findOne({ variantId: targetVariantId });
      if (existingSpec) {
        await specificationRepository.update((existingSpec as any)._id.toString(), specPayload);
      } else {
        await specificationRepository.create({
          variantId: targetVariantId,
          ...specPayload,
        });
      }
      summary.specification = true;
    }

    // Features
    const sourceFeatures = await variantFeatureRepository.findByVariantId(sourceVariantId);
    for (const mapping of sourceFeatures) {
      const featureId = idOf((mapping as any).featureId);
      if (!featureId) continue;

      const existing = await variantFeatureRepository.findByVariantAndFeature(
        targetVariantId,
        featureId,
      );

      const payload = {
        availability: (mapping as any).availability,
        value: (mapping as any).value,
        status: (mapping as any).status || 'active',
      };

      if (existing) {
        await variantFeatureRepository.update((existing as any)._id.toString(), payload);
      } else {
        await variantFeatureRepository.create({
          variantId: targetVariantId,
          featureId,
          ...payload,
        });
      }
      summary.features += 1;
    }

    // Colors
    const sourceColors = await variantColorRepository.findByVariantId(sourceVariantId);
    for (const mapping of sourceColors) {
      const colorId = idOf((mapping as any).colorId);
      if (!colorId) continue;

      const existing = await variantColorRepository.findByVariantAndColor(
        targetVariantId,
        colorId,
      );

      const payload = {
        availability: (mapping as any).availability,
        status: (mapping as any).status || 'active',
      };

      if (existing) {
        await variantColorRepository.update((existing as any)._id.toString(), payload);
      } else {
        await variantColorRepository.create({
          variantId: targetVariantId,
          colorId,
          ...payload,
        });
      }
      summary.colors += 1;
    }

    // Markets / pricing
    const sourceMarkets = await VariantMarket.find({
      variantId: sourceVariantId,
      status: { $ne: 'inactive' },
    }).lean();

    for (const mapping of sourceMarkets) {
      const marketId = idOf((mapping as any).marketId);
      if (!marketId) continue;

      const exists = await variantMarketRepository.exists(targetVariantId, marketId);
      if (exists) {
        // Update existing mapping with cloned pricing
        const existingList = await variantMarketRepository.findAll({
          variantId: targetVariantId,
          marketId,
          limit: 1,
        } as any);
        const existing = existingList.data?.[0];
        if (existing) {
          await variantMarketRepository.update((existing as any)._id.toString(), {
            availabilityStatus: (mapping as any).availabilityStatus,
            status: (mapping as any).status || 'active',
            isFeatured: (mapping as any).isFeatured,
            launchDate: (mapping as any).launchDate,
            discontinuedDate: (mapping as any).discontinuedDate,
            pricing: (mapping as any).pricing
              ? deepClone((mapping as any).pricing)
              : undefined,
          });
        }
      } else {
        await variantMarketRepository.create({
          variantId: targetVariantId,
          marketId,
          availabilityStatus: (mapping as any).availabilityStatus,
          status: (mapping as any).status || 'active',
          isFeatured: (mapping as any).isFeatured,
          launchDate: (mapping as any).launchDate,
          discontinuedDate: (mapping as any).discontinuedDate,
          pricing: (mapping as any).pricing
            ? deepClone((mapping as any).pricing)
            : undefined,
        });
      }
      summary.markets += 1;
    }

    // Media — reuse existing files/URLs (no re-upload, no new storage objects)
    const sourceMedia = await mediaRepository.findByEntity('variant', sourceVariantId);
    for (const media of sourceMedia) {
      const linked = await mediaService.linkExistingMediaToEntity(
        media._id.toString(),
        'variant',
        targetVariantId,
      );
      if (linked) summary.media += 1;
    }

    return {
      targetVariantId,
      sourceVariantId,
      summary,
    };
  },
};
