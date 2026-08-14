import { Router } from 'express';
import multer from 'multer';
import { mediaController } from './media.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { createMediaSchema, updateMediaSchema, mediaQuerySchema } from './media.validation';
import { AppError } from '../../middlewares/error.middleware';

export const mediaRoutes = Router();

// Configure multer (memory storage since local storage provider writes to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // We only allow images initially, but video might be sent. We check mimetype.
    if (file.mimetype.startsWith('image/')) {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new AppError('Only JPEG, PNG and WEBP images are allowed', 400));
      }
    } else {
      cb(new AppError('Unsupported file type', 400));
    }
  },
});

// Public routes
mediaRoutes.get('/', validate(mediaQuerySchema as any), mediaController.getMediaList);
mediaRoutes.get('/:id', mediaController.getMediaById);

// Protected routes
mediaRoutes.use(authenticate, authorize('admin', 'editor'));

// We use multer first, then validate the body via Zod
mediaRoutes.post(
  '/',
  upload.single('file'),
  validate(createMediaSchema as any),
  mediaController.uploadMedia,
);

mediaRoutes.patch('/:id', validate(updateMediaSchema as any), mediaController.updateMedia);
mediaRoutes.delete('/:id', mediaController.deleteMedia);

export default mediaRoutes;
