import { SearchParams } from "@/types";

export interface Room {
  name: string;
  price: number;
  price_with_breakfast: number;
}

export interface Hotel {
  id: string;
  name: string;
  region: string;
  email: string;
  status: string;
  is_api: boolean;
  rooms: Room[];
}

export interface HotelDetail {
  id: number;
  name: string;
  province: string;
  city: string;
  sub_district: string;
  description: string;
  photos: Array<string>;
  rating: number;
  email: string;
  facilities: Array<string>;
  nearby_place: Array<{ id: number; name: string; radius: number }>;
  social_media: Array<{ platform: string; link: string }>;
  // room_type: null;
  cancellation_period: number;
  check_in_hour: number;
  check_out_hour: number;
}

export interface HotelTableResponse {
  success: boolean;
  data: Hotel[];
  pageCount: number;
}

export interface HotelPageProps {
  searchParams: Promise<SearchParams>;
}
