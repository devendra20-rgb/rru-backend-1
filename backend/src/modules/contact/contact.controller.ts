import { Request, Response } from 'express';
import { ContactService } from './contact.service';
import { sendSuccess, sendError } from '../../utils/response';
import { logger } from '../../utils/logger';

export const handleContactSubmit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;
    const result = await ContactService.submitContactForm({ name, email, subject, message });
    sendSuccess(res, 200, result.message, { delivered: true });
  } catch (error: any) {
    if (error.message === 'EMAIL_NOT_CONFIGURED') {
      sendError(
        res,
        503,
        'Email delivery service is currently not configured on the server. Please try again later.',
      );
      return;
    }
    logger.error({ err: error }, 'Contact submission controller error');
    sendError(
      res,
      500,
      error.message || 'Failed to process contact form submission. Please try again later.',
    );
  }
};
