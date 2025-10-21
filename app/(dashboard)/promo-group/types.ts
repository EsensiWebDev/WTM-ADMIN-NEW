import { SearchParams } from "@/types";
import { Promo } from "../promo/types";

export interface PromoGroup {
  id: string;
  name: string;
}

export interface PromoGroupPromos {
  promo_code: string;
  promo_end_date: string;
  promo_id: number;
  promo_name: string;
  promo_start_date: string;
}

export interface PromoGroupMembers {
  id: number;
  name: string;
  agent_company: string;
}

export interface PromoGroupTableResponse {
  success: boolean;
  data: PromoGroup[];
  pageCount: number;
}

export interface PromoPageProps {
  searchParams: Promise<SearchParams>;
}

// Schema for creating a new promo
export interface CreatePromoGroupSchema {
  name: string;
}

// Schema for editing an existing promo
export interface EditPromoGroupSchema {
  id: string;
  name: string;
  members: PromoGroupMembers[];
  promos: Promo[];
}
