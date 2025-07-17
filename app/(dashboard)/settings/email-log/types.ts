import { SearchParams } from "@/types";

export type EmailStatus = "success" | "failed";

export interface EmailLog {
  date: string; // ISO string
  hotel_name: string;
  status: EmailStatus;
  notes?: string; // Optional, can be empty
}

export interface EmailLogTableResponse {
  success: boolean;
  data: EmailLog[];
  page_count: number;
}

export interface EmailLogPageProps {
  searchParams: Promise<SearchParams>;
}
