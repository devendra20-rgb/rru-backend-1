import crypto from 'crypto';
import { UserRepository } from '../users/user.repository';
import { RefreshToken } from './refresh-token.model';
import { LoginInput, AuthResponse } from './auth.types';
import { AppError } from '../../middlewares/error.middleware';
import { comparePasswords } from '../../utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { env } from '../../config/env';

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    const { email, username, password } = data;

    let user;
    if (email) {
      user = await this.userRepository.findByEmailWithPassword(email);
    } else if (username) {
      user = await this.userRepository.findByUsernameWithPassword(username);
    }

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (user.status !== 'active') {
      throw new AppError('User account is inactive', 403);
    }

    const isMatch = await comparePasswords(password, user.password as string);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save hashed refresh token
    const tokenHash = this.hashToken(refreshToken);
    // Refresh tokens expire in 7d by default based on JWT_REFRESH_EXPIRES_IN. We can parse it or just add 7 days.
    // For simplicity, add 7 days as standard fallback or use standard Date logic.
    const expiresInDays = parseInt(String(env.JWT_REFRESH_EXPIRES_IN).replace(/[^0-9]/g, '')) || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    await RefreshToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refresh(token: string): Promise<AuthResponse> {
    try {
      const decoded = verifyRefreshToken(token);
      const tokenHash = this.hashToken(token);

      const storedToken = await RefreshToken.findOne({ tokenHash });
      if (!storedToken) {
        throw new AppError('Invalid refresh token', 401);
      }

      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new AppError('User no longer exists', 401);
      }

      if (user.status !== 'active') {
        throw new AppError('User account is inactive', 403);
      }

      // Rotate token: delete old one
      await RefreshToken.deleteOne({ _id: storedToken._id });

      const payload = { userId: user._id.toString(), role: user.role };
      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      const newTokenHash = this.hashToken(newRefreshToken);
      const expiresInDays =
        parseInt(String(env.JWT_REFRESH_EXPIRES_IN).replace(/[^0-9]/g, '')) || 7;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      await RefreshToken.create({
        userId: user._id,
        tokenHash: newTokenHash,
        expiresAt,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  async logout(token: string): Promise<void> {
    if (!token) return;
    try {
      const tokenHash = this.hashToken(token);
      await RefreshToken.deleteOne({ tokenHash });
    } catch (error) {
      // Ignore errors on logout
    }
  }
}
