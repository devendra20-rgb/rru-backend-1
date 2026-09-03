import { Document, Types } from 'mongoose';

export type FuelType =
  'petrol' | 'diesel' | 'hybrid' | 'plug_in_hybrid' | 'electric' | 'cng' | 'lpg' | 'other';

export type TransmissionType = 'manual' | 'automatic' | 'cvt' | 'dct' | 'amt' | 'other';

export type Drivetrain = 'fwd' | 'rwd' | 'awd' | '4wd' | 'other';

export interface IEngine {
  displacementCc?: number;
  cylinders?: number;
  aspiration?: string;
  powerHp?: number;
  torqueNm?: number;
}

export interface IVariant extends Document {
  modelId: Types.ObjectId;
  generationId?: Types.ObjectId | null;
  variantCode: string;
  name: string;
  slug: string;

  description?: string;
  shortDescription?: string;

  modelYear?: number;

  fuelType?: FuelType;
  transmissionType?: TransmissionType;
  drivetrain?: Drivetrain;

  engine?: IEngine;

  seatingCapacity?: number;
  doors?: number;

  status: 'draft' | 'active' | 'inactive';

  createdAt: Date;
  updatedAt: Date;
}
