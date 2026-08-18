// Article types
export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  category: ArticleCategory;
  imageUrl?: string;
  author: {
    name: string;
    avatar?: string;
    credentials?: string;
  };
  readingTime?: number;
  relatedVehicles?: string[];
  tags?: string[];
  isSponsored?: boolean;
  publishedAt: string;
  updatedAt?: string;
  status: 'draft' | 'published' | 'archived';
}

export type ArticleCategory = 
  | 'news' 
  | 'buying-guide' 
  | 'ev' 
  | 'ownership' 
  | 'comparison' 
  | 'review';
