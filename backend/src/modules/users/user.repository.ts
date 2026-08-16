import { User, IUserDocument } from './user.model';
import { CreateUserInput, UpdateUserInput } from './user.types';

export class UserRepository {
  async create(data: CreateUserInput): Promise<IUserDocument> {
    const user = new User(data);
    return user.save();
  }

  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id);
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email });
  }

  async findByUsername(username: string): Promise<IUserDocument | null> {
    return User.findOne({ username });
  }

  // Used for authentication where password comparison is needed
  async findByEmailWithPassword(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email }).select('+password');
  }

  async findByUsernameWithPassword(username: string): Promise<IUserDocument | null> {
    return User.findOne({ username }).select('+password');
  }

  async findByIdWithPassword(id: string): Promise<IUserDocument | null> {
    return User.findById(id).select('+password');
  }

  async findAll(
    query: any = {},
    skip = 0,
    limit = 10,
  ): Promise<{ users: IUserDocument[]; total: number }> {
    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    return { users, total };
  }

  async update(id: string, data: UpdateUserInput): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDelete(id: string): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(id, { $set: { status: 'inactive' } }, { new: true });
  }

  // To change password specifically
  async updatePassword(id: string, passwordHash: string): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(id, { $set: { password: passwordHash } }, { new: true });
  }
}
