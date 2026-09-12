import { Types } from 'mongoose';
import { Variant } from '../variants/variant.model';
import { VariantMarket } from '../variant-markets/variant-market.model';
import { Generation } from '../generations/generation.model';
import { VehicleModel } from '../models/model.model';
import { Brand } from '../brands/brand.model';
import { GetCarsQuery, CarListingCard, CarDetailResponse } from './cars.types';
import { AppError } from '../../../middlewares/error.middleware';

export class CarsService {
  async getCarsListing(query: GetCarsQuery): Promise<{ data: CarListingCard[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      brandId,
      brandSlug,
      modelId,
      generationId,
      marketId,
      fuelType,
      transmissionType,
      drivetrain,
      modelYear,
      availabilityStatus,
      isFeatured,
      priceMin,
      priceMax,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const pageNum = Number(query.page) || 1;
    const limitNum = Number(query.limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Resolve brandSlug → brandId (preferred identity filter for public brand pages)
    let resolvedBrandId = brandId;
    if (!resolvedBrandId && brandSlug) {
      const brandDoc = await Brand.findOne({
        slug: brandSlug.toLowerCase().trim(),
        status: 'active',
      })
        .select('_id')
        .lean();
      if (!brandDoc) {
        return { data: [], total: 0 };
      }
      resolvedBrandId = brandDoc._id.toString();
    }

    // 1. Build initial variantMatch with only active variants
    const variantMatch: any = { status: 'active' };

    if (fuelType) variantMatch.fuelType = fuelType;
    if (transmissionType) variantMatch.transmissionType = transmissionType;
    if (drivetrain) variantMatch.drivetrain = drivetrain;
    if (modelYear) variantMatch.modelYear = modelYear;

    // Optional Search via Text or Regex
    if (search) {
      const raw = search.trim();
      const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match both "land-rover" and "Land Rover" style queries
      const flexible = escaped.replace(/[\s-]+/g, '[\\s-]+');
      const regex = new RegExp(flexible, 'i');

      const brands = await Brand.find({
        status: 'active',
        $or: [{ name: regex }, { slug: regex }, { brandCode: regex }],
      })
        .select('_id')
        .lean();
      const brandIds = brands.map((b) => b._id);

      const models = await VehicleModel.find({
        $or: [{ name: regex }, { slug: regex }, { brandId: { $in: brandIds } }],
        status: 'active',
      })
        .select('_id')
        .lean();
      const modelIds = models.map((m) => m._id);

      const generations = await Generation.find({
        $or: [{ name: regex }, { slug: regex }, { modelId: { $in: modelIds } }],
        status: 'active',
      })
        .select('_id')
        .lean();
      const resolvedGenerationIdsFromSearch = generations.map((g) => g._id);

      variantMatch.$or = [
        { name: regex },
        { variantCode: regex },
        { slug: regex },
        { modelId: { $in: modelIds } },
        { generationId: { $in: resolvedGenerationIdsFromSearch } },
      ];
    }

    // 2. Pre-filter by brandId / modelId / generationId
    // Some seeded variants only have generationId (missing modelId) — match both paths.
    if (resolvedBrandId || modelId || generationId) {
      if (generationId) {
        variantMatch.generationId = new Types.ObjectId(generationId);
      } else {
        let modelIdsToSearch: Types.ObjectId[] = [];
        if (modelId) {
          modelIdsToSearch = [new Types.ObjectId(modelId)];
        } else if (resolvedBrandId) {
          const models = await VehicleModel.find({
            brandId: resolvedBrandId,
            status: 'active',
          })
            .select('_id')
            .lean();
          modelIdsToSearch = models.map((m) => m._id);
        }

        if (modelIdsToSearch.length === 0) {
          return { data: [], total: 0 }; // Quick exit if hierarchy gives 0 results
        }

        const generationsForModels = await Generation.find({
          modelId: { $in: modelIdsToSearch },
          status: 'active',
        })
          .select('_id')
          .lean();
        const generationIdsForModels = generationsForModels.map((g) => g._id);

        const brandOrModelFilter = {
          $or: [
            { modelId: { $in: modelIdsToSearch } },
            ...(generationIdsForModels.length
              ? [{ generationId: { $in: generationIdsForModels } }]
              : []),
          ],
        };

        if (variantMatch.$or) {
          variantMatch.$and = [{ $or: variantMatch.$or }, brandOrModelFilter];
          delete variantMatch.$or;
        } else {
          Object.assign(variantMatch, brandOrModelFilter);
        }
      }
    }

    // 3. Pre-filter by market / pricing / featured
    let targetMarketId: Types.ObjectId | null = null;
    if (
      marketId ||
      availabilityStatus ||
      isFeatured !== undefined ||
      priceMin !== undefined ||
      priceMax !== undefined
    ) {
      const vmMatch: any = { status: 'active' };
      if (marketId) {
        targetMarketId = new Types.ObjectId(marketId);
        vmMatch.marketId = targetMarketId;
      }
      if (availabilityStatus) vmMatch.availabilityStatus = availabilityStatus;
      if (isFeatured !== undefined) vmMatch.isFeatured = isFeatured;
      if (priceMin !== undefined || priceMax !== undefined) {
        vmMatch['pricing.amount'] = {};
        if (priceMin !== undefined) vmMatch['pricing.amount'].$gte = priceMin;
        if (priceMax !== undefined) vmMatch['pricing.amount'].$lte = priceMax;
      }

      const matchingVms = await VariantMarket.find(vmMatch).select('variantId').lean();
      if (matchingVms.length === 0) {
        return { data: [], total: 0 }; // Quick exit if no markets match
      }
      const vmVariantIds = matchingVms.map((vm) => vm.variantId);

      if (variantMatch._id) {
        // Intersect if already has _ids (e.g. from search, though we didn't add _ids yet)
        variantMatch._id = { $in: vmVariantIds };
      } else {
        variantMatch._id = { $in: vmVariantIds };
      }
    }

    // 4. Determine Sort Logic
    // If sortBy price is requested, we must sort AFTER lookups unless we do a complex pipeline
    // To keep it simple and efficient: if sortBy is price, we sort after joining the market data
    const isPriceSort = sortBy === 'price';

    // Get total count
    const total = await Variant.countDocuments(variantMatch);

    // Build pipeline
    const pipeline: any[] = [{ $match: variantMatch }];

    // If not sorting by price, apply skip/limit BEFORE lookups (HUGE performance win)
    if (!isPriceSort) {
      pipeline.push({ $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } });
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limitNum });
    }

    // 5. Lookups for parent hierarchy (resolve model via generation when modelId is missing)
    pipeline.push(
      {
        $lookup: {
          from: 'generations',
          localField: 'generationId',
          foreignField: '_id',
          as: 'generation',
        },
      },
      { $unwind: { path: '$generation', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          resolvedModelId: { $ifNull: ['$modelId', '$generation.modelId'] },
        },
      },
      {
        $lookup: {
          from: 'models',
          localField: 'resolvedModelId',
          foreignField: '_id',
          as: 'model',
        },
      },
      { $unwind: '$model' },
      {
        $lookup: {
          from: 'brands',
          localField: 'model.brandId',
          foreignField: '_id',
          as: 'brand',
        },
      },
      { $unwind: '$brand' },
    );

    // 6. Lookup Primary Media
    pipeline.push(
      {
        $lookup: {
          from: 'media',
          let: { vId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$entityType', 'variant'] },
                    { $eq: ['$entityId', '$$vId'] },
                    { $eq: ['$isPrimary', true] },
                    { $eq: ['$status', 'active'] },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: 'primaryMedia',
        },
      },
      { $unwind: { path: '$primaryMedia', preserveNullAndEmptyArrays: true } },
    );

    // 7. Lookup VariantMarkets for Pricing
    // If a marketId is specified, fetch only that market's pricing. Else, fetch any available active market.
    pipeline.push(
      {
        $lookup: {
          from: 'variantmarkets',
          let: { vId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$variantId', '$$vId'] },
                    { $eq: ['$status', 'active'] },
                    ...(targetMarketId ? [{ $eq: ['$marketId', targetMarketId] }] : []),
                    ...(isFeatured !== undefined ? [{ $eq: ['$isFeatured', isFeatured] }] : []),
                  ],
                },
              },
            },
            { $limit: 1 }, // Just take one pricing for listing
          ],
          as: 'marketInfo',
        },
      },
      { $unwind: { path: '$marketInfo', preserveNullAndEmptyArrays: true } },
    );

    // 8. If Price Sort, do it now, then skip/limit
    if (isPriceSort) {
      pipeline.push({
        $sort: {
          'marketInfo.pricing.amount': sortOrder === 'desc' ? -1 : 1,
          createdAt: -1,
        },
      });
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limitNum });
    }

    // 9. Projection
    pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        slug: 1,
        modelYear: 1,
        fuelType: 1,
        transmissionType: 1,
        drivetrain: 1,
        brand: { _id: '$brand._id', name: '$brand.name', slug: '$brand.slug' },
        model: { _id: '$model._id', name: '$model.name', slug: '$model.slug' },
        generation: { _id: '$generation._id', name: '$generation.name', slug: '$generation.slug' },
        primaryMedia: { url: '$primaryMedia.url', altText: '$primaryMedia.altText', colorId: '$primaryMedia.colorId', angleTag: '$primaryMedia.angleTag' },
        pricing: '$marketInfo.pricing',
        availabilityStatus: '$marketInfo.availabilityStatus',
      },
    });

    const data = await Variant.aggregate(pipeline);

    return { data, total };
  }

  async getFeaturedCars(query: GetCarsQuery): Promise<{ data: CarListingCard[]; total: number }> {
    return this.getCarsListing({ ...query, isFeatured: true });
  }

  async getCarDetail(slug: string): Promise<CarDetailResponse> {
    const pipeline: any[] = [
      { $match: { slug, status: 'active' } },
      { $limit: 1 },
      ...this.buildCarDetailPipeline(),
    ];

    const result = await Variant.aggregate(pipeline);

    if (!result || result.length === 0) {
      throw new AppError('Car not found or unavailable', 404);
    }

    return result[0];
  }

  async compareCars(variantIds: string[]): Promise<CarDetailResponse[]> {
    const objectIds = variantIds.map((id) => new Types.ObjectId(id));
    
    const pipeline: any[] = [
      { $match: { _id: { $in: objectIds }, status: 'active' } },
      ...this.buildCarDetailPipeline(),
    ];

    const result = await Variant.aggregate(pipeline);

    if (!result || result.length === 0) {
      throw new AppError('No valid cars found for comparison', 404);
    }

    return result;
  }

  private buildCarDetailPipeline(): any[] {
    return [
      // 1. Hierarchy lookups (resolve model via generation when modelId is missing)
      {
        $lookup: {
          from: 'generations',
          localField: 'generationId',
          foreignField: '_id',
          as: 'generation',
        },
      },
      { $unwind: { path: '$generation', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          resolvedModelId: { $ifNull: ['$modelId', '$generation.modelId'] },
        },
      },
      {
        $lookup: {
          from: 'models',
          localField: 'resolvedModelId',
          foreignField: '_id',
          as: 'model',
        },
      },
      { $unwind: '$model' },
      {
        $lookup: {
          from: 'brands',
          localField: 'model.brandId',
          foreignField: '_id',
          as: 'brand',
        },
      },
      { $unwind: '$brand' },

      // 2. Media lookup (all active media)
      {
        $lookup: {
          from: 'media',
          let: { vId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$entityType', 'variant'] },
                    { $eq: ['$entityId', '$$vId'] },
                    { $eq: ['$status', 'active'] },
                  ],
                },
              },
            },
            { $sort: { sortOrder: 1, isPrimary: -1, createdAt: -1 } },
            {
              $project: {
                _id: 0,
                url: 1,
                mediaType: 1,
                isPrimary: 1,
                sortOrder: 1,
                altText: 1,
                colorId: 1,
                angleTag: 1,
              },
            },
          ],
          as: 'media',
        },
      },

      // 3. Markets lookup
      {
        $lookup: {
          from: 'variantmarkets',
          let: { vId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$variantId', '$$vId'] }, { $eq: ['$status', 'active'] }],
                },
              },
            },
            // Lookup full market details
            {
              $lookup: {
                from: 'markets',
                localField: 'marketId',
                foreignField: '_id',
                as: 'marketDoc',
              },
            },
            { $unwind: '$marketDoc' },
            {
              $project: {
                _id: 0,
                market: {
                  _id: '$marketDoc._id',
                  name: '$marketDoc.name',
                  code: '$marketDoc.marketCode',
                  currencyCode: '$marketDoc.currencyCode',
                },
                availabilityStatus: 1,
                pricing: 1,
                launchDate: 1,
              },
            },
          ],
          as: 'markets',
        },
      },

      // 4. Specifications lookup
      {
        $lookup: {
          from: 'specifications',
          localField: '_id',
          foreignField: 'variantId',
          as: 'specs',
        },
      },
      { $unwind: { path: '$specs', preserveNullAndEmptyArrays: true } },

      // 5. Features lookup
      {
        $lookup: {
          from: 'variantfeatures',
          let: { vId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$variantId', '$$vId'] }, { $eq: ['$status', 'active'] }],
                },
              },
            },
            {
              $lookup: {
                from: 'features',
                localField: 'featureId',
                foreignField: '_id',
                as: 'featureDoc',
              },
            },
            { $unwind: '$featureDoc' },
            {
              $project: {
                _id: 0,
                category: '$featureDoc.category',
                name: '$featureDoc.name',
                availability: 1,
                value: 1,
              },
            },
          ],
          as: 'features',
        },
      },

      // 6. Colors lookup
      {
        $lookup: {
          from: 'variantcolors',
          let: { vId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$variantId', '$$vId'] }, { $eq: ['$status', 'active'] }],
                },
              },
            },
            {
              $lookup: {
                from: 'colors',
                localField: 'colorId',
                foreignField: '_id',
                as: 'colorDoc',
              },
            },
            { $unwind: '$colorDoc' },
            {
              $project: {
                _id: '$colorDoc._id',   // expose the color document ID for media matching
                name: '$colorDoc.name',
                hexCode: '$colorDoc.hexCode',
                type: '$colorDoc.type',
                availability: 1,
              },
            },
          ],
          as: 'colors',
        },
      },

      // 7. Final Detail Projection
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          variantCode: 1,
          description: 1,
          shortDescription: 1,
          modelYear: 1,
          fuelType: 1,
          transmissionType: 1,
          drivetrain: 1,
          engine: 1,
          seatingCapacity: 1,
          doors: 1,
          brand: {
            _id: '$brand._id',
            name: '$brand.name',
            slug: '$brand.slug',
            brandCode: '$brand.brandCode',
          },
          model: {
            _id: '$model._id',
            name: '$model.name',
            slug: '$model.slug',
            bodyType: '$model.bodyType',
            segment: '$model.segment',
          },
          generation: {
            _id: '$generation._id',
            name: '$generation.name',
            slug: '$generation.slug',
            startYear: '$generation.startYear',
            endYear: '$generation.endYear',
          },
          media: 1,
          markets: 1,
          specifications: {
            performance: '$specs.performance',
            dimensions: '$specs.dimensions',
            capacity: '$specs.capacity',
            weight: '$specs.weight',
            fuel: '$specs.fuel',
            safety: '$specs.safety',
          },
          features: 1,
          colors: 1,
        },
      },
    ];
  }

  // Helper removed as we directly filter by modelId now
}
