import { SearchParams } from "@/types";

export type AdditionalServiceCategory = "price" | "pax";

export interface AdditionalService {
  name: string;
  category: AdditionalServiceCategory;
  price?: number; // Only set when category="price"
  pax?: number; // Only set when category="pax"
  is_required: boolean;
}

// For API responses (with ID)
export interface AdditionalServiceWithID extends AdditionalService {
  id: number;
}

// Constants
export const ADDITIONAL_SERVICE_CATEGORIES = {
  PRICE: "price" as const,
  PAX: "pax" as const,
} as const;

export const ADDITIONAL_SERVICE_CATEGORY_OPTIONS = [
  { value: "price", label: "Price" },
  { value: "pax", label: "Pax" },
] as const;

export interface Room {
  name: string;
  price: number;
  price_with_breakfast: number;
}

export interface RoomDetail {
  id: number;
  name: string;
  without_breakfast: {
    price: number;
    is_show: boolean;
  };
  with_breakfast: {
    price: number;
    pax: number;
    is_show: boolean;
  };
  room_size: number;
  max_occupancy: number;
  bed_types: string[];
  is_smoking_room: boolean;
  additional: Array<AdditionalServiceWithID>;
  description: string;
  photos: string[];
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
  room_type?: RoomDetail[];
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
