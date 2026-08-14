import { Types } from 'mongoose';
import { Color, VariantColor } from './color.model';
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
      filter.$or = [{ name: { $regex: search, $options: 'i' } }];
    }

    const [data, total] = await Promise.all([
      Color.find(filter).skip(skip).limit(limit).sort({ type: 1, name: 1 }),
      this.count(filter),
    ]);

    return { data, total };
  }

  async update(id: string, data: UpdateColorDTO & { slug?: string }): Promise<IColor | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Color.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<IColor | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Color.findByIdAndUpdate(id, { status: 'inactive' }, { new: true, runValidators: true });
  }
}

class VariantColorRepository {
  async create(data: CreateVariantColorDTO): Promise<IVariantColor> {
    const variantColor = new VariantColor(data);
    return variantColor.save();
  }

  async findById(id: string): Promise<IVariantColor | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return VariantColor.findById(id).populate('colorId');
  }

  async findByVariantAndColor(variantId: string, colorId: string): Promise<IVariantColor | null> {
    if (!Types.ObjectId.isValid(variantId) || !Types.ObjectId.isValid(colorId)) return null;
    return VariantColor.findOne({ variantId, colorId }).populate('colorId');
  }

  async count(filter: Record<string, any>): Promise<number> {
    return VariantColor.countDocuments(filter);
  }

  async findAll(query: VariantColorQuery): Promise<{ data: IVariantColor[]; total: number }> {
    const { page = 1, limit = 10, variantId, colorId, availability, status } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (variantId) filter.variantId = variantId;
    if (colorId) filter.colorId = colorId;
    if (availability) filter.availability = availability;
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      VariantColor.find(filter).populate('colorId').skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.count(filter),
    ]);

    return { data, total };
  }

  async findByVariantId(variantId: string): Promise<IVariantColor[]> {
    if (!Types.ObjectId.isValid(variantId)) return [];
    return VariantColor.find({ variantId, status: 'active' })
      .populate('colorId')
      .sort({ createdAt: -1 });
  }

  async update(id: string, data: UpdateVariantColorDTO): Promise<IVariantColor | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return VariantColor.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate(
      'colorId',
    );
  }

  async delete(id: string): Promise<IVariantColor | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return VariantColor.findByIdAndUpdate(
      id,
      { status: 'inactive' },
      { new: true, runValidators: true },
    ).populate('colorId');
  }
}

export const colorRepository = new ColorRepository();
export const variantColorRepository = new VariantColorRepository();
