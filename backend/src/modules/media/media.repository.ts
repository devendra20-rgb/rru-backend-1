import { Media } from './media.model';
import { IMedia, MediaQuery } from './media.types';

export class MediaRepository {
  async create(data: Partial<IMedia>): Promise<IMedia> {
    const media = new Media(data);
    return media.save();
  }

  async findById(id: string): Promise<IMedia | null> {
    return Media.findById(id);
  }

  async findAll(query: MediaQuery): Promise<{ data: IMedia[]; total: number }> {
    const { page = 1, limit = 10, sortBy = 'sortOrder', sortOrder = 'asc', ...filters } = query;

    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Default to active unless specified
    if (!filters.status) {
      filters.status = 'active';
    }

    const [data, total] = await Promise.all([
      Media.find(filters as any)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Media.countDocuments(filters as any),
    ]);

    return { data, total };
  }

  async update(id: string, data: Partial<IMedia>): Promise<IMedia | null> {
    return Media.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<IMedia | null> {
    return Media.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
  }

  async unsetPrimary(entityType: string, entityId: string): Promise<void> {
    await Media.updateMany({ entityType, entityId, isPrimary: true } as any, {
      $set: { isPrimary: false },
    });
  }

  async findPrimary(entityType: string, entityId: string): Promise<IMedia | null> {
    return Media.findOne({ entityType, entityId, status: 'active', isPrimary: true } as any);
  }

  async findByEntity(entityType: string, entityId: string): Promise<IMedia[]> {
    return Media.find({ entityType, entityId, status: 'active' } as any).sort({ sortOrder: 1 });
  }
}

export const mediaRepository = new MediaRepository();
