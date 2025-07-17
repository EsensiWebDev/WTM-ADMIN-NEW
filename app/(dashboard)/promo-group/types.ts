import { SearchParams } from "@/types";
import { Promo } from "../promo/types";

export interface Member {
  id: string;
  name: string;
  company: string;
}

export interface PromoGroup {
  id: string;
  name: string;
  members: Member[];
  promos: Promo[];
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
  members: Member[];
  promos: Promo[];
}
