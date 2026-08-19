import type { Brand } from '@/types/brand';

export const brandsMock: Brand[] = [
  { _id: '1', brandCode: 'toyota', name: 'Toyota', slug: 'toyota', originCountryCode: 'JP', logoUrl: '/images/brands/toyota.svg', status: 'active', modelCount: 24 },
  { _id: '2', brandCode: 'nissan', name: 'Nissan', slug: 'nissan', originCountryCode: 'JP', logoUrl: '/images/brands/nissan.svg', status: 'active', modelCount: 18 },
  { _id: '3', brandCode: 'bmw', name: 'BMW', slug: 'bmw', originCountryCode: 'DE', logoUrl: '/images/brands/bmw.svg', status: 'active', modelCount: 22 },
  { _id: '4', brandCode: 'mercedes', name: 'Mercedes-Benz', slug: 'mercedes-benz', originCountryCode: 'DE', logoUrl: '/images/brands/mercedes.svg', status: 'active', modelCount: 26 },
  { _id: '5', brandCode: 'hyundai', name: 'Hyundai', slug: 'hyundai', originCountryCode: 'KR', logoUrl: '/images/brands/hyundai.svg', status: 'active', modelCount: 16 },
  { _id: '6', brandCode: 'kia', name: 'Kia', slug: 'kia', originCountryCode: 'KR', logoUrl: '/images/brands/kia.svg', status: 'active', modelCount: 14 },
  { _id: '7', brandCode: 'audi', name: 'Audi', slug: 'audi', originCountryCode: 'DE', logoUrl: '/images/brands/audi.svg', status: 'active', modelCount: 20 },
  { _id: '8', brandCode: 'lexus', name: 'Lexus', slug: 'lexus', originCountryCode: 'JP', logoUrl: '/images/brands/lexus.svg', status: 'active', modelCount: 12 },
];
