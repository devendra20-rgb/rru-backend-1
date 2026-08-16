import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess } from '../../utils/response';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authData = await this.authService.login(req.body);
      sendSuccess(res, 200, 'Login successful', authData);
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authData = await this.authService.refresh(req.body.refreshToken);
      sendSuccess(res, 200, 'Token refreshed successfully', authData);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.authService.logout(req.body.refreshToken);
      sendSuccess(res, 200, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  };
}
