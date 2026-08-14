import { Schema, model } from 'mongoose';
import { IColor, IVariantColor } from './color.types';

// Color Schema
const colorSchema = new Schema<IColor>(
  {
    name: {
      type: String,
      required: [true, 'Color name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    hexCode: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Color type is required'],
      enum: {
        values: ['exterior', 'interior'],
        message: '{VALUE} is not a valid color type',
      },
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

colorSchema.index({ slug: 1 }, { unique: true });
colorSchema.index({ type: 1 });
colorSchema.index({ status: 1 });
colorSchema.index({ name: 'text' });

export const Color = model<IColor>('Color', colorSchema);

// VariantColor Schema
const variantColorSchema = new Schema<IVariantColor>(
  {
    variantId: {
      type: Schema.Types.ObjectId,
      ref: 'Variant',
      required: [true, 'Variant ID is required'],
    },
    colorId: {
      type: Schema.Types.ObjectId,
      ref: 'Color',
      required: [true, 'Color ID is required'],
    },
    availability: {
      type: String,
      required: [true, 'Availability is required'],
      enum: {
        values: ['standard', 'optional', 'unavailable'],
        message: '{VALUE} is not a valid availability status',
      },
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

variantColorSchema.index({ variantId: 1 });
variantColorSchema.index({ colorId: 1 });
variantColorSchema.index({ status: 1 });
variantColorSchema.index({ variantId: 1, colorId: 1 }, { unique: true });

export const VariantColor = model<IVariantColor>('VariantColor', variantColorSchema);
