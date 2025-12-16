import { SearchParams } from "@/types";

export type BookingStatus = "confirmed" | "rejected" | "in review";
export type PaymentStatus = "paid" | "unpaid";

export interface DetailPromo {
  name: string;
  promo_code?: string;
  type?: string;
  discount_percent?: number;
  fixed_price?: number;
}

export interface BookingSummary {
  agent_company: string;
  agent_name: string;
  booking_code: string;
  booking_id: number;
  booking_status: BookingStatus;
  detail: BookingSummaryDetail[];
  receipts: string[] | null;
  group_promo: string;
  promo_name?: string | null;
  detail_promo?: DetailPromo;
  guest_name: string[];
  payment_status: PaymentStatus;
}

export interface AdditionalService {
  name: string;
  category: "pax" | "price";
  price: number | null;
  pax: number | null;
  is_required: boolean;
}

export interface BookingSummaryDetail {
  other_preferences?: string[];
  additional?: string[]; // Backward compatible - simple names
  additional_services?: AdditionalService[]; // Detailed info
  booking_status: BookingStatus;
  cancelled_date: string;
  guest_name: string;
  hotel_name: string;
  is_api: boolean;
  payment_status: PaymentStatus;
  additional_notes?: string; // Notes from agent
  admin_notes?: string; // Notes from admin to agent
  promo_code: string;
  promo_id: number;
  sub_booking_id: string;
  invoice: Invoice;
}

export interface BookingSummaryTableResponse {
  success: boolean;
  data: BookingSummary[];
  pageCount: number;
}

export interface BookingSummaryPageProps {
  searchParams: Promise<SearchParams>;
}

export interface Invoice {
  agent: string;
  check_in: string;
  check_out: string;
  company_agent: string;
  description: string;
  description_invoice: DescriptionInvoice[];
  email: string;
  guest: string;
  hotel: string;
  invoice_number: string;
  invoice_date: string;
  promo: Promo;
  sub_booking_id: string;
  total_price: number;
  total_before_promo: number;
}

export interface DescriptionInvoice {
  description: string;
  price: number;
  quantity: number;
  total: number;
  total_before_promo: number;
  unit: string;
}

export interface Promo {
  benefit_note: string;
  discount_percent: number;
  fixed_price: number;
  name: string;
  promo_code: string;
  type: string;
  upgraded_to_id: number;
}
