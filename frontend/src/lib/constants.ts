// App-wide constants

export const SITE_NAME = 'RideRoundUp';
export const SITE_TAGLINE = 'Find the right car. Know what it really costs.';
export const SITE_DESCRIPTION =
  'Discover cars, compare real ownership costs and make a better-informed decision — all in one place.';

export const DEFAULT_MARKET = 'UAE';
export const DEFAULT_CITY = 'Dubai';
export const DEFAULT_CURRENCY = 'AED';
export const DEFAULT_LOCALE = 'en';

export const NAV_LINKS = [
  { label: 'New Cars', href: '/new-cars' },
  { label: 'Compare', href: '/compare' },
  { label: 'AI Assistant', href: '/ai-assistant' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'News & Blogs', href: '/news' },
  { label: 'Book a Service', href: '/book-service' },
] as const;

export const FOOTER_LINKS = {
  cars: [
    { label: 'New Cars', href: '/new-cars' },
    { label: 'Compare', href: '/compare' },
    { label: 'Brands', href: '/brands' },
    { label: 'Upcoming Cars', href: '/new-cars?status=upcoming' },
  ],
  discover: [
    { label: 'AI Assistant', href: '/ai-assistant' },
    { label: 'Reviews', href: '/reviews' },
    { label: 'Cost to Own', href: '/cost-to-own' },
    { label: 'News & Blogs', href: '/news' },
  ],
  services: [
    { label: 'Book a Service', href: '/book-service' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Help', href: '/help' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Accessibility', href: '/accessibility' },
  ],
} as const;

export const BROWSE_HUBS = [
  {
    title: 'By Body Type',
    description: 'SUV · Sedan · Hatchback',
    icon: 'car',
    href: '/new-cars?filter=bodyType',
  },
  {
    title: 'By Budget',
    description: 'Under 100k · 150k · 250k',
    icon: 'wallet',
    href: '/new-cars?filter=budget',
  },
  {
    title: 'By Fuel',
    description: 'Petrol · Diesel · Hybrid · EV',
    icon: 'fuel',
    href: '/new-cars?filter=fuel',
  },
  {
    title: 'By Seats',
    description: '5 · 7 · 7+ Seaters',
    icon: 'users',
    href: '/new-cars?filter=seats',
  },
  {
    title: 'By Use Case',
    description: 'Family · City · Off-road',
    icon: 'compass',
    href: '/new-cars?filter=useCase',
  },
  {
    title: 'By Brand',
    description: 'Browse all brands',
    icon: 'building',
    href: '/brands',
  },
] as const;

export const BODY_TYPES = [
  'SUV',
  'Sedan',
  'Hatchback',
  'Coupe',
  'Pickup',
  'Van',
  'Wagon',
  'Convertible',
] as const;

export const FUEL_TYPES = [
  'Petrol',
  'Diesel',
  'Hybrid',
  'Electric',
  'Plug-in Hybrid',
] as const;

export const TRANSMISSIONS = ['Automatic', 'Manual'] as const;

export const BREAKPOINTS = {
  mobile: 390,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;
