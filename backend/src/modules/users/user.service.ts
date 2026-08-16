import { UserRepository } from './user.repository';
import { CreateUserInput, UpdateUserInput, IUser } from './user.types';
import { AppError } from '../../middlewares/error.middleware';
import { hashPassword, comparePasswords } from '../../utils/hash';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(data: CreateUserInput): Promise<IUser> {
    // Check email
    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new AppError('Email already in use', 409);
    }

    // Check username
    const existingUsername = await this.userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new AppError('Username already in use', 409);
    }

    // Hash password if provided (for admin creation)
    const passwordHash = data.password ? await hashPassword(data.password) : undefined;
    if (!passwordHash) {
      throw new AppError('Password is required', 400);
    }

    const user = await this.userRepository.create({ ...data, password: passwordHash });

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;
    return userObj as IUser;
  }

  async getUserById(id: string): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async getAllUsers(filters: any, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return this.userRepository.findAll(filters, skip, limit);
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (data.email && data.email !== user.email) {
      const existingEmail = await this.userRepository.findByEmail(data.email);
      if (existingEmail) {
        throw new AppError('Email already in use', 409);
      }
    }

    if (data.username && data.username !== user.username) {
      const existingUsername = await this.userRepository.findByUsername(data.username);
      if (existingUsername) {
        throw new AppError('Username already in use', 409);
      }
    }

    const updatedUser = await this.userRepository.update(id, data);
    return updatedUser!;
  }

  async deleteUser(id: string): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const deletedUser = await this.userRepository.softDelete(id);
    return deletedUser!;
  }

  async changePassword(userId: string, currentPass: string, newPass: string): Promise<void> {
    const user = await this.userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await comparePasswords(currentPass, user.password as string);
    if (!isMatch) {
      throw new AppError('Incorrect current password', 400);
    }

    const newHash = await hashPassword(newPass);
    await this.userRepository.updatePassword(userId, newHash);
  }
}
