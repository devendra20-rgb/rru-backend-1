import { z } from 'zod';
import { Types } from 'mongoose';

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId',
});

const performanceSchema = z.object({
  topSpeedKph: z.number().positive('Top speed must be positive').optional(),
  acceleration0To100Kph: z.number().positive('Acceleration must be positive').optional(),
});

const dimensionsSchema = z.object({
  lengthMm: z.number().positive('Length must be positive').optional(),
  widthMm: z.number().positive('Width must be positive').optional(),
  heightMm: z.number().positive('Height must be positive').optional(),
  wheelbaseMm: z.number().positive('Wheelbase must be positive').optional(),
  groundClearanceMm: z.number().positive('Ground clearance must be positive').optional(),
});

const capacitySchema = z.object({
  bootSpaceLitres: z.number().nonnegative('Boot space cannot be negative').optional(),
  fuelTankLitres: z.number().positive('Fuel tank capacity must be positive').optional(),
});

const weightSchema = z.object({
  kerbWeightKg: z.number().positive('Kerb weight must be positive').optional(),
  grossWeightKg: z.number().positive('Gross weight must be positive').optional(),
});

const fuelSchema = z.object({
  fuelEconomyCity: z.number().positive('Fuel economy must be positive').optional(),
  fuelEconomyHighway: z.number().positive('Fuel economy must be positive').optional(),
  fuelEconomyCombined: z.number().positive('Fuel economy must be positive').optional(),
  economyUnit: z.string().trim().min(1, 'Economy unit cannot be empty').optional(),
});

const safetySchema = z.object({
  airbags: z.number().int().nonnegative('Airbags cannot be negative').optional(),
  abs: z.boolean().optional(),
  tractionControl: z.boolean().optional(),
  stabilityControl: z.boolean().optional(),
  adas: z.boolean().optional(),
  parkingSensors: z.string().trim().optional(),
  camera: z.string().trim().optional(),
});

const electricSchema = z.object({
  batteryCapacity: z.number().positive('Battery capacity must be positive').optional().nullable(),
  usableBatteryCapacity: z.number().positive('Usable battery capacity must be positive').optional().nullable(),
  motorType: z.string().trim().optional().nullable(),
  motorConfiguration: z.string().trim().optional().nullable(),
  wltpRange: z.number().positive('WLTP range must be positive').optional().nullable(),
  drivingRange: z.number().positive('Driving range must be positive').optional().nullable(),
  cityRange: z.number().positive('City range must be positive').optional().nullable(),
  highwayRange: z.number().positive('Highway range must be positive').optional().nullable(),
  batteryVoltage: z.number().positive('Battery voltage must be positive').optional().nullable(),
  acChargingPower: z.number().positive('AC charging power must be positive').optional().nullable(),
  dcChargingPower: z.number().positive('DC charging power must be positive').optional().nullable(),
  acChargingTime: z.number().positive('AC charging time must be positive').optional().nullable(),
  dcChargingTime: z.number().positive('DC charging time must be positive').optional().nullable(),
  chargingPort: z.string().trim().optional().nullable(),
  chargingTime10To80: z.number().positive('10-80% charging time must be positive').optional().nullable(),
  energyConsumption: z.number().positive('Energy consumption must be positive').optional().nullable(),
  regenerativeBraking: z.boolean().optional().nullable(),
  onboardCharger: z.string().trim().optional().nullable(),
  vehicleToLoad: z.boolean().optional().nullable(),
  vehicleToGrid: z.boolean().optional().nullable(),
  heatPump: z.boolean().optional().nullable(),
});

export const createSpecificationSchema = z.object({
  body: z.object({
    variantId: objectIdSchema,
    performance: performanceSchema.optional(),
    dimensions: dimensionsSchema.optional(),
    capacity: capacitySchema.optional(),
    weight: weightSchema.optional(),
    fuel: fuelSchema.optional(),
    safety: safetySchema.optional(),
    electric: electricSchema.optional(),
    customAttributes: z.record(z.string(), z.any()).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const updateSpecificationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    performance: performanceSchema.optional(),
    dimensions: dimensionsSchema.optional(),
    capacity: capacitySchema.optional(),
    weight: weightSchema.optional(),
    fuel: fuelSchema.optional(),
    safety: safetySchema.optional(),
    electric: electricSchema.optional(),
    customAttributes: z.record(z.string(), z.any()).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const getSpecificationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const getSpecificationByVariantSchema = z.object({
  params: z.object({
    variantId: objectIdSchema,
  }),
});

export const getSpecificationsSchema = z.object({
  query: z.object({
    variantId: objectIdSchema.optional(),
    status: z.enum(['active', 'inactive']).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});
