export type TabType = 'social' | 'news' | 'updates' | 'market';

export interface TabItem {
  id: TabType;
  label: string;
  icon: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  image?: string;
}

export interface UpdateItem {
  id: string;
  version: string;
  changes: string[];
  date: string;
  type: 'major' | 'minor' | 'patch';
}

export interface MarketItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'themes' | 'emojis' | 'sounds' | 'effects';
  isNew?: boolean;
  isFeatured?: boolean;
}
