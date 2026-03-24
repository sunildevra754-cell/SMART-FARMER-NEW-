export interface CropListing {
  id: string;
  title: string;
  description: string;
  price: number;
  unit: string;
  location: string;
  sellerId: string;
  sellerName: string;
  imageUrl?: string;
  createdAt: any;
}

export interface MandiPrice {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
}

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
}
