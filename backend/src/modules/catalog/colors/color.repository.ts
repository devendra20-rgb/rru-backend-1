import { Types } from 'mongoose';
import { Color, VariantColor } from './color.model';
import { Variant } from '../variants/variant.model';
import {
  IColor,
  IVariantColor,
  CreateColorDTO,
  UpdateColorDTO,
  CreateVariantColorDTO,
  UpdateVariantColorDTO,
  ColorQuery,
  VariantColorQuery,
} from './color.types';

class ColorRepository {
  async create(data: CreateColorDTO & { slug: string }): Promise<IColor> {
    const color = new Color(data);
    return color.save();
  }

  async findById(id: string): Promise<IColor | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Color.findById(id);
  }

  async findBySlug(slug: string): Promise<IColor | null> {
    return Color.findOne({ slug });
  }

  async findByColorCode(colorCode: string): Promise<IColor | null> {
    return Color.findOne({ colorCode: colorCode.trim().toUpperCase() });
  }

  async findByName(name: string): Promise<IColor | null> {
    return Color.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  }

  async count(filter: Record<string, any>): Promise<number> {
    return Color.countDocuments(filter);
  }

  async findAll(query: ColorQuery): Promise<{ data: IColor[]; total: number }> {
    const { page = 1, limit = 10, type, status, search } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { colorCode: { $regex: search, $options: 'i' } },
        { colorFamily: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      Color.find(filter).skip(skip).limit(limit).sort({ type: 1, name: 1 }),
      this.count(filter),
    ]);

    return { data, total };
  }

  async update(id: string, data: UpdateColorDTO & { slug?: string }): Promise<IColor | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    if (data.colorCode === undefined && 'colorCode' in data) {
      const updateQuery: any = { ...data };
      delete updateQuery.colorCode;
      return Color.findByIdAndUpdate(
        id,
        { $set: updateQuery, $unset: { colorCode: 1 } },
        { new: true, runValidators: true },
      );
    }
    return Color.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<IColor | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Color.findByIdAndUpdate(id, { status: 'inactive' }, { new: true, runValidators: true });
  }
}

class VariantColorRepository {
  async create(data: CreateVariantColorDTO): Promise<IVariantColor> {
    const variantIdObj = new Types.ObjectId(data.variantId);
    const colorIdObj = new Types.ObjectId(data.colorId);

    const variant = await Variant.findById(variantIdObj);
    if (!variant) throw new Error('Variant not found');

    if (!variant.colors) variant.colors = [];

    const existingIndex = variant.colors.findIndex(
      (c: any) => c.colorId.toString() === data.colorId.toString(),
    );

    const isBase = data.isBaseColor ?? (data.availability === 'standard');

    if (existingIndex >= 0) {
      if (data.imageUrl !== undefined) variant.colors[existingIndex].imageUrl = data.imageUrl;
      variant.colors[existingIndex].isBaseColor = isBase;
      if (data.extraPrice !== undefined) variant.colors[existingIndex].extraPrice = data.extraPrice;
      if (data.status !== undefined) variant.colors[existingIndex].status = data.status;
    } else {
      variant.colors.push({
        colorId: colorIdObj,
        imageUrl: data.imageUrl || '',
        isBaseColor: isBase,
        extraPrice: data.extraPrice ?? 0,
        status: data.status || 'active',
      });
    }

    await Variant.findByIdAndUpdate(variantIdObj, { colors: variant.colors });

    const colorDoc = await Color.findById(data.colorId).lean();
    const availability = data.availability || (isBase ? 'standard' : (data.extraPrice && data.extraPrice > 0 ? 'optional' : 'standard'));

    return {
      _id: colorDoc?._id || colorIdObj,
      variantId: variantIdObj,
      colorId: colorDoc || (colorIdObj as any),
      availability,
      imageUrl: data.imageUrl || '',
      isBaseColor: isBase,
      extraPrice: data.extraPrice ?? 0,
      status: data.status || 'active',
    } as any;
  }

  async findById(id: string): Promise<IVariantColor | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const colorDoc = await Color.findById(id).lean();
    if (!colorDoc) return null;
    return {
      _id: colorDoc._id,
      variantId: new Types.ObjectId(),
      colorId: colorDoc,
      availability: 'standard',
      imageUrl: null,
      isBaseColor: false,
      extraPrice: 0,
      status: 'active',
    } as any;
  }

  async findByVariantAndColor(variantId: string, colorId: string): Promise<IVariantColor | null> {
    if (!Types.ObjectId.isValid(variantId) || !Types.ObjectId.isValid(colorId)) return null;
    const variant = await Variant.findById(variantId).lean();
    if (!variant) return null;

    const embColor = (variant.colors || []).find((c: any) => c.colorId.toString() === colorId.toString());
    if (embColor) {
      const colorDoc = await Color.findById(colorId).lean();
      if (!colorDoc || colorDoc.status === 'inactive') return null;

      const availability = (embColor as any).availability || (embColor.isBaseColor ? 'standard' : ((embColor.extraPrice ?? 0) > 0 ? 'optional' : 'standard'));

      return {
        _id: colorDoc._id,
        variantId: new Types.ObjectId(variantId),
        colorId: colorDoc,
        availability,
        imageUrl: embColor.imageUrl || null,
        isBaseColor: embColor.isBaseColor ?? false,
        extraPrice: embColor.extraPrice ?? 0,
        status: embColor.status || 'active',
      } as any;
    }

    // Fallback: check legacy variantcolors collection
    const legacyColor = await VariantColor.findOne({
      variantId: new Types.ObjectId(variantId),
      colorId: new Types.ObjectId(colorId),
      status: { $ne: 'inactive' },
    }).lean();

    if (!legacyColor || legacyColor.availability === 'unavailable') return null;

    const colorDoc = await Color.findById(colorId).lean();
    if (!colorDoc || colorDoc.status === 'inactive') return null;

    const availability = (legacyColor as any).availability || ((legacyColor as any).isBaseColor ? 'standard' : (((legacyColor as any).extraPrice ?? 0) > 0 ? 'optional' : 'standard'));

    return {
      _id: colorDoc._id,
      variantId: new Types.ObjectId(variantId),
      colorId: colorDoc,
      availability,
      imageUrl: (legacyColor as any).imageUrl || null,
      isBaseColor: (legacyColor as any).isBaseColor ?? false,
      extraPrice: (legacyColor as any).extraPrice ?? 0,
      status: legacyColor.status || 'active',
    } as any;
  }

  async count(filter: Record<string, any>): Promise<number> {
    return Color.countDocuments(filter);
  }

  async findAll(query: VariantColorQuery): Promise<{ data: IVariantColor[]; total: number }> {
    const { page = 1, limit = 10, variantId } = query;
    if (variantId) {
      const allVariantColors = await this.findByVariantId(variantId);
      const skip = (page - 1) * limit;
      return {
        data: allVariantColors.slice(skip, skip + limit),
        total: allVariantColors.length,
      };
    }

    const skip = (page - 1) * limit;
    const variants = await Variant.find({ 'colors.0': { $exists: true } }).lean();

    let all: IVariantColor[] = [];
    for (const v of variants) {
      const vcList = await this.findByVariantId(v._id.toString());
      all.push(...vcList);
    }

    return {
      data: all.slice(skip, skip + limit),
      total: all.length,
    };
  }

  async findByVariantId(variantId: string): Promise<IVariantColor[]> {
    if (!Types.ObjectId.isValid(variantId)) return [];
    const variant = await Variant.findById(variantId).lean();
    if (!variant) return [];

    const result: IVariantColor[] = [];
    const embeddedColorIdSet = new Set<string>();

    // 1. Primary: Embedded colors
    if (variant.colors && variant.colors.length > 0) {
      const activeEmbColors = variant.colors.filter((c: any) => c.status !== 'inactive');
      const colorIds = activeEmbColors.map((c: any) => c.colorId);
      const colorDocs = await Color.find({ _id: { $in: colorIds }, status: 'active' }).lean();
      const colorDocMap = new Map<string, any>(colorDocs.map((cd: any) => [cd._id.toString(), cd]));

      for (const emb of activeEmbColors) {
        const cIdStr = emb.colorId.toString();
        const cDoc = colorDocMap.get(cIdStr);
        if (cDoc) {
          embeddedColorIdSet.add(cIdStr);
          const availability = (emb as any).availability || (emb.isBaseColor ? 'standard' : ((emb.extraPrice ?? 0) > 0 ? 'optional' : 'standard'));
          result.push({
            _id: cDoc._id,
            variantId: new Types.ObjectId(variantId),
            colorId: cDoc,
            availability,
            imageUrl: emb.imageUrl || null,
            isBaseColor: emb.isBaseColor ?? false,
            extraPrice: emb.extraPrice ?? 0,
            status: emb.status || 'active',
          } as any);
        }
      }
    }

    // 2. Fallback: Legacy variantcolors for any color not already in embedded
    const legacyColors = await VariantColor.find({
      variantId: new Types.ObjectId(variantId),
      status: { $ne: 'inactive' },
      availability: { $ne: 'unavailable' },
    }).lean();

    if (legacyColors.length > 0) {
      const missingColorIds = legacyColors
        .filter((lc: any) => lc.colorId && !embeddedColorIdSet.has(lc.colorId.toString()))
        .map((lc: any) => lc.colorId);

      if (missingColorIds.length > 0) {
        const legacyColorDocs = await Color.find({ _id: { $in: missingColorIds }, status: 'active' }).lean();
        const legacyColorDocMap = new Map<string, any>(legacyColorDocs.map((cd: any) => [cd._id.toString(), cd]));

        for (const lc of legacyColors) {
          if (!lc.colorId) continue;
          const cIdStr = lc.colorId.toString();
          if (embeddedColorIdSet.has(cIdStr)) continue;

          const cDoc = legacyColorDocMap.get(cIdStr);
          if (cDoc) {
            embeddedColorIdSet.add(cIdStr);
            const availability = (lc as any).availability || ((lc as any).isBaseColor ? 'standard' : (((lc as any).extraPrice ?? 0) > 0 ? 'optional' : 'standard'));
            result.push({
              _id: cDoc._id,
              variantId: new Types.ObjectId(variantId),
              colorId: cDoc,
              availability,
              imageUrl: (lc as any).imageUrl || null,
              isBaseColor: (lc as any).isBaseColor ?? false,
              extraPrice: (lc as any).extraPrice ?? 0,
              status: lc.status || 'active',
            } as any);
          }
        }
      }
    }

    return result;
  }

  async update(id: string, data: UpdateVariantColorDTO): Promise<IVariantColor | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const colorDoc = await Color.findById(id).lean();
    if (!colorDoc) return null;
    const availability = data.availability || (data.isBaseColor ? 'standard' : (data.extraPrice && data.extraPrice > 0 ? 'optional' : 'standard'));
    return {
      _id: colorDoc._id,
      variantId: new Types.ObjectId(),
      colorId: colorDoc,
      availability,
      imageUrl: data.imageUrl || null,
      isBaseColor: data.isBaseColor ?? false,
      extraPrice: data.extraPrice ?? 0,
      status: data.status || 'active',
    } as any;
  }

  async delete(id: string): Promise<IVariantColor | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const colorIdObj = new Types.ObjectId(id);
    await Variant.updateMany({}, { $pull: { colors: { colorId: colorIdObj } } });
    const colorDoc = await Color.findById(id).lean();
    if (!colorDoc) return null;
    return {
      _id: colorDoc._id,
      variantId: new Types.ObjectId(),
      colorId: colorDoc,
      imageUrl: null,
      isBaseColor: false,
      extraPrice: 0,
      status: 'inactive',
    } as any;
  }

  async bulkUpsert(
    variantId: string,
    items: Array<{
      colorId: string;
      availability?: 'standard' | 'optional' | 'unavailable';
      isBaseColor?: boolean;
      imageUrl?: string;
      extraPrice?: number;
      status?: 'active' | 'inactive';
    }>,
  ): Promise<{ upserted: number; modified: number }> {
    if (items.length === 0) return { upserted: 0, modified: 0 };

    const variant = await Variant.findById(variantId);
    if (!variant) return { upserted: 0, modified: 0 };

    if (!variant.colors) variant.colors = [];

    for (const item of items) {
      const cStr = item.colorId.toString();

      if (item.availability === 'unavailable') {
        variant.colors = variant.colors.filter((c: any) => c.colorId.toString() !== cStr);
        continue;
      }

      const existingIndex = variant.colors.findIndex((c: any) => c.colorId.toString() === cStr);
      const isBase = item.isBaseColor ?? (item.availability === 'standard');

      if (existingIndex >= 0) {
        if (item.imageUrl !== undefined) variant.colors[existingIndex].imageUrl = item.imageUrl;
        if (item.isBaseColor !== undefined) variant.colors[existingIndex].isBaseColor = item.isBaseColor;
        else if (item.availability !== undefined) variant.colors[existingIndex].isBaseColor = isBase;
        if (item.extraPrice !== undefined) variant.colors[existingIndex].extraPrice = item.extraPrice;
        if (item.status !== undefined) variant.colors[existingIndex].status = item.status;
      } else {
        variant.colors.push({
          colorId: new Types.ObjectId(item.colorId),
          imageUrl: item.imageUrl || '',
          isBaseColor: isBase,
          extraPrice: item.extraPrice ?? 0,
          status: item.status || 'active',
        });
      }
    }

    await Variant.findByIdAndUpdate(variantId, { colors: variant.colors });

    return {
      upserted: items.length,
      modified: items.length,
    };
  }
}

export const colorRepository = new ColorRepository();
export const variantColorRepository = new VariantColorRepository();
