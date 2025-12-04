import { SearchParams } from "@/types";

export interface EmailLog {
  date_time: string; // ISO string
  hotel_name: string;
  email_type: string;
  status: string;
  notes: string; // Optional, can be empty
}

export interface EmailLogPageProps {
  searchParams: Promise<SearchParams>;
}
