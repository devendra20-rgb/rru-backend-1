import { Router } from 'express';
import { CarsController } from './cars.controller';
import { CarsService } from './cars.service';
import { validate } from '../../../middlewares/validate.middleware';
import { getCarsQuerySchema, getCarDetailSchema } from './cars.validation';

const router = Router();
const carsService = new CarsService();
const carsController = new CarsController(carsService);

// Public APIs, no authentication required
router.get('/', validate(getCarsQuerySchema), carsController.getCarsListing);

router.get('/featured', validate(getCarsQuerySchema), carsController.getFeaturedCars);

router.get('/:slug', validate(getCarDetailSchema), carsController.getCarDetail);

export default router;
