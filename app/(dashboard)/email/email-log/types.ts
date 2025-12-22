import { SearchParams } from "@/types";

export interface EmailLog {
  id?: number;
  date_time: string; // ISO string
  hotel_name: string;
  email_type: string;
  status: string;
  notes: string; // Optional, can be empty
  booking_code?: string; // Optional, only present for booking-related emails
  to?: string;
  subject?: string;
  body?: string;
}

export interface EmailLogDetail extends EmailLog {
  id: number;
  to: string;
  subject: string;
  body: string;
  created_at?: string;
}

export interface EmailLogPageProps {
  searchParams: Promise<SearchParams>;
}
