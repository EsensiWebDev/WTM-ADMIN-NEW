import { SearchParams } from "@/types";

export type PromoType =
  | "discount"
  | "fixed_price"
  | "room_upgrade"
  | "benefits";

export interface Promo {
  duration: number;
  id: number;
  is_active: boolean;
  promo_code: string;
  promo_description: string;
  promo_detail: PromoDetail;
  promo_end_date: string;
  promo_name: string;
  promo_start_date: string;
  promo_type: string;
}

interface PromoDetail {
  benefit_note: string;
  discount_percentage: number;
  fixed_price: number;
  upgraded_to_id: number;
}

export interface PromoDetailId {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  code: string;
  description: string;
  promo_type_id: number;
  detail: PromoDetail;
  is_active: boolean;
  promo_type_name: string;
  promo_groups: Array<{ name: string; id: number }>;
  promo_room_types: Array<{
    room_type_id: number;
    room_type_name: string;
    total_nights: number;
    hotel_id: number;
    hotel_name: string;
  }>;
}

export interface PromoPageProps {
  searchParams: Promise<SearchParams>;
}
