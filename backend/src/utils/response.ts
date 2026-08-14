import { Response } from 'express';

interface SuccessResponse<T> {
  success: true;
  message?: string;
  data?: T;
  meta?: any;
}

interface ErrorResponse {
  success: false;
  message: string;
  errors?: any[];
}

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: any,
) => {
  const response: SuccessResponse<T> = {
    success: true,
    message,
  };
  if (data !== undefined) response.data = data;
  if (meta !== undefined) response.meta = meta;

  return res.status(statusCode).json(response);
};

export const sendError = (res: Response, statusCode: number, message: string, errors?: any[]) => {
  const response: ErrorResponse = {
    success: false,
    message,
  };
  if (errors !== undefined) response.errors = errors;

  return res.status(statusCode).json(response);
};
