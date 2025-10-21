import { SearchParams } from "@/types";

export interface Room {
  id: string;
  name: string;
  description: string;
  normal_price: number;
  discount_price: number;
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

export interface HotelTableResponse {
  success: boolean;
  data: Hotel[];
  pageCount: number;
}

export interface HotelPageProps {
  searchParams: Promise<SearchParams>;
}
