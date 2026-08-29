import { AxiosError } from 'axios';

/**
 * Normalizes unknown errors, Axios errors, Zod errors, and MongoDB errors
 * into a safe, human-readable string suitable for a toast notification.
 */
export const getReadableErrorMessage = (error: unknown): string => {
  // Handle Axios Errors
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<any>;

    // 1. Network / Connection Errors
    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED') {
        return 'The request took too long. Please try again.';
      }
      return 'Unable to connect to the server. Please check your connection and try again.';
    }

    const status = axiosError.response.status;
    const data = axiosError.response.data;

    // 2. HTTP Status Code Handling
    if (status === 401) {
      return 'Your session has expired. Please log in again.';
    }
    
    if (status === 403) {
      return 'You do not have permission to perform this action.';
    }

    if (status === 404) {
      return 'The requested item could not be found.';
    }

    if (status === 429) {
      return 'Too many requests. Please wait a moment and try again.';
    }

    if (status >= 500) {
      return 'Something went wrong on the server. Please try again later.';
    }

    // 3. Backend Structured Errors (400, 409, 422, etc)
    if (data && typeof data === 'object') {
      // If backend sends duplicate key error (MongoDB E11000)
      if (data.code === 11000 || data.message?.includes('E11000') || data.message?.includes('duplicate key') || data.error?.includes('E11000')) {
        return 'An item with this value already exists.';
      }

      // If backend sends Zod/Validation errors in an array
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        return 'Please fix the highlighted fields before saving.';
      }

      // If backend sends a specific error message string
      if (data.error && typeof data.error === 'string') {
        // Strip out Mongo/Zod leak if any
        if (data.error.includes('Mongo') || data.error.includes('ObjectId')) {
           return 'Something went wrong. Please try again.';
        }
        return data.error;
      }

      if (data.message && typeof data.message === 'string') {
        if (data.message.includes('Mongo') || data.message.includes('ObjectId') || data.message.includes('Cast to')) {
           return 'Something went wrong. Please try again.';
        }
        return data.message;
      }
    }

    // Fallback for generic 400s
    if (status === 400) {
      return 'Some of the information provided is invalid. Please check the form and try again.';
    }
  }

  // Handle standard JS Errors
  if (error instanceof Error) {
    // Avoid leaking stack traces or internal names
    if (error.message.includes('Network Error')) {
      return 'Unable to connect to the server. Please try again.';
    }
    if (error.name === 'ZodError' || error.message.includes('validation')) {
      return 'Please fix the highlighted fields before saving.';
    }
    // Only return safe generic messages for standard errors unless explicitly whitelisted
  }

  return 'Something went wrong. Please try again.';
};
