import { SearchParams } from "@/types";

export interface Promo {
  id: string;
  code: string;
  name: string;
  duration: number;
  start_date: string; //ISO string
  end_date: string; //ISO string
  status: boolean;
}

export interface PromoTableResponse {
  success: boolean;
  data: Promo[];
  pageCount: number;
}

export interface PromoPageProps {
  searchParams: Promise<SearchParams>;
}

// Schema for creating a new promo
export interface CreatePromoSchema {
  code: string;
  name: string;
  duration: number;
  start_date: string;
  end_date: string;
  status: boolean;
}

// Schema for editing an existing promo
export interface EditPromoSchema {
  code: string;
  name: string;
  duration: number;
  start_date: string;
  end_date: string;
  status: boolean;
}
