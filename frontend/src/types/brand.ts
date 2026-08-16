// Brand type
export interface Brand {
  _id: string;
  brandCode: string;
  name: string;
  slug: string;
  originCountryCode?: string;
  logoUrl?: string;
  status: 'active' | 'inactive';
  modelCount?: number;
}
