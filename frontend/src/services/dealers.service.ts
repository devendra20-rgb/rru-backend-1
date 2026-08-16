import { api, USE_MOCK } from '@/lib/api';
import type { Dealer } from '@/types/common';

const dealersMockData: Dealer[] = [
  {
    _id: 'd1',
    name: 'Al-Futtaim Motors',
    slug: 'al-futtaim-motors',
    location: 'Dubai Festival City & Sheikh Zayed Road',
    city: 'Dubai',
    rating: 4.8,
    responseTime: '< 1 hour',
    listingsCount: 142,
    brands: ['Toyota', 'Lexus', 'Honda'],
    phone: '+971 800 869682',
    isVerified: true,
  },
  {
    _id: 'd2',
    name: 'Arabian Automobiles (AW Rostamani)',
    slug: 'arabian-automobiles',
    location: 'Deira & Sheikh Zayed Road',
    city: 'Dubai',
    rating: 4.7,
    responseTime: '2 hours',
    listingsCount: 98,
    brands: ['Nissan', 'Infiniti', 'Renault'],
    phone: '+971 800 647726',
    isVerified: true,
  },
  {
    _id: 'd3',
    name: 'AGMC (Arabian Gulf Mechanical Centre)',
    slug: 'agmc',
    location: 'Al Quoz, Dubai & Sharjah',
    city: 'Dubai',
    rating: 4.9,
    responseTime: '< 30 mins',
    listingsCount: 64,
    brands: ['BMW', 'MINI', 'Rolls-Royce'],
    phone: '+971 800 2462',
    isVerified: true,
  },
  {
    _id: 'd4',
    name: 'Gargash Enterprises',
    slug: 'gargash-enterprises',
    location: 'Sheikh Zayed Road & Deira',
    city: 'Dubai',
    rating: 4.8,
    responseTime: '1 hour',
    listingsCount: 82,
    brands: ['Mercedes-Benz', 'Alfa Romeo', 'GAC'],
    phone: '+971 800 4274274',
    isVerified: true,
  },
];

export const dealersService = {
  getAll: async (): Promise<Dealer[]> => {
    if (USE_MOCK) return dealersMockData;
    const res = await api.get<{ data: Dealer[] }>('/api/v1/dealers');
    return res.data;
  },

  getBySlug: async (slug: string): Promise<Dealer | undefined> => {
    if (USE_MOCK) return dealersMockData.find((d) => d.slug === slug);
    const res = await api.get<{ data: Dealer }>(`/api/v1/dealers/slug/${slug}`);
    return res.data;
  },
};
