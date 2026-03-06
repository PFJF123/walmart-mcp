export interface WalmartProduct {
  itemId: number;
  name: string;
  salePrice?: number;
  msrp?: number;
  upc?: string;
  categoryPath?: string;
  shortDescription?: string;
  longDescription?: string;
  brandName?: string;
  thumbnailImage?: string;
  mediumImage?: string;
  largeImage?: string;
  productTrackingUrl?: string;
  standardShipRate?: number;
  marketplace?: boolean;
  modelNumber?: string;
  productUrl?: string;
  availableOnline?: boolean;
  stock?: string;
  customerRating?: string;
  numReviews?: number;
  bundle?: boolean;
  addToCartUrl?: string;
  affiliateAddToCartUrl?: string;
  offerType?: string;
  isTwoDayShippingEligible?: boolean;
  size?: string;
  color?: string;
}

export interface SearchResponse {
  query: string;
  sort: string;
  responseGroup: string;
  totalResults: number;
  start: number;
  numItems: number;
  items: WalmartProduct[];
}

export interface TaxonomyCategory {
  id: string;
  name: string;
  path: string;
  children?: TaxonomyCategory[];
}

export interface TaxonomyResponse {
  categories: TaxonomyCategory[];
}

export interface StoreResult {
  no: number;
  name: string;
  streetAddress: string;
  city: string;
  stateProvCode: string;
  zip: string;
  phoneNumber: string;
  coordinates: { lat: number; lon: number };
  distance: number;
}
