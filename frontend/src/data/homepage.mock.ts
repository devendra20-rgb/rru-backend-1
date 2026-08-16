import type { Review } from '@/types/review';
import type { Article } from '@/types/article';
import type { Poll } from '@/types/common';
import type { CostToOwnBreakdown, SegmentComparison } from '@/types/cost';

export const reviewsMock: Review[] = [
  {
    _id: 'r1',
    vehicleName: 'Toyota Land Cruiser',
    authorName: 'Ahmad K.',
    authorLocation: 'Dubai',
    isVerified: true,
    rating: 5,
    title: 'The comparison made the decision much easier',
    content: 'The comparison made the decision much easier. I could see the ownership cost instead of looking only at the purchase price.',
    createdAt: '2026-07-20T00:00:00Z',
  },
  {
    _id: 'r2',
    vehicleName: 'BMW X5',
    authorName: 'Sara M.',
    authorLocation: 'Abu Dhabi',
    isVerified: true,
    rating: 5,
    title: 'Very useful comparison',
    content: 'Clean information and easy to understand.',
    createdAt: '2026-07-15T00:00:00Z',
  },
  {
    _id: 'r3',
    vehicleName: 'Nissan Patrol',
    authorName: 'Khalid R.',
    authorLocation: 'Sharjah',
    isVerified: true,
    rating: 4,
    title: 'Good vehicle research',
    content: 'The running-cost view is what stood out.',
    createdAt: '2026-07-10T00:00:00Z',
  },
];

export const articlesMock: Article[] = [
  {
    _id: 'a1',
    title: 'Best 7-Seater SUVs for Family Use',
    slug: 'best-7-seater-suvs-family-use',
    excerpt: 'What to look for beyond price, including running cost and practicality.',
    category: 'buying-guide',
    author: { name: 'RRU Editorial' },
    readingTime: 8,
    publishedAt: '2026-08-01T00:00:00Z',
    status: 'published',
  },
  {
    _id: 'a2',
    title: 'What Changes When You Switch to an EV?',
    slug: 'what-changes-ev-switch',
    excerpt: 'Charging, maintenance and real ownership considerations.',
    category: 'ev',
    author: { name: 'RRU Editorial' },
    readingTime: 6,
    publishedAt: '2026-07-28T00:00:00Z',
    status: 'published',
  },
  {
    _id: 'a3',
    title: 'Latest Cars Entering the UAE Market',
    slug: 'latest-cars-uae-market-2026',
    excerpt: 'A quick look at new launches and important updates.',
    category: 'news',
    author: { name: 'RRU Editorial' },
    readingTime: 5,
    publishedAt: '2026-07-25T00:00:00Z',
    status: 'published',
  },
];

export const pollMock: Poll = {
  _id: 'p1',
  title: 'Land Cruiser vs Patrol',
  optionA: { label: 'Toyota Land Cruiser', votes: 5400, vehicleSlug: 'toyota-land-cruiser-gxr-v6-2026' },
  optionB: { label: 'Nissan Patrol', votes: 4600, vehicleSlug: 'nissan-patrol-le-platinum-2026' },
  totalVotes: 10000,
  isActive: true,
};

export const costToOwnMock: CostToOwnBreakdown = {
  vehicleName: 'Toyota Land Cruiser GXR',
  market: 'UAE',
  annualKm: 15000,
  ownershipYears: 3,
  isFinanced: true,
  monthly: {
    financeDepreciation: 2450,
    insurance: 720,
    fuel: 1420,
    servicing: 410,
    tyres: 95,
    registration: 35,
    tolls: 80,
    total: 4850,
  },
  totalOverPeriod: 174600,
  hiddenCosts: {
    registrationTransfer: 420,
    insuranceYear1: 4680,
    numberPlate: 350,
    bankProcessing: 1850,
    inspection: 350,
    total: 7650,
  },
  assumptions: {
    fuelPrice: 2.9,
    fuelPriceDate: '01 Aug 2026',
    insuranceNote: 'Comprehensive, 30yo, clean record',
    depreciationNote: 'UAE resale data, SUV segment curve',
  },
};

export const segmentComparisonMock: SegmentComparison[] = [
  { vehicleName: 'Toyota Prado', totalCost3Year: 118000, costPerMonth: 3280 },
  { vehicleName: 'Nissan Patrol', totalCost3Year: 138000, costPerMonth: 3830 },
  { vehicleName: 'Land Cruiser GXR', totalCost3Year: 143000, costPerMonth: 3970, isCurrentVehicle: true },
  { vehicleName: 'Jeep Grand Cherokee', totalCost3Year: 171000, costPerMonth: 4750 },
];
